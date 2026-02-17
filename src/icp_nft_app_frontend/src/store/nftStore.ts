import { create } from 'zustand';
import { api } from '../api/client';
import { mintNFT, transferNFT } from '../api/actor';
import { getCollection, COLLECTIONS } from '../api/collections';
import { fetchExternalTokens } from '../api/externalFetcher';
import { fetchExtListings, fetchExtTransactions } from '../api/ext-market';
import { connectPlug, disconnectPlug } from '../api/plug-wallet';
import { buyExtNFT } from '../api/ext-buy';
import type { BuyResult } from '../api/ext-buy';
import type { ExtListing, ExtTransaction } from '../api/ext-market';
import type {
  GalleryItem,
  TokenDetail,
  CollectionStats,
  MintArgs,
  ActivityEvent,
  CollectionTab,
  GridDensity,
  SortOption,
  TraitFilter,
  RecentlyViewedItem,
} from '../types';

interface NFTStore {
  // Gallery state
  pages: Map<number, GalleryItem[]>;
  totalSupply: number;
  totalPages: number;
  currentPage: number;
  isLoadingPage: Set<number>;
  loadedPages: Set<number>;

  // Token detail
  tokenCache: Map<number, TokenDetail>;

  // Collection
  collection: CollectionStats | null;

  // Principal
  principal: string;
  setPrincipal: (p: string) => void;

  // Activity
  activityEvents: ActivityEvent[];
  activityPage: number;
  activityHasMore: boolean;
  activityLoading: boolean;
  loadActivity: (reset?: boolean) => Promise<void>;
  loadTokenActivity: (tokenId: number) => Promise<ActivityEvent[]>;

  // Search
  searchQuery: string;
  searchResults: GalleryItem[];
  searchLoading: boolean;
  setSearchQuery: (q: string) => void;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;

  // Profile
  profileTokens: GalleryItem[];
  profileLoading: boolean;
  loadProfileTokens: (principal: string) => Promise<void>;

  // UI state
  activeTab: CollectionTab;
  setActiveTab: (tab: CollectionTab) => void;
  gridDensity: GridDensity;
  setGridDensity: (d: GridDensity) => void;
  sortOption: SortOption;
  setSortOption: (s: SortOption) => void;
  activeTraitFilters: TraitFilter[];
  toggleTraitFilter: (filter: TraitFilter) => void;
  clearTraitFilters: () => void;
  filterSidebarOpen: boolean;
  setFilterSidebarOpen: (open: boolean) => void;

  // External collections
  externalItems: Map<string, GalleryItem[]>;
  externalLoading: Map<string, boolean>;
  externalPage: Map<string, number>;
  externalHasMore: Map<string, boolean>;
  externalTotalSupply: Map<string, number>;
  loadExternalPage: (collectionId: string) => Promise<void>;

  // External market data (listings + transactions)
  externalListings: Map<string, Map<number, ExtListing>>;
  externalTransactions: Map<string, ExtTransaction[]>;
  externalMarketLoading: Map<string, boolean>;
  loadExternalMarketData: (collectionId: string) => Promise<void>;

  // Recently viewed
  recentlyViewed: RecentlyViewedItem[];
  addRecentlyViewed: (item: RecentlyViewedItem) => void;
  loadRecentlyViewed: () => void;

  // Plug wallet
  plugConnected: boolean;
  plugPrincipal: string;
  plugAccountId: string;
  buyingNFT: Map<string, boolean>;
  connectPlugWallet: () => Promise<void>;
  disconnectPlugWallet: () => void;
  buyNFT: (collectionId: string, tokenIndex: number) => Promise<BuyResult>;

  // Actions
  loadGalleryPage: (page: number) => Promise<void>;
  loadTokenDetail: (id: number) => Promise<void>;
  loadCollection: () => Promise<void>;
  mint: (args: MintArgs) => Promise<number>;
  transfer: (tokenId: number, to: string) => Promise<boolean>;
  setCurrentPage: (page: number) => void;
}

let tempIdCounter = -1;

