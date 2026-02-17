import React from 'react';
import { FilterIcon, SearchIcon, GridIcon, ListIcon } from './icons';

interface CollectionResultsBarProps {
  totalCount: number;
  filteredCount: number;
  sortBy: string;
  setSortBy: (v: string) => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (v: 'grid' | 'list') => void;
  filterOpen: boolean;
  toggleFilter: () => void;
  activeFilterCount: number;
}

export const CollectionResultsBar: React.FC<CollectionResultsBarProps> = ({
  totalCount,
  filteredCount,
  sortBy,
  setSortBy,
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  filterOpen,
  toggleFilter,
  activeFilterCount,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-5 pb-4 border-b border-os-border/30">
      {/* Filter toggle button */}
      <button
        onClick={toggleFilter}
        className={`bg-os-surface border border-os-border/40 rounded-lg px-3 py-2 text-sm flex items-center gap-2 transition-colors hover:border-os-primary/30 ${
          filterOpen ? 'border-os-primary/50 text-os-primary' : 'text-os-text-secondary'
        }`}
      >
        <FilterIcon size={14} />
        <span className="font-medium">Filters</span>
        {activeFilterCount > 0 && (
          <span className="bg-os-primary text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Search input */}
      <div className="bg-os-surface border border-os-border/40 rounded-lg px-3 py-2 text-sm flex items-center gap-2 flex-1 min-w-[200px] max-w-[320px]">
        <SearchIcon size={14} className="text-os-text-secondary shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search in this collection..."
          className="bg-transparent outline-none text-white placeholder:text-os-text-secondary/50 w-full text-sm"
        />
      </div>

      {/* Right side: count + sort + view toggle */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Results count */}
        <span className="text-xs text-os-text-secondary font-medium tabular-nums whitespace-nowrap">
          {filteredCount === totalCount
            ? `${totalCount.toLocaleString()} items`
            : `${filteredCount.toLocaleString()} of ${totalCount.toLocaleString()} items`}
        </span>

        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-os-surface border border-os-border/40 rounded-lg px-3 py-2 text-sm text-white
                     focus:outline-none focus:border-os-primary/50 cursor-pointer appearance-none
                     bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]
                     bg-no-repeat bg-[right_8px_center] pr-7"
        >
          <option value="token-id">Token ID</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="recently-listed">Recently Listed</option>
          <option value="recently-sold">Recently Sold</option>
          <option value="name-asc">Name: A to Z</option>
        </select>

        {/* View toggle */}
        <div className="flex items-center gap-0.5 bg-os-surface/50 border border-os-border/40 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all duration-250 ${
              viewMode === 'grid'
                ? 'bg-os-primary/20 text-os-primary'
                : 'text-os-text-secondary hover:text-white'
            }`}
          >
            <GridIcon size={14} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all duration-250 ${
              viewMode === 'list'
                ? 'bg-os-primary/20 text-os-primary'
                : 'text-os-text-secondary hover:text-white'
            }`}
          >
            <ListIcon size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
