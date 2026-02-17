import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { NFTCard } from './NFTCard';
import { SkeletonGrid } from './Skeleton';
import { useNFTStore } from '../store/nftStore';
import type { GalleryItem } from '../types';

export const NFTGrid: React.FC = () => {
  const pages = useNFTStore((s) => s.pages);
  const totalPages = useNFTStore((s) => s.totalPages);
  const totalSupply = useNFTStore((s) => s.totalSupply);
  const isLoadingPage = useNFTStore((s) => s.isLoadingPage);
  const loadedPages = useNFTStore((s) => s.loadedPages);
  const loadGalleryPage = useNFTStore((s) => s.loadGalleryPage);
  const gridDensity = useNFTStore((s) => s.gridDensity);
  const sortOption = useNFTStore((s) => s.sortOption);
  const activeTraitFilters = useNFTStore((s) => s.activeTraitFilters);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadedPages.has(0)) {
      loadGalleryPage(0);
    }
  }, [loadGalleryPage, loadedPages]);

  const nextPage = loadedPages.size;
  const hasMore = nextPage < totalPages;

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && hasMore && !isLoadingPage.has(nextPage)) {
        loadGalleryPage(nextPage);
      }
    },
    [hasMore, nextPage, isLoadingPage, loadGalleryPage]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleIntersection, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersection]);

  const allItems = useMemo(() => {
    const items: GalleryItem[] = [];
    const sortedPageNums = Array.from(pages.keys()).sort((a, b) => a - b);
    for (const pageNum of sortedPageNums) {
      const pageItems = pages.get(pageNum);
      if (pageItems) items.push(...pageItems);
    }

    let filtered = items;
    if (activeTraitFilters.length > 0) {
      filtered = items.filter((item) =>
        activeTraitFilters.every((filter) =>
          item.traits?.some(
            (t) => t.category === filter.category && t.value === filter.value
          )
        )
      );
    }

    const sorted = [...filtered];
    switch (sortOption) {
      case 'newest': sorted.sort((a, b) => b.mintedAt - a.mintedAt); break;
      case 'oldest': sorted.sort((a, b) => a.mintedAt - b.mintedAt); break;
      case 'name-asc': sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'id-asc': sorted.sort((a, b) => a.id - b.id); break;
      case 'id-desc': sorted.sort((a, b) => b.id - a.id); break;
    }

    return sorted;
  }, [pages, activeTraitFilters, sortOption]);

  const gridCols =
    gridDensity === 'large'
      ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      : gridDensity === 'medium'
        ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
        : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';

  if (allItems.length === 0 && isLoadingPage.size > 0) {
    return (
      <div className="p-4 flex-1">
        <SkeletonGrid density={gridDensity} />
      </div>
    );
  }

  if (allItems.length === 0 && totalSupply === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-os-text-secondary flex-1">
        <p className="text-xl mb-2">No NFTs yet</p>
        <p className="text-sm">Mint your first NFT to get started</p>
      </div>
    );
  }

  if (allItems.length === 0 && activeTraitFilters.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-os-text-secondary flex-1">
        <p className="text-lg mb-2">No items match your filters</p>
        <p className="text-sm">Try removing some filters</p>
      </div>
    );
  }

  return (
    <div className="p-4 flex-1">
      <div className={`grid ${gridCols} gap-3`}>
        {allItems.map((item) => (
          <NFTCard key={item.id} item={item} />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="mt-6">
          {isLoadingPage.size > 0 && <SkeletonGrid count={10} density={gridDensity} />}
        </div>
      )}

      {!hasMore && allItems.length > 0 && (
        <p className="text-center text-os-text-secondary text-sm mt-8">
          {allItems.length} items
        </p>
      )}
    </div>
  );
};
