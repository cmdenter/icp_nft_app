import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useNFTStore } from '../store/nftStore';
import { getCollection } from '../api/collections';
import { computeCollectionStats } from '../api/collection-stats';
import { SkeletonGrid } from '../components/Skeleton';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ExtNFTCard } from '../components/ExtNFTCard';
import { CollectionFilterSidebar } from '../components/CollectionFilterSidebar';
import { CollectionResultsBar } from '../components/CollectionResultsBar';
import { CollectionHero } from '../components/CollectionHero';
import { CollectionTabs } from '../components/CollectionTabs';
import { CollectionActivityTable } from '../components/CollectionActivityTable';
import { CollectionAnalytics } from '../components/CollectionAnalytics';
import { CollectionAboutSection } from '../components/CollectionAboutSection';
import { ShareChat } from '../components/ShareChat';
import { SidebarWidgets } from '../components/SidebarWidgets';
import { AdSlot } from '../components/AdSlot';
import { useChatStore } from '../store/chatStore';
import type { ExtCollectionTab } from '../types';

type SortOption = 'token-id' | 'price-low' | 'price-high' | 'recently-listed' | 'recently-sold' | 'name-asc';
type StatusFilter = 'all' | 'listed' | 'not-listed';

const ExternalCollection: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const collection = collectionId ? getCollection(collectionId) : undefined;
  const chatCount = useChatStore((s) => s.getMessageCount(`collection-${collectionId}`));

  const externalItems = useNFTStore((s) => s.externalItems);
  const externalLoading = useNFTStore((s) => s.externalLoading);
  const externalHasMore = useNFTStore((s) => s.externalHasMore);
  const externalTotalSupply = useNFTStore((s) => s.externalTotalSupply);
  const loadExternalPage = useNFTStore((s) => s.loadExternalPage);
  const externalListings = useNFTStore((s) => s.externalListings);
  const externalTransactions = useNFTStore((s) => s.externalTransactions);
  const externalMarketLoading = useNFTStore((s) => s.externalMarketLoading);
  const loadExternalMarketData = useNFTStore((s) => s.loadExternalMarketData);

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<ExtCollectionTab>('items');

  // Filter/sort state
  const [sortBy, setSortBy] = useState<SortOption>('token-id');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(true);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [traitFilters, setTraitFilters] = useState<Map<string, Set<string>>>(new Map());

  // Failed image tracking
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const handleImageFailed = useCallback((tokenId: number) => {
    setFailedImages((prev) => {
      if (prev.has(tokenId)) return prev;
      const next = new Set(prev);
      next.add(tokenId);
      return next;
    });
  }, []);

  const items = collectionId ? (externalItems.get(collectionId) || []) : [];
  const loading = collectionId ? (externalLoading.get(collectionId) || false) : false;
  const hasMore = collectionId ? (externalHasMore.get(collectionId) ?? true) : false;
  const total = collectionId
    ? (externalTotalSupply.get(collectionId) || collection?.totalSupply || 0)
    : 0;
  const listings = collectionId ? externalListings.get(collectionId) : undefined;
  const transactions = collectionId ? (externalTransactions.get(collectionId) || []) : [];
  const marketLoading = collectionId ? (externalMarketLoading.get(collectionId) || false) : false;

  // Compute collection stats from market data
  const stats = useMemo(() => {
    if (!listings && transactions.length === 0) return null;
    return computeCollectionStats(listings, transactions, total);
  }, [listings, transactions, total]);

  // Build recently-sold lookup for sort
  const recentlySoldMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const tx of transactions) {
      const existing = map.get(tx.tokenIndex);
      if (!existing || tx.time > existing) {
        map.set(tx.tokenIndex, tx.time);
      }
    }
    return map;
  }, [transactions]);

  // Active filter count for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (priceRange.min || priceRange.max) count++;
    for (const values of traitFilters.values()) {
      if (values.size > 0) count++;
    }
    return count;
  }, [statusFilter, priceRange, traitFilters]);

  // Client-side filtering and sorting (with failed image exclusion)
  const filteredItems = useMemo(() => {
    let result = items.filter((item) => !failedImages.has(item.id));

    // 1. Status filter
    if (statusFilter === 'listed') {
      result = result.filter((item) => listings?.has(item.id));
    } else if (statusFilter === 'not-listed') {
      result = result.filter((item) => !listings?.has(item.id));
    }

    // 2. Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(term));
    }

    // 3. Price range filter
    if (priceRange.min) {
      const minPrice = parseFloat(priceRange.min);
      if (!isNaN(minPrice)) {
        result = result.filter((item) => {
          const listing = listings?.get(item.id);
          return listing != null && listing.price >= minPrice;
        });
      }
    }
    if (priceRange.max) {
      const maxPrice = parseFloat(priceRange.max);
      if (!isNaN(maxPrice)) {
        result = result.filter((item) => {
          const listing = listings?.get(item.id);
          return listing != null && listing.price <= maxPrice;
        });
      }
    }

    // 4. Trait filters
    for (const [category, values] of traitFilters.entries()) {
      if (values.size > 0) {
        result = result.filter((item) =>
          item.traits.some((t) => t.category === category && values.has(t.value))
        );
      }
    }

    // 5. Sort
    if (sortBy === 'token-id') {
      result.sort((a, b) => a.id - b.id);
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => {
        const aPrice = listings?.get(a.id)?.price ?? Infinity;
        const bPrice = listings?.get(b.id)?.price ?? Infinity;
        return aPrice - bPrice;
      });
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => {
        const aPrice = listings?.get(a.id)?.price ?? -Infinity;
        const bPrice = listings?.get(b.id)?.price ?? -Infinity;
        return bPrice - aPrice;
      });
    } else if (sortBy === 'recently-listed') {
      result.sort((a, b) => {
        const aListed = listings?.has(a.id) ? 0 : 1;
        const bListed = listings?.has(b.id) ? 0 : 1;
        if (aListed !== bListed) return aListed - bListed;
        return a.id - b.id;
      });
    } else if (sortBy === 'recently-sold') {
      result.sort((a, b) => {
        const aTime = recentlySoldMap.get(a.id) ?? 0;
        const bTime = recentlySoldMap.get(b.id) ?? 0;
        return bTime - aTime;
      });
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [items, listings, sortBy, statusFilter, searchTerm, priceRange, traitFilters, failedImages, recentlySoldMap]);

  useEffect(() => {
    if (collectionId && items.length === 0 && !loading) {
      loadExternalPage(collectionId);
    }
  }, [collectionId, items.length, loading, loadExternalPage]);

  // Load market data (listings + transactions) when collection loads
  useEffect(() => {
    if (collectionId && collection?.standard === 'ext') {
      loadExternalMarketData(collectionId);
    }
  }, [collectionId, collection?.standard, loadExternalMarketData]);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && hasMore && !loading && collectionId) {
        loadExternalPage(collectionId);
      }
    },
    [hasMore, loading, collectionId, loadExternalPage]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleIntersection, { rootMargin: '400px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersection]);

  if (!collection) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Not Found' }]} />
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-os-text-secondary text-lg">Collection not found</p>
          <p className="text-sm text-os-text-secondary/60">The collection &ldquo;{collectionId}&rdquo; does not exist.</p>
          <a href="/" className="btn btn-md btn-primary">Back to Explore</a>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Professional Hero Banner */}
      <CollectionHero
        collection={collection}
        stats={stats}
        marketLoading={marketLoading}
      />

      {/* Tabs */}
      <CollectionTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        txCount={transactions.length}
        chatCount={chatCount}
      />

      {/* Tab Content */}
      {activeTab === 'items' && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-5">
          {/* Results Bar */}
          <CollectionResultsBar
            totalCount={items.length - failedImages.size}
            filteredCount={filteredItems.length}
            sortBy={sortBy}
            setSortBy={(v) => setSortBy(v as SortOption)}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            viewMode={viewMode}
            setViewMode={setViewMode}
            filterOpen={filterOpen}
            toggleFilter={() => setFilterOpen((prev) => !prev)}
            activeFilterCount={activeFilterCount}
            statusFilter={statusFilter}
            setStatusFilter={(v) => setStatusFilter(v as StatusFilter)}
          />

          {/* Main layout: sidebar + content */}
          {items.length === 0 && loading ? (
            <SkeletonGrid count={10} />
          ) : (
            <div className="flex gap-5">
              {/* Desktop filter sidebar */}
              <div className="hidden lg:block">
                {filterOpen && (
                  <CollectionFilterSidebar
                    items={items}
                    listings={listings}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    traitFilters={traitFilters}
                    setTraitFilters={setTraitFilters}
                    onClose={() => setFilterOpen(false)}
                  />
                )}
              </div>

              {/* Mobile filter overlay */}
              {filterOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                  <div
                    className="absolute inset-0 bg-black/50"
                    onClick={() => setFilterOpen(false)}
                  />
                  <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-os-bg overflow-y-auto">
                    <CollectionFilterSidebar
                      items={items}
                      listings={listings}
                      statusFilter={statusFilter}
                      setStatusFilter={setStatusFilter}
                      priceRange={priceRange}
                      setPriceRange={setPriceRange}
                      traitFilters={traitFilters}
                      setTraitFilters={setTraitFilters}
                      onClose={() => setFilterOpen(false)}
                    />
                  </div>
                </div>
              )}

              {/* Main content */}
              <div className="flex-1 min-w-0">
                {viewMode === 'grid' ? (
                  <div
                    className={`grid grid-cols-2 md:grid-cols-3 ${
                      filterOpen
                        ? 'lg:grid-cols-3 xl:grid-cols-4'
                        : 'lg:grid-cols-4 xl:grid-cols-5'
                    } gap-4 pb-4`}
                  >
                    {filteredItems.map((item) => (
                      <ExtNFTCard
                        key={`${collection.id}-${item.id}`}
                        item={item}
                        collectionName={collection.name}
                        listing={listings?.get(item.id)}
                        viewMode="grid"
                        onImageFailed={() => handleImageFailed(item.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 pb-4">
                    {filteredItems.map((item) => (
                      <ExtNFTCard
                        key={`${collection.id}-${item.id}`}
                        item={item}
                        collectionName={collection.name}
                        listing={listings?.get(item.id)}
                        viewMode="list"
                        onImageFailed={() => handleImageFailed(item.id)}
                      />
                    ))}
                  </div>
                )}

                {hasMore && (
                  <div ref={sentinelRef} className="py-10 text-center">
                    {loading && (
                      <div className="w-7 h-7 border-2 border-os-primary/30 border-t-os-primary rounded-full animate-spin mx-auto" />
                    )}
                  </div>
                )}

                {!hasMore && items.length > 0 && (
                  <p className="text-center text-os-text-secondary text-sm py-10 tracking-wide font-medium">
                    {(items.length - failedImages.size).toLocaleString()} items loaded
                  </p>
                )}
              </div>

              {/* Right sidebar with ads */}
              <aside className="hidden xl:block w-[240px] shrink-0">
                <div className="sticky top-[80px] space-y-4">
                  <AdSlot placement="sidebar" />
                  <SidebarWidgets />
                </div>
              </aside>
            </div>
          )}

          {/* Banner ad below items grid */}
          <div className="mt-6">
            <AdSlot placement="banner" />
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <CollectionActivityTable
          transactions={transactions}
          collectionId={collection.id}
          collectionName={collection.name}
          canisterId={collection.canisterId}
        />
      )}

      {activeTab === 'analytics' && (
        <CollectionAnalytics
          transactions={transactions}
          stats={stats}
          collectionName={collection.name}
        />
      )}

      {activeTab === 'chat' && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
          <div className="flex gap-5">
            {/* Left vertical ad banner */}
            <aside className="hidden xl:block w-[160px] shrink-0">
              <div className="sticky top-[80px] space-y-4">
                <AdSlot placement="sidebar" />
                <AdSlot placement="sidebar" />
              </div>
            </aside>

            {/* Center chat */}
            <div className="flex-1 min-w-0">
              <div className="rounded-2xl border border-os-border/50 bg-os-surface p-5">
                <ShareChat threadId={`collection-${collectionId}`} title="Collection Discussion" />
              </div>
            </div>

            {/* Right vertical ad banner + widgets */}
            <aside className="hidden lg:block w-[240px] shrink-0">
              <div className="sticky top-[80px] space-y-4">
                <AdSlot placement="sidebar" />
                <AdSlot placement="sidebar" />
                <SidebarWidgets />
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* Feed ad before about section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-6">
        <AdSlot placement="feed" />
      </div>

      {/* About Section */}
      <CollectionAboutSection collection={collection} />
    </div>
  );
};

export default ExternalCollection;
