import React, { useEffect, useMemo } from 'react';
import { CollectionBanner } from '../components/CollectionBanner';
import { StatsBar } from '../components/StatsBar';
import { TabBar } from '../components/TabBar';
import { GridControls } from '../components/GridControls';
import { FilterSidebar } from '../components/FilterSidebar';
import { NFTGrid } from '../components/NFTGrid';
import { ActivityTable } from '../components/ActivityTable';
import { FeaturedSlider } from '../components/FeaturedSlider';
import { TrendingTable } from '../components/TrendingTable';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useNFTStore } from '../store/nftStore';

const Collection: React.FC = () => {
  const activeTab = useNFTStore((s) => s.activeTab);
  const filterSidebarOpen = useNFTStore((s) => s.filterSidebarOpen);
  const loadCollection = useNFTStore((s) => s.loadCollection);
  const totalSupply = useNFTStore((s) => s.totalSupply);
  const pages = useNFTStore((s) => s.pages);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  const collectionStats = useMemo(() => {
    let itemCount = 0;
    pages.forEach((items) => { itemCount += items.length; });
    return [
      { label: 'Total Supply', value: totalSupply.toLocaleString() },
      { label: 'Items Loaded', value: itemCount.toLocaleString() },
    ];
  }, [totalSupply, pages]);

  return (
    <div>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'My Collection' }]} />
      </div>
      <CollectionBanner />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-3">
        <StatsBar stats={collectionStats} />
      </div>
      <TabBar />

      {activeTab === 'items' ? (
        <div className="max-w-[1400px] mx-auto">
          {/* Featured slider */}
          <div className="pt-4">
            <FeaturedSlider />
          </div>

          {/* Trending table */}
          <TrendingTable />

          {/* Grid controls */}
          <GridControls />

          {/* Sidebar + Grid */}
          <div className="flex">
            {filterSidebarOpen && <FilterSidebar />}
            <NFTGrid />
          </div>
        </div>
      ) : (
        <ActivityTable />
      )}
    </div>
  );
};

export default Collection;
