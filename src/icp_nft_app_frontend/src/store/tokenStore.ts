import { create } from 'zustand';
import type { RecentlyViewedToken, TokenEntry } from '../types';
import type { LiveTokenData } from '../api/token-prices';
import { fetchAllTokenData } from '../api/token-prices';
import { getAllTokens, FALLBACK_LOGO } from '../api/tokens';

// ---------------------------------------------------------------------------
// localStorage keys
// ---------------------------------------------------------------------------

const WL_KEY = 'token_watchlist';
const RV_KEY = 'recently_viewed_tokens';
const BASELINE_KEY = 'token_price_baseline';
const MAX_RECENT = 20;

// ---------------------------------------------------------------------------
// Rolling 24h-change baseline (localStorage)
// ---------------------------------------------------------------------------

interface PriceSnapshot {
  price: number;
  ts: number;
}

function loadBaseline(): Record<string, PriceSnapshot> {
  try {
    return JSON.parse(localStorage.getItem(BASELINE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveBaseline(b: Record<string, PriceSnapshot>) {
  try {
    localStorage.setItem(BASELINE_KEY, JSON.stringify(b));
  } catch {
    /* quota */
  }
}

// ---------------------------------------------------------------------------
// Module-level polling handle
// ---------------------------------------------------------------------------

let pollingInterval: ReturnType<typeof setInterval> | null = null;

const ICP_CANISTER = 'ryjl3-tyaaa-aaaaa-aaaba-cai';

// ---------------------------------------------------------------------------
// Static metadata map (for merging with live data)
// ---------------------------------------------------------------------------

const staticMetaMap = new Map<string, TokenEntry>();
for (const t of getAllTokens()) {
  staticMetaMap.set(t.canisterId, t);
}

// ---------------------------------------------------------------------------
// Build a TokenEntry from live API data + optional static metadata
// ---------------------------------------------------------------------------

function buildTokenEntry(
  live: LiveTokenData,
  icpPrice: number,
  change24h: number,
  meta?: TokenEntry,
): TokenEntry {
  return {
    // Identity
    id: meta?.id || live.symbol.toLowerCase().replace(/[^a-z0-9]/g, ''),
    name: live.name || meta?.name || live.symbol,
    symbol: live.symbol || meta?.symbol || '???',
    canisterId: live.canisterId,
    standard: meta?.standard || 'ICRC-1',
    logo: live.imageUrl || meta?.logo || FALLBACK_LOGO,
    banner: meta?.banner,
    description:
      meta?.description ||
      `${live.name} (${live.symbol}) is a token on the Internet Computer.`,
    category: meta?.category || 'defi',
    website: meta?.website,
    twitter: meta?.twitter,
    discord: meta?.discord,
    github: meta?.github,
    whitepaper: meta?.whitepaper,
    launchDate: meta?.launchDate,
    verified: meta?.verified || false,

    // Supply
    totalSupply: meta?.totalSupply,
    circulatingSupply: meta?.circulatingSupply,
    maxSupply: meta?.maxSupply,

    // Live pricing
    price: live.price,
    priceICP:
      live.canisterId === ICP_CANISTER
        ? 1
        : icpPrice > 0
          ? live.price / icpPrice
          : 0,
    marketCap: live.marketCap || meta?.marketCap,
    volume24h: live.volume24h || meta?.volume24h,
    change24h,
    allTimeHigh: meta?.allTimeHigh,
    allTimeLow: meta?.allTimeLow,

    // Content
    bulletPoints: meta?.bulletPoints || [],
    tokenomicsDescription: meta?.tokenomicsDescription,
    useCases: meta?.useCases || [],
    team: meta?.team,
    relatedTokenIds: meta?.relatedTokenIds,
  };
}

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

interface TokenStore {
  // --- watchlist + recently viewed ---
  watchlist: string[];
  recentlyViewedTokens: RecentlyViewedToken[];
  toggleWatchlist: (tokenId: string) => void;
  isWatchlisted: (tokenId: string) => boolean;
  addRecentlyViewedToken: (item: RecentlyViewedToken) => void;

  // --- live tokens ---
  pricesLoaded: boolean;
  pricesError: string | null;
  lastFetchedAt: number;
  liveTokens: TokenEntry[];
  liveTokensMap: Record<string, TokenEntry>;

  fetchPrices: () => Promise<void>;
  startPolling: (intervalMs?: number) => void;
  stopPolling: () => void;

  _hydrate: () => void;
}

// ---------------------------------------------------------------------------
// Persist helpers
// ---------------------------------------------------------------------------

function persistWatchlist(ids: string[]) {
  try {
    localStorage.setItem(WL_KEY, JSON.stringify(ids));
  } catch {
    /* quota */
  }
}

function persistRecent(items: RecentlyViewedToken[]) {
  try {
    localStorage.setItem(RV_KEY, JSON.stringify(items));
  } catch {
    /* quota */
  }
}

// ---------------------------------------------------------------------------
// Initial state from static data (UI is never empty)
// ---------------------------------------------------------------------------

const staticTokens = getAllTokens();
const initialMap: Record<string, TokenEntry> = {};
for (const t of staticTokens) initialMap[t.id] = t;

// Also index by canisterId for lookups
for (const t of staticTokens) initialMap[t.canisterId] = t;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useTokenStore = create<TokenStore>((set, get) => ({
  // --- watchlist ---
  watchlist: [],
  recentlyViewedTokens: [],

  toggleWatchlist: (tokenId) => {
    const list = get().watchlist;
    const next = list.includes(tokenId)
      ? list.filter((id) => id !== tokenId)
      : [...list, tokenId];
    set({ watchlist: next });
    persistWatchlist(next);
  },

  isWatchlisted: (tokenId) => get().watchlist.includes(tokenId),

  addRecentlyViewedToken: (item) => {
    const filtered = get().recentlyViewedTokens.filter((r) => r.id !== item.id);
    const next = [item, ...filtered].slice(0, MAX_RECENT);
    set({ recentlyViewedTokens: next });
    persistRecent(next);
  },

  // --- live tokens ---
  pricesLoaded: false,
  pricesError: null,
  lastFetchedAt: 0,
  liveTokens: staticTokens,
  liveTokensMap: initialMap,

  fetchPrices: async () => {
    try {
      const liveData = await fetchAllTokenData();
      if (liveData.length === 0) return; // keep stale data

      // --- compute 24h change from rolling baseline ---
      const baseline = loadBaseline();
      const changes: Record<string, number> = {};
      let baselineDirty = false;
      const now = Date.now();

      for (const d of liveData) {
        const snap = baseline[d.canisterId];
        if (!snap) {
          baseline[d.canisterId] = { price: d.price, ts: now };
          // Use static fallback for known tokens
          const meta = staticMetaMap.get(d.canisterId);
          changes[d.canisterId] = meta?.change24h ?? 0;
          baselineDirty = true;
        } else {
          changes[d.canisterId] =
            snap.price > 0
              ? ((d.price - snap.price) / snap.price) * 100
              : 0;
          if (now - snap.ts >= 24 * 3600 * 1000) {
            baseline[d.canisterId] = { price: d.price, ts: now };
            baselineDirty = true;
          }
        }
      }

      if (baselineDirty) saveBaseline(baseline);

      // --- ICP USD price ---
      const icpData = liveData.find((d) => d.canisterId === ICP_CANISTER);
      const icpPrice = icpData?.price || 1;

      // --- build TokenEntry for every discovered token ---
      const liveTokens: TokenEntry[] = [];
      const liveTokensMap: Record<string, TokenEntry> = {};

      for (const d of liveData) {
        if (d.price <= 0 || !d.imageUrl) continue; // skip tokens with no price or no official image

        const meta = staticMetaMap.get(d.canisterId);
        const change = changes[d.canisterId] ?? 0;
        const entry = buildTokenEntry(d, icpPrice, change, meta);

        liveTokens.push(entry);
        liveTokensMap[entry.id] = entry;
        // Also index by canisterId for lookups
        liveTokensMap[entry.canisterId] = entry;
      }

      // Sort: verified first, then by market cap descending
      liveTokens.sort((a, b) => {
        if (a.verified !== b.verified) return a.verified ? -1 : 1;
        return (b.marketCap ?? 0) - (a.marketCap ?? 0);
      });

      set({
        pricesLoaded: true,
        pricesError: null,
        lastFetchedAt: now,
        liveTokens,
        liveTokensMap,
      });
    } catch (err) {
      set({ pricesError: (err as Error).message });
    }
  },

  startPolling: (ms = 60_000) => {
    if (pollingInterval) return;
    get().fetchPrices();
    pollingInterval = setInterval(() => get().fetchPrices(), ms);
  },

  stopPolling: () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  },

  // --- hydrate ---
  _hydrate: () => {
    try {
      const wl = JSON.parse(localStorage.getItem(WL_KEY) || '[]');
      const rv = JSON.parse(localStorage.getItem(RV_KEY) || '[]');
      set({
        watchlist: Array.isArray(wl) ? wl : [],
        recentlyViewedTokens: Array.isArray(rv) ? rv : [],
      });
    } catch {
      /* ignore */
    }
  },
}));
