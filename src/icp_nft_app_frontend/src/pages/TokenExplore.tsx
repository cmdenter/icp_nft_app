import React, { useMemo, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { TOKEN_CATEGORY_DEFS } from '../api/tokens';
import { useLiveTokens, useFeaturedTokens } from '../hooks/useTokenData';
import { TokenCard } from '../components/TokenCard';
import { RecentlyViewedTokens } from '../components/RecentlyViewedTokens';
import { PriceChangeBadge } from '../components/PriceChangeBadge';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { TrendingIcon, BarChartIcon } from '../components/icons';
import type { TokenEntry, TokenCategory } from '../types';

/* =================================================================
   FORMATTING HELPERS
   ================================================================= */

function formatLargeNumber(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatPrice(price: number): string {
  if (price >= 1_000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

/* =================================================================
   PAGE COMPONENT
   ================================================================= */

const TokenExplore: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryParam = searchParams.get('category') as TokenCategory | null;

  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change'>('name');

  /* ── Data ──────────────────────────────────────────── */

  const allTokens = useLiveTokens();
  const featuredTokens = useFeaturedTokens();

  const activeCategoryDef = useMemo(
    () => (categoryParam ? TOKEN_CATEGORY_DEFS.find((c) => c.id === categoryParam) : undefined),
    [categoryParam],
  );

  const displayTokens = useMemo(() => {
    const base = categoryParam ? allTokens.filter((t) => t.category === categoryParam) : allTokens;
    const sorted = [...base];
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'change':
        sorted.sort((a, b) => (b.change24h ?? 0) - (a.change24h ?? 0));
        break;
    }
    return sorted;
  }, [allTokens, categoryParam, sortBy]);

  /* ── Market overview stats ─────────────────────────── */

  const stats = useMemo(() => {
    const tokens = allTokens;
    const totalCount = tokens.length;
    const totalMarketCap = tokens.reduce((sum, t) => sum + (t.marketCap ?? 0), 0);

    let topGainer: TokenEntry | null = null;
    let topLoser: TokenEntry | null = null;
    for (const t of tokens) {
      if (t.change24h == null) continue;
      if (!topGainer || (t.change24h > (topGainer.change24h ?? 0))) topGainer = t;
      if (!topLoser || (t.change24h < (topLoser.change24h ?? 0))) topLoser = t;
    }

    return { totalCount, totalMarketCap, topGainer, topLoser };
  }, [allTokens]);

  /* ── Trending: sorted by absolute 24h change ───────── */

  const trendingTokens = useMemo(() => {
    return [...allTokens]
      .filter((t) => t.change24h != null)
      .sort((a, b) => Math.abs(b.change24h ?? 0) - Math.abs(a.change24h ?? 0))
      .slice(0, 10);
  }, [allTokens]);

  /* ── Category token counts ─────────────────────────── */

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of allTokens) {
      map.set(t.category, (map.get(t.category) ?? 0) + 1);
    }
    return map;
  }, [allTokens]);

  /* ── Featured hero token ───────────────────────────── */

  const heroToken = featuredTokens[0] ?? null;

  /* ── Breadcrumbs ───────────────────────────────────── */

  const breadcrumbItems = useMemo(() => {
    const items: { label: string; to?: string }[] = [
      { label: 'Home', to: '/' },
      { label: 'Tokens', to: categoryParam ? '/tokens' : undefined },
    ];
    if (activeCategoryDef) {
      items.push({ label: activeCategoryDef.name });
    }
    return items;
  }, [categoryParam, activeCategoryDef]);

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen bg-os-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* ── 1. Breadcrumbs ──────────────────────────── */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* ── 2. Hero Section ─────────────────────────── */}
        {categoryParam && activeCategoryDef ? (
          /* Category hero */
          <section
            className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${activeCategoryDef.gradient} border border-os-border/30 p-8 sm:p-12 mb-8`}
          >
            <div className="relative z-10">
              <p className="text-sm font-medium text-os-text-secondary mb-2 uppercase tracking-wider">
                Browse Category
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                {activeCategoryDef.name}
              </h1>
              <p className="text-os-text-secondary max-w-lg">
                Explore {categoryCounts.get(categoryParam) ?? 0} tokens in the{' '}
                {activeCategoryDef.name} category on the Internet Computer.
              </p>
            </div>
            {/* Decorative circles */}
            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute -left-6 -bottom-6 w-32 h-32 rounded-full bg-white/5 blur-xl" />
          </section>
        ) : heroToken ? (
          /* Featured token hero */
          <section
            className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600/30 via-blue-600/20 to-cyan-500/10 border border-os-border/30 p-8 sm:p-12 mb-8"
          >
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <img
                src={heroToken.logo}
                alt={heroToken.symbol}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-os-bg/60 shadow-2xl shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-os-text-secondary mb-1 uppercase tracking-wider">
                  Featured Token
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  {heroToken.name}
                </h1>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl font-bold text-white">
                    {formatPrice(heroToken.price)}
                  </span>
                  <PriceChangeBadge change={heroToken.change24h} size="lg" />
                </div>
                <p className="text-os-text-secondary text-sm leading-relaxed max-w-xl line-clamp-2">
                  {heroToken.description}
                </p>
                <Link
                  to={`/token/${heroToken.id}`}
                  className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-xl bg-os-primary hover:bg-os-primary/80 text-white font-semibold text-sm transition-colors"
                >
                  View Token
                </Link>
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -left-6 -bottom-6 w-36 h-36 rounded-full bg-white/5 blur-2xl" />
          </section>
        ) : null}

        {/* ── Category Tokens (shown right below hero when filtering) ── */}
        {categoryParam && activeCategoryDef && displayTokens.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">
                {activeCategoryDef.name} Tokens
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-os-text-secondary mr-1 hidden sm:inline">Sort by:</span>
                {(['name', 'price', 'change'] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      sortBy === key
                        ? 'bg-os-primary text-white'
                        : 'bg-os-surface text-os-text-secondary hover:text-white border border-os-border/40'
                    }`}
                  >
                    {key === 'name' ? 'Name' : key === 'price' ? 'Price' : '24h Change'}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {displayTokens.map((token) => (
                <TokenCard key={token.id} token={token} />
              ))}
            </div>
          </section>
        )}

        {/* ── 3. Market Overview Stats Bar ─────────────── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {/* Total Tokens */}
          <div className="rounded-xl bg-os-surface border border-os-border/40 p-4">
            <p className="text-xs text-os-text-secondary mb-1 font-medium">Total Tokens</p>
            <p className="text-xl font-bold text-white">{stats.totalCount}</p>
          </div>

          {/* Top Gainer */}
          <div className="rounded-xl bg-os-surface border border-os-border/40 p-4">
            <p className="text-xs text-os-text-secondary mb-1 font-medium">Top Gainer</p>
            {stats.topGainer ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white truncate">
                  {stats.topGainer.symbol}
                </span>
                <PriceChangeBadge change={stats.topGainer.change24h} size="sm" />
              </div>
            ) : (
              <p className="text-sm text-os-text-secondary">--</p>
            )}
          </div>

          {/* Top Loser */}
          <div className="rounded-xl bg-os-surface border border-os-border/40 p-4">
            <p className="text-xs text-os-text-secondary mb-1 font-medium">Top Loser</p>
            {stats.topLoser ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white truncate">
                  {stats.topLoser.symbol}
                </span>
                <PriceChangeBadge change={stats.topLoser.change24h} size="sm" />
              </div>
            ) : (
              <p className="text-sm text-os-text-secondary">--</p>
            )}
          </div>

          {/* Total Market Cap */}
          <div className="rounded-xl bg-os-surface border border-os-border/40 p-4">
            <p className="text-xs text-os-text-secondary mb-1 font-medium">Total Market Cap</p>
            <p className="text-xl font-bold text-white">
              {formatLargeNumber(stats.totalMarketCap)}
            </p>
          </div>
        </section>

        {/* ── 4. Browse by Category ───────────────────── */}
        {!categoryParam && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <BarChartIcon size={20} className="text-os-primary" />
              <h2 className="text-xl font-bold text-white">Browse by Category</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {TOKEN_CATEGORY_DEFS.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/tokens?category=${cat.id}`}
                  className={`group relative rounded-xl overflow-hidden bg-gradient-to-br ${cat.gradient} border border-os-border/30 p-5 hover:border-os-primary/40 transition-all hover:scale-[1.02]`}
                >
                  <p className="text-base font-bold text-white mb-1 group-hover:text-os-primary transition-colors">
                    {cat.name}
                  </p>
                  <p className="text-xs text-os-text-secondary">
                    {categoryCounts.get(cat.id) ?? 0} tokens
                  </p>
                  {/* Decorative corner */}
                  <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-white/5 blur-lg" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── 5. Trending Tokens Table ────────────────── */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <TrendingIcon size={20} className="text-os-yellow" />
            <h2 className="text-xl font-bold text-white">Trending Tokens</h2>
          </div>

          <div className="rounded-xl bg-os-surface border border-os-border/40 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[40px_1fr_100px_100px_120px] sm:grid-cols-[48px_1fr_120px_120px_140px] gap-2 px-4 py-3 border-b border-os-border/30 text-xs text-os-text-secondary font-medium">
              <span>#</span>
              <span>Token</span>
              <span className="text-right">Price</span>
              <span className="text-right">24h</span>
              <span className="text-right hidden sm:block">Market Cap</span>
            </div>

            {/* Rows */}
            {trendingTokens.map((token, idx) => (
              <div
                key={token.id}
                onClick={() => navigate(`/token/${token.id}`)}
                className="grid grid-cols-[40px_1fr_100px_100px_120px] sm:grid-cols-[48px_1fr_120px_120px_140px] gap-2 px-4 py-3 items-center cursor-pointer hover:bg-os-card/40 transition-colors border-b border-os-border/20 last:border-b-0"
              >
                {/* Rank */}
                <span className="text-sm text-os-text-secondary font-medium">{idx + 1}</span>

                {/* Name / logo / symbol */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={token.logo}
                    alt={token.symbol}
                    className="w-8 h-8 rounded-full shrink-0"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{token.name}</p>
                    <p className="text-[11px] text-os-text-secondary">{token.symbol}</p>
                  </div>
                </div>

                {/* Price */}
                <span className="text-sm font-medium text-white text-right">
                  {formatPrice(token.price)}
                </span>

                {/* 24h change */}
                <div className="flex justify-end">
                  <PriceChangeBadge change={token.change24h} size="sm" />
                </div>

                {/* Market cap */}
                <span className="text-sm text-os-text-secondary text-right hidden sm:block">
                  {token.marketCap ? formatLargeNumber(token.marketCap) : '--'}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. All Tokens Grid (only on main /tokens page) ── */}
        {!categoryParam && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">All Tokens</h2>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-os-text-secondary mr-1 hidden sm:inline">Sort by:</span>
                {(['name', 'price', 'change'] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      sortBy === key
                        ? 'bg-os-primary text-white'
                        : 'bg-os-surface text-os-text-secondary hover:text-white border border-os-border/40'
                    }`}
                  >
                    {key === 'name' ? 'Name' : key === 'price' ? 'Price' : '24h Change'}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {displayTokens.map((token) => (
                <TokenCard key={token.id} token={token} />
              ))}
            </div>
          </section>
        )}

        {/* ── 7. Recently Viewed Tokens ───────────────── */}
        <section className="mb-10">
          <RecentlyViewedTokens />
        </section>

      </div>
    </div>
  );
};

export default TokenExplore;