export const useNFTStore = create<NFTStore>((set, get) => ({
  pages: new Map(),
  totalSupply: 0,
  totalPages: 1,
  currentPage: 0,
  isLoadingPage: new Set(),
  loadedPages: new Set(),
  tokenCache: new Map(),
  collection: null,
  principal: '',

  // Activity
  activityEvents: [],
  activityPage: 0,
  activityHasMore: true,
  activityLoading: false,

  // Search
  searchQuery: '',
  searchResults: [],
  searchLoading: false,

  // Profile
  profileTokens: [],
  profileLoading: false,

  // External collections
  externalItems: new Map(),
  externalLoading: new Map(),
  externalPage: new Map(),
  externalHasMore: new Map(),
  externalTotalSupply: new Map(),

  // External market data
  externalListings: new Map(),
  externalTransactions: new Map(),
  externalMarketLoading: new Map(),

  // Recently viewed
  recentlyViewed: [],

  loadRecentlyViewed: () => {
    try {
      const data = JSON.parse(localStorage.getItem('recentlyViewedNFTs') || '[]');
      set({ recentlyViewed: data.slice(0, 20) });
    } catch {
      set({ recentlyViewed: [] });
    }
  },

  addRecentlyViewed: (item) => {
    const { recentlyViewed } = get();
    const key = `${item.collectionId || 'local'}-${item.id}`;
    const filtered = recentlyViewed.filter(
      (rv) => `${rv.collectionId || 'local'}-${rv.id}` !== key
    );
    const updated = [item, ...filtered].slice(0, 20);
    set({ recentlyViewed: updated });
    try { localStorage.setItem('recentlyViewedNFTs', JSON.stringify(updated)); } catch {}
  },

  // Plug wallet
  plugConnected: false,
  plugPrincipal: '',
  plugAccountId: '',
  buyingNFT: new Map(),

  // UI
  activeTab: 'items',
  gridDensity: 'medium',
  sortOption: 'newest',
  activeTraitFilters: [],
  filterSidebarOpen: false,

  setPrincipal: (p) => set({ principal: p }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setGridDensity: (d) => set({ gridDensity: d }),
  setSortOption: (s) => set({ sortOption: s }),
  setFilterSidebarOpen: (open) => set({ filterSidebarOpen: open }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  toggleTraitFilter: (filter) => {
    const { activeTraitFilters } = get();
    const exists = activeTraitFilters.find(
      (f) => f.category === filter.category && f.value === filter.value
    );
    if (exists) {
      set({
        activeTraitFilters: activeTraitFilters.filter(
          (f) => !(f.category === filter.category && f.value === filter.value)
        ),
      });
    } else {
      set({ activeTraitFilters: [...activeTraitFilters, filter] });
    }
  },

  clearTraitFilters: () => set({ activeTraitFilters: [] }),

  clearSearch: () => set({ searchQuery: '', searchResults: [], searchLoading: false }),

  loadActivity: async (reset = false) => {
    const { activityLoading, activityPage, activityEvents } = get();
    if (activityLoading) return;

    const page = reset ? 0 : activityPage;
    set({ activityLoading: true });

    try {
      const data = await api.getActivity(page);
      set({
        activityEvents: reset ? data.items : [...activityEvents, ...data.items],
        activityPage: page + 1,
        activityHasMore: page + 1 < data.totalPages,
        activityLoading: false,
      });
    } catch (err) {
      console.error('Failed to load activity:', err);
      set({ activityLoading: false });
    }
  },

  loadTokenActivity: async (tokenId) => {
    try {
      const data = await api.getTokenActivity(tokenId, 0);
      return data.items;
    } catch (err) {
      console.error('Failed to load token activity:', err);
      return [];
    }
  },

  search: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [], searchLoading: false });
      return;
    }
    set({ searchLoading: true, searchQuery: query });
    try {
      const data = await api.search(query, 0);
      set({ searchResults: data.items, searchLoading: false });
    } catch (err) {
      console.error('Search failed:', err);
      set({ searchResults: [], searchLoading: false });
    }
  },

  loadProfileTokens: async (principal) => {
    set({ profileLoading: true });
    try {
      const data = await api.getOwnerTokens(principal, 0);
      set({ profileTokens: data.items, profileLoading: false });
    } catch (err) {
      console.error('Failed to load profile tokens:', err);
      set({ profileLoading: false });
    }
  },

  loadExternalPage: async (collectionId) => {
    const { externalLoading, externalPage } = get();
    if (externalLoading.get(collectionId)) return;

    const collection = getCollection(collectionId);
    if (!collection || collection.isLocal) return;

    const page = externalPage.get(collectionId) || 0;

    const newLoading = new Map(externalLoading);
    newLoading.set(collectionId, true);
    set({ externalLoading: newLoading });

    try {
      const result = await fetchExternalTokens(collection, page);
      const existing = get().externalItems.get(collectionId) || [];

      const newItems = new Map(get().externalItems);
      newItems.set(collectionId, [...existing, ...result.items]);

      const newPage = new Map(get().externalPage);
      newPage.set(collectionId, page + 1);

      const newHasMore = new Map(get().externalHasMore);
      newHasMore.set(collectionId, result.hasMore);

      const newTotal = new Map(get().externalTotalSupply);
      newTotal.set(collectionId, result.total);

      const doneLoading = new Map(get().externalLoading);
      doneLoading.set(collectionId, false);

      set({
        externalItems: newItems,
        externalPage: newPage,
        externalHasMore: newHasMore,
        externalTotalSupply: newTotal,
        externalLoading: doneLoading,
      });
    } catch (err) {
      console.error(`Failed to load external collection ${collectionId}:`, err);
      const doneLoading = new Map(get().externalLoading);
      doneLoading.set(collectionId, false);
      set({ externalLoading: doneLoading });
    }
  },

  loadExternalMarketData: async (collectionId) => {
    const { externalMarketLoading, externalListings } = get();
    // Skip if already loading or already loaded
    if (externalMarketLoading.get(collectionId) || externalListings.has(collectionId)) return;

    const collection = getCollection(collectionId);
    if (!collection || collection.isLocal || collection.standard !== 'ext') return;

    const newLoading = new Map(externalMarketLoading);
    newLoading.set(collectionId, true);
    set({ externalMarketLoading: newLoading });

    try {
      const [listings, transactions] = await Promise.all([
        fetchExtListings(collection),
        fetchExtTransactions(collection),
      ]);

      const newListings = new Map(get().externalListings);
      newListings.set(collectionId, listings);

      const newTx = new Map(get().externalTransactions);
      newTx.set(collectionId, transactions);

      const doneLoading = new Map(get().externalMarketLoading);
      doneLoading.set(collectionId, false);

      set({
        externalListings: newListings,
        externalTransactions: newTx,
        externalMarketLoading: doneLoading,
      });
    } catch (err) {
      console.error(`Failed to load market data for ${collectionId}:`, err);
      const doneLoading = new Map(get().externalMarketLoading);
      doneLoading.set(collectionId, false);
      set({ externalMarketLoading: doneLoading });
    }
  },

  connectPlugWallet: async () => {
    const whitelist = COLLECTIONS.filter((c) => !c.isLocal).map((c) => c.canisterId);
    const result = await connectPlug(whitelist);
    set({
      plugConnected: true,
      plugPrincipal: result.principal,
      plugAccountId: result.accountId,
    });
  },

  disconnectPlugWallet: () => {
    disconnectPlug();
    set({ plugConnected: false, plugPrincipal: '', plugAccountId: '' });
  },

  buyNFT: async (collectionId, tokenIndex) => {
    const collection = getCollection(collectionId);
    if (!collection) return { success: false, error: 'Collection not found' };

    const listings = get().externalListings.get(collectionId);
    const listing = listings?.get(tokenIndex);
    if (!listing) return { success: false, error: 'NFT is not listed for sale' };

    const key = `${collectionId}-${tokenIndex}`;
    const newBuying = new Map(get().buyingNFT);
    newBuying.set(key, true);
    set({ buyingNFT: newBuying });

    try {
      const result = await buyExtNFT(collection, tokenIndex, listing.price);

      if (result.success) {
        // Remove from listings on success
        const newListings = new Map(get().externalListings);
        const collListings = new Map(newListings.get(collectionId) || []);
        collListings.delete(tokenIndex);
        newListings.set(collectionId, collListings);
        set({ externalListings: newListings });
      }

      return result;
    } finally {
      const doneBuying = new Map(get().buyingNFT);
      doneBuying.delete(key);
      set({ buyingNFT: doneBuying });
    }
  },

  loadGalleryPage: async (page) => {
    const { isLoadingPage } = get();
    if (isLoadingPage.has(page)) return;

    const newLoading = new Set(isLoadingPage);
    newLoading.add(page);
    set({ isLoadingPage: newLoading });

    try {
      const data = await api.getGallery(page);
      const { pages, isLoadingPage: loading, loadedPages: loaded } = get();
      const newPages = new Map(pages);
      newPages.set(page, data.items);

      const newLoaded = new Set(loaded);
      newLoaded.add(page);

      const doneLoading = new Set(loading);
      doneLoading.delete(page);

      set({
        pages: newPages,
        totalSupply: data.totalSupply,
        totalPages: data.totalPages,
        isLoadingPage: doneLoading,
        loadedPages: newLoaded,
      });
    } catch (err) {
      console.error('Failed to load gallery page:', err);
      const doneLoading = new Set(get().isLoadingPage);
      doneLoading.delete(page);
      set({ isLoadingPage: doneLoading });
    }
  },

  loadTokenDetail: async (id) => {
    try {
      const data = await api.getToken(id);
      const newCache = new Map(get().tokenCache);
      newCache.set(id, data);
      set({ tokenCache: newCache });
    } catch (err) {
      console.error('Failed to load token detail:', err);
    }
  },

  loadCollection: async () => {
    try {
      const data = await api.getCollection();
      set({ collection: data });
    } catch (err) {
      console.error('Failed to load collection:', err);
    }
  },

  mint: async (args) => {
    const { principal, pages, totalSupply } = get();
    if (!principal) throw new Error('No principal set');

    const tempId = tempIdCounter--;
    const optimisticItem: GalleryItem = {
      id: tempId,
      name: args.name,
      description: args.description,
      image: args.image,
      owner: principal,
      mintedAt: Date.now() * 1_000_000,
      traits: args.traits,
    };

    const newPages = new Map(pages);
    const page0 = [...(newPages.get(0) || [])];
    page0.unshift(optimisticItem);
    newPages.set(0, page0);
    set({ pages: newPages, totalSupply: totalSupply + 1 });

    try {
      const realId = await mintNFT(principal, args.name, args.description, args.image, args.traits);

      const { pages: currentPages } = get();
      const updatedPages = new Map(currentPages);
      const currentPage0 = updatedPages.get(0) || [];
      const confirmed = currentPage0.map((item) =>
        item.id === tempId ? { ...item, id: realId } : item
      );
      updatedPages.set(0, confirmed);
      set({ pages: updatedPages });

      navigator.serviceWorker?.controller?.postMessage({ type: 'PURGE', pattern: '/api/' });

      setTimeout(() => {
        get().loadGalleryPage(0);
        get().loadCollection();
      }, 500);

      return realId;
    } catch (err) {
      const { pages: currentPages, totalSupply: ts } = get();
      const rollbackPages = new Map(currentPages);
      const rollbackPage0 = (rollbackPages.get(0) || []).filter(
        (item) => item.id !== tempId
      );
      rollbackPages.set(0, rollbackPage0);
      set({ pages: rollbackPages, totalSupply: ts - 1 });
      throw err;
    }
  },

  transfer: async (tokenId, to) => {
    const result = await transferNFT(tokenId, to);
    if (result) {
      navigator.serviceWorker?.controller?.postMessage({ type: 'PURGE', pattern: '/api/' });
      const { tokenCache } = get();
      const newCache = new Map(tokenCache);
      newCache.delete(tokenId);
      set({ tokenCache: newCache });
      get().loadTokenDetail(tokenId);
      get().loadGalleryPage(get().currentPage);
    }
    return result;
  },
}));
