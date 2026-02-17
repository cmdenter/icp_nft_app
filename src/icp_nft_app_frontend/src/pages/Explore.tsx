import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { COLLECTIONS } from '../api/collections';
import { getExtImageUrls } from '../api/ext';
import { useFeaturedTokens } from '../hooks/useTokenData';
import { TokenCard } from '../components/TokenCard';
import { VerifiedIcon, ChevronLeft, ChevronRight } from '../components/icons';
import { SafeImg } from '../components/SafeImg';
import { RecentlyViewed } from '../components/RecentlyViewed';
import { NewsFeed } from '../components/NewsFeed';
import { AdSlot } from '../components/AdSlot';
import type { CollectionEntry } from '../types';

/* =================================================================
   HELPERS
   ================================================================= */

/** Horizontal scroll state hook for carousels */
function useHScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);

  const check = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanL(el.scrollLeft > 4);
    setCanR(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    check();
    el.addEventListener('scroll', check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', check);
      ro.disconnect();
    };
  }, [check]);

  const go = useCallback((dir: 'l' | 'r') => {
    ref.current?.scrollBy({
      left: dir === 'l' ? -ref.current.clientWidth * 0.8 : ref.current.clientWidth * 0.8,
      behavior: 'smooth',
    });
  }, []);

  return { ref, canL, canR, go };
}

/** Build interleaved featured NFT items from external collections */
function buildFeaturedItems(): { collection: CollectionEntry; idx: number; urls: string[] }[] {
  const ext = COLLECTIONS.filter((c) => !c.isLocal && c.standard === 'ext');
  const picks = [0, 1, 3, 7, 12, 20, 42, 69, 100, 200, 350, 500];
  const byCol = new Map<string, { collection: CollectionEntry; idx: number; urls: string[] }[]>();

  for (const col of ext) {
    const max = col.totalSupply || 100;
    for (const i of picks) {
      if (i < max) {
        const arr = byCol.get(col.id) || [];
        arr.push({ collection: col, idx: i, urls: getExtImageUrls(col.canisterId, i) });
        byCol.set(col.id, arr);
      }
    }
  }

  // Interleave collections so they alternate
  const cols = [...byCol.values()];
  const out: typeof cols[0] = [];
  const maxLen = Math.max(...cols.map((c) => c.length));
  for (let i = 0; i < maxLen; i++) {
    for (const c of cols) {
      if (i < c.length) out.push(c[i]);
    }
  }
  return out;
}

/** Category definitions */
const CATEGORY_DEFS: {
  id: 'art' | 'pfps' | 'gaming' | 'collectibles';
  name: string;
  gradient: string;
  letter: string;
}[] = [
  { id: 'art', name: 'Art', gradient: 'from-pink-500/30 to-orange-500/20', letter: 'A' },
  { id: 'pfps', name: 'PFPs', gradient: 'from-blue-500/30 to-purple-600/20', letter: 'P' },
  { id: 'gaming', name: 'Gaming', gradient: 'from-green-500/30 to-teal-500/20', letter: 'G' },
  { id: 'collectibles', name: 'Collectibles', gradient: 'from-yellow-500/30 to-red-500/20', letter: 'C' },
];

/* =================================================================
   EXPLORE PAGE
   ================================================================= */

const Explore: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') as
    | 'art'
    | 'pfps'
    | 'gaming'
    | 'collectibles'
    | null;

  const external = useMemo(() => COLLECTIONS.filter((c) => !c.isLocal), []);

  // Filter collections by category if URL param is set
  const displayCollections = useMemo(() => {
    if (!categoryFilter) return external;
    return external.filter((c) => c.category === categoryFilter);
  }, [external, categoryFilter]);

  // Hero carousel collections (external only)
  const heroCollections = useMemo(() => external.filter((c) => c.standard === 'ext'), [external]);

  // Build featured items for Trending Now
  const featured = useMemo(() => buildFeaturedItems(), []);

  const featuredTokens = useFeaturedTokens();

  // Trending carousel scroll
  const trending = useHScroll();

  // Hero carousel state
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroKey, setHeroKey] = useState(0);
  const heroTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heroHoveredRef = useRef(false);

  const startHeroTimer = useCallback(() => {
    if (heroTimerRef.current) clearInterval(heroTimerRef.current);
    heroTimerRef.current = setInterval(() => {
      if (!heroHoveredRef.current && heroCollections.length > 1) {
        setHeroIndex((prev) => {
          const next = (prev + 1) % heroCollections.length;
          setHeroKey((k) => k + 1);
          return next;
        });
      }
    }, 5000);
  }, [heroCollections.length]);

  useEffect(() => {
    startHeroTimer();
    return () => {
      if (heroTimerRef.current) clearInterval(heroTimerRef.current);
    };
  }, [startHeroTimer]);

  const goHero = useCallback(
    (dir: 'prev' | 'next') => {
      setHeroIndex((prev) => {
        const next =
          dir === 'next'
            ? (prev + 1) % heroCollections.length
            : (prev - 1 + heroCollections.length) % heroCollections.length;
        setHeroKey((k) => k + 1);
        return next;
      });
      startHeroTimer();
    },
    [heroCollections.length, startHeroTimer],
  );

  const goHeroDot = useCallback(
    (i: number) => {
      setHeroIndex(i);
      setHeroKey((k) => k + 1);
      startHeroTimer();
    },
    [startHeroTimer],
  );

  const currentHero = heroCollections[heroIndex];
  const heroImageUrls = currentHero
    ? getExtImageUrls(currentHero.canisterId, currentHero.id === 'icpunks' ? 42 : 5)
    : [];

  // Count collections per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { art: 0, pfps: 0, gaming: 0, collectibles: 0 };
    for (const col of external) {
      if (col.category && counts[col.category] !== undefined) {
        counts[col.category]++;
      }
    }
    return counts;
  }, [external]);

  return (
    <div className="min-h-screen">
      {/* =============================================================
          1. HERO CAROUSEL — full-width rotating banner
          ============================================================= */}
      {heroCollections.length > 0 && (
        <section
          className="relative w-full"
          style={{ minHeight: 420 }}
          onMouseEnter={() => { heroHoveredRef.current = true; }}
          onMouseLeave={() => { heroHoveredRef.current = false; }}
        >
          {/* Blurred background — clipped container prevents overflow */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -inset-10" key={`bg-${heroKey}`}>
              <SafeImg
                urls={heroImageUrls}
                alt=""
                fallback=""
                className="w-full h-full object-cover blur-3xl opacity-30"
                loading="eager"
              />
            </div>
          </div>

          {/* Gradient overlays for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-os-bg via-os-bg/80 to-os-bg/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-os-bg via-transparent to-os-bg/70" />

          {/* Content */}
          <div
            className="relative z-10 max-w-[1400px] mx-auto px-14 sm:px-18 lg:px-24 py-14 sm:py-16 lg:py-20 flex flex-col lg:flex-row items-center gap-10 lg:gap-16"
            key={`hero-${heroKey}`}
          >
            {/* Left — text */}
            <div className="flex-1 min-w-0 max-w-xl animate-carousel-fade">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-os-primary/10 border border-os-primary/20">
                {currentHero?.verified && <VerifiedIcon size={14} />}
                <span className="text-os-primary text-xs font-bold uppercase tracking-wider">Featured Collection</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-4">
                {currentHero?.name}
              </h1>
              <p className="text-os-text-secondary text-base leading-relaxed mb-6 line-clamp-2 max-w-md">
                {currentHero?.description}
              </p>

              {/* Stats pills */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                {currentHero?.floorPrice != null && (
                  <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-os-card/80 border border-os-border/30">
                    <span className="text-xs text-os-text-secondary">Floor</span>
                    <span className="text-sm font-bold text-white">{currentHero.floorPrice} ICP</span>
                  </div>
                )}
                {currentHero?.totalSupply != null && (
                  <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-os-card/80 border border-os-border/30">
                    <span className="text-xs text-os-text-secondary">Items</span>
                    <span className="text-sm font-bold text-white">{currentHero.totalSupply.toLocaleString()}</span>
                  </div>
                )}
                {currentHero?.verified && (
                  <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-os-green/10 border border-os-green/20">
                    <VerifiedIcon size={13} className="text-os-green" />
                    <span className="text-xs font-semibold text-os-green">Verified</span>
                  </div>
                )}
              </div>

              <Link
                to={`/collection/${currentHero?.id}`}
                className="btn btn-lg btn-primary"
              >
                View Collection
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* Right — featured image with glow */}
            <div className="flex-1 flex justify-center lg:justify-end animate-carousel-fade">
              <div className="relative">
                {/* Glow behind image */}
                <div className="absolute -inset-4 bg-os-primary/15 rounded-3xl blur-2xl" />
                <div className="relative w-[260px] sm:w-[300px] lg:w-[340px] aspect-square rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/40">
                  <SafeImg
                    urls={heroImageUrls}
                    alt={currentHero?.name || ''}
                    fallback={currentHero?.name?.[0] || 'N'}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  {/* Subtle gradient overlay on image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* Arrow buttons */}
          {heroCollections.length > 1 && (
            <>
              <button
                onClick={() => goHero('prev')}
                className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20
                           w-10 h-10 rounded-full bg-os-card/80 border border-os-border/30 text-white flex items-center justify-center
                           backdrop-blur-md transition-all duration-250 hover:bg-os-card hover:scale-105 active:scale-95"
                aria-label="Previous slide"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => goHero('next')}
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20
                           w-10 h-10 rounded-full bg-os-card/80 border border-os-border/30 text-white flex items-center justify-center
                           backdrop-blur-md transition-all duration-250 hover:bg-os-card hover:scale-105 active:scale-95"
                aria-label="Next slide"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {heroCollections.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {heroCollections.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goHeroDot(i)}
                  className={`rounded-full transition-all duration-250 ${
                    i === heroIndex
                      ? 'w-7 h-2.5 bg-os-primary shadow-md shadow-os-primary/40'
                      : 'w-2.5 h-2.5 bg-white/25 hover:bg-white/50'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* =============================================================
          2. TRENDING NOW — horizontal scrollable NFT items
          ============================================================= */}
      <section className="section-spacing px-4 sm:px-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Trending Now</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => trending.go('l')}
              disabled={!trending.canL}
              className="w-9 h-9 rounded-full bg-os-surface border border-os-border/40 flex items-center justify-center
                         disabled:opacity-30 hover:bg-os-card transition-colors"
            >
              <ChevronLeft size={16} className="text-white" />
            </button>
            <button
              onClick={() => trending.go('r')}
              disabled={!trending.canR}
              className="w-9 h-9 rounded-full bg-os-surface border border-os-border/40 flex items-center justify-center
                         disabled:opacity-30 hover:bg-os-card transition-colors"
            >
              <ChevronRight size={16} className="text-white" />
            </button>
          </div>
        </div>

        <div
          ref={trending.ref}
          className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth snap-x snap-mandatory pb-4"
        >
          {featured.map((item, i) => (
            <Link
              key={`${item.collection.id}-${item.idx}`}
              to={`/collection/${item.collection.id}/nft/${item.idx}`}
              className="snap-start shrink-0 w-[180px] sm:w-[200px] lg:w-[220px] group/card"
            >
              <div
                className="relative aspect-square rounded-2xl overflow-hidden bg-os-card border border-os-border/30
                            group-hover/card:border-os-primary/30 group-hover/card:shadow-lg group-hover/card:shadow-os-primary/10
                            transition-all duration-250"
              >
                <SafeImg
                  urls={item.urls}
                  alt={`${item.collection.name} #${item.idx}`}
                  fallback={item.collection.name[0]}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 will-change-transform group-hover/card:scale-105"
                  loading={i < 8 ? 'eager' : 'lazy'}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
              <div className="mt-2.5 px-0.5">
                <p className="text-[11px] text-os-primary font-semibold truncate flex items-center gap-1">
                  {item.collection.name}
                  {item.collection.verified && <VerifiedIcon size={11} className="shrink-0" />}
                </p>
                <p className="text-sm font-bold text-white truncate">
                  {item.collection.name} #{item.idx}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =============================================================
          3. BROWSE BY CATEGORY — 2x2 grid
          ============================================================= */}
      <section className="section-spacing px-4 sm:px-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Browse by Category</h2>
          {categoryFilter && (
            <Link
              to="/"
              className="text-sm text-os-primary hover:text-os-primary-hover font-medium transition-colors"
            >
              Clear filter
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CATEGORY_DEFS.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isActive = categoryFilter === cat.id;

            return (
              <Link
                key={cat.id}
                to={isActive ? '/' : `/?category=${cat.id}`}
                className={`group relative rounded-2xl overflow-hidden border transition-all duration-250 card-hover-glow
                  ${
                    isActive
                      ? 'border-os-primary/50 ring-2 ring-os-primary/20'
                      : 'border-os-border/40 hover:border-os-primary/20'
                  }`}
              >
                <div
                  className={`bg-gradient-to-br ${cat.gradient} px-6 py-8 sm:py-10 flex items-center gap-5`}
                >
                  {/* Large letter badge */}
                  <div
                    className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/[0.06] border border-white/10
                                flex items-center justify-center group-hover:bg-white/[0.1] group-hover:scale-105
                                transition-all duration-250"
                  >
                    <span className="text-3xl sm:text-4xl font-extrabold text-white/80">
                      {cat.letter}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-lg sm:text-xl mb-1">{cat.name}</h3>
                    <p className="text-os-text-secondary text-sm">
                      {count} {count === 1 ? 'collection' : 'collections'}
                    </p>
                  </div>
                </div>

                {isActive && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-os-primary/20 text-os-primary text-[11px] font-bold rounded-full uppercase tracking-wider">
                    Active
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* News Feed */}
      <section className="section-spacing px-4 sm:px-6 max-w-[1400px] mx-auto">
        <NewsFeed />
      </section>

      {/* Ad Slot */}
      <section className="section-spacing px-4 sm:px-6 max-w-[1400px] mx-auto">
        <AdSlot placement="feed" />
      </section>

      {/* =============================================================
          4. TOP COLLECTIONS — ranked list
          ============================================================= */}
      <section className="section-spacing px-4 sm:px-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {categoryFilter ? `Top ${CATEGORY_DEFS.find((c) => c.id === categoryFilter)?.name || ''} Collections` : 'Top Collections'}
          </h2>
          <Link
            to="/rankings"
            className="text-sm text-os-primary hover:text-os-primary-hover font-medium transition-colors"
          >
            See all rankings
          </Link>
        </div>

        <div className="bg-os-surface rounded-2xl border border-os-border/40 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[40px_1fr_100px_100px] sm:grid-cols-[50px_1fr_120px_120px] items-center px-4 sm:px-6 py-3 border-b border-os-border/30">
            <span className="text-os-text-secondary text-xs font-medium">#</span>
            <span className="text-os-text-secondary text-xs font-medium">Collection</span>
            <span className="text-os-text-secondary text-xs font-medium text-right">Floor Price</span>
            <span className="text-os-text-secondary text-xs font-medium text-right">Supply</span>
          </div>

          {/* Collection rows */}
          {displayCollections.length === 0 && (
            <div className="px-6 py-10 text-center text-os-text-secondary text-sm">
              No collections found in this category.
            </div>
          )}

          {displayCollections
            .filter((c) => !c.isLocal)
            .map((col, i) => (
              <TopCollectionRow key={col.id} collection={col} rank={i + 1} />
            ))}
        </div>
      </section>

      {/* =============================================================
          5. RECENTLY VIEWED
          ============================================================= */}
      <section className="section-spacing px-4 sm:px-6 max-w-[1400px] mx-auto">
        <RecentlyViewed />
      </section>

      {/* =============================================================
          6. ICP ECOSYSTEM TOKENS
          ============================================================= */}
      <section className="section-spacing px-4 sm:px-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">ICP Ecosystem Tokens</h2>
          <Link
            to="/tokens"
            className="text-sm text-os-primary hover:text-os-primary-hover font-medium transition-colors"
          >
            View all tokens &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredTokens.map((t) => (
            <TokenCard key={t.id} token={t} />
          ))}
        </div>
      </section>

      {/* =============================================================
          7. CREATE & SELL CTA
          ============================================================= */}
      <section className="section-spacing pb-12 px-4 sm:px-6 max-w-[1400px] mx-auto">
        <div className="rounded-3xl overflow-hidden relative">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-os-primary/10 via-purple-900/8 to-os-bg dot-grid opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-os-bg/80 via-transparent to-os-bg/80" />

          <div className="relative z-10 px-6 sm:px-10 lg:px-16 py-12 sm:py-16">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                Create and sell your NFTs
              </h2>
              <p className="text-os-text-secondary text-sm sm:text-base leading-relaxed">
                Join the Internet Computer's premier marketplace. Zero gas fees, instant finality,
                100% on-chain.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto">
              <StepCard
                step="1"
                title="Connect Wallet"
                desc="Link your Internet Identity or Plug wallet to get started in seconds."
              />
              <StepCard
                step="2"
                title="Create NFT"
                desc="Upload your artwork, add traits and metadata, and mint directly on-chain."
              />
              <StepCard
                step="3"
                title="List for Sale"
                desc="Set your price and start earning from every sale on the marketplace."
              />
            </div>

            <div className="text-center mt-10">
              <Link
                to="/create"
                className="inline-flex items-center gap-2 bg-os-primary hover:bg-os-primary-hover text-white font-semibold
                           px-8 py-3.5 rounded-2xl transition-all duration-250 text-[15px]
                           shadow-lg shadow-os-primary/25 hover:shadow-os-primary/40 hover:-translate-y-0.5 btn-press"
              >
                Start Creating
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Explore;

/* =================================================================
   SUB-COMPONENTS
   ================================================================= */

/** Top Collections ranked row */
function TopCollectionRow({
  collection,
  rank,
}: {
  collection: CollectionEntry;
  rank: number;
}) {
  const linkTo = collection.isLocal ? '/collection/local' : `/collection/${collection.id}`;

  const imgUrls = useMemo(() => {
    if (collection.isLocal || collection.standard !== 'ext') {
      return collection.image ? [collection.image] : [];
    }
    return getExtImageUrls(collection.canisterId, 1);
  }, [collection]);

  const medalColor =
    rank === 1
      ? 'text-yellow-400'
      : rank === 2
        ? 'text-slate-300'
        : rank === 3
          ? 'text-amber-600'
          : 'text-os-text-secondary';

  return (
    <Link
      to={linkTo}
      className="grid grid-cols-[40px_1fr_100px_100px] sm:grid-cols-[50px_1fr_120px_120px] items-center px-4 sm:px-6 py-3.5
                 hover:bg-os-card/50 transition-colors group border-b border-os-border/20 last:border-b-0"
    >
      {/* Rank */}
      <span className={`text-sm font-bold ${medalColor}`}>{rank}</span>

      {/* Collection info */}
      <div className="flex items-center gap-3 min-w-0 pr-4">
        <div
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-os-card border border-os-border/30 shrink-0
                      group-hover:ring-2 group-hover:ring-os-primary/20 transition-shadow"
        >
          <SafeImg
            urls={imgUrls}
            fallback={collection.name[0]}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white text-sm truncate group-hover:text-os-primary transition-colors">
              {collection.name}
            </span>
            {collection.verified && <VerifiedIcon size={14} className="shrink-0" />}
          </div>
          {collection.category && (
            <p className="text-[11px] text-os-text-secondary mt-0.5 capitalize">
              {collection.category}
            </p>
          )}
        </div>
      </div>

      {/* Floor price */}
      <span className="text-sm font-medium text-white text-right">
        {collection.floorPrice != null ? `${collection.floorPrice} ICP` : '\u2014'}
      </span>

      {/* Total supply */}
      <span className="text-sm font-medium text-white text-right">
        {(collection.totalSupply || 0).toLocaleString()}
      </span>
    </Link>
  );
}

/** Create & Sell step card */
function StepCard({
  step,
  title,
  desc,
}: {
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="text-center group">
      <div
        className="w-16 h-16 rounded-2xl bg-os-primary/10 border border-os-primary/20 flex items-center justify-center mx-auto mb-4
                    group-hover:bg-os-primary/15 group-hover:border-os-primary/30 group-hover:scale-105 transition-all duration-250"
      >
        <span className="text-os-primary text-2xl font-bold">{step}</span>
      </div>
      <h3 className="text-white font-bold text-[15px] mb-1.5">{title}</h3>
      <p className="text-os-text-secondary text-xs leading-relaxed">{desc}</p>
    </div>
  );
}
