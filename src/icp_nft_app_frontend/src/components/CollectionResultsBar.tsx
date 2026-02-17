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
  statusFilter: string;
  setStatusFilter: (v: string) => void;
}

const STATUS_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'listed', label: 'Listed' },
  { key: 'not-listed', label: 'Not Listed' },
];

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
  statusFilter,
  setStatusFilter,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 py-4 mb-4 border-b border-os-border/20">

      {/* ── Group 1: Filter toggle ── */}
      <button
        onClick={toggleFilter}
        className={`h-9 px-4 rounded-lg text-[13px] font-medium flex items-center gap-2 border transition-colors ${
          filterOpen
            ? 'bg-os-primary/10 border-os-primary/40 text-os-primary'
            : 'bg-os-surface border-os-border/30 text-os-text-secondary hover:border-os-border/60 hover:text-white'
        }`}
      >
        <FilterIcon size={14} />
        Filters
        {activeFilterCount > 0 && (
          <span className="bg-os-primary text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center leading-none">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* ── 1px divider ── */}
      <div className="w-px h-5 bg-os-border/30 hidden sm:block" />

      {/* ── Group 2: Status chips ── */}
      <div className="flex items-center gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setStatusFilter(opt.key)}
            className={`h-8 px-3 rounded-full text-[13px] font-medium transition-colors ${
              statusFilter === opt.key
                ? 'bg-os-primary/15 text-os-primary'
                : 'bg-os-surface/60 text-os-text-secondary hover:text-white hover:bg-os-surface'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── 1px divider ── */}
      <div className="w-px h-5 bg-os-border/30 hidden sm:block" />

      {/* ── Group 3: Search ── */}
      <div className="h-9 bg-os-surface border border-os-border/30 rounded-lg px-3 text-[13px] flex items-center gap-2 flex-1 min-w-[180px] max-w-[280px]">
        <SearchIcon size={14} className="text-os-text-secondary/60 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search collection..."
          className="bg-transparent outline-none text-white placeholder:text-os-text-secondary/40 w-full"
        />
      </div>

      {/* ── Group 4: Right side — count, sort, view ── */}
      <div className="flex items-center gap-3 ml-auto">
        <span className="text-[12px] text-os-text-secondary/70 font-medium tabular-nums whitespace-nowrap">
          {filteredCount === totalCount
            ? `${totalCount.toLocaleString()} items`
            : `${filteredCount.toLocaleString()} of ${totalCount.toLocaleString()}`}
        </span>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-9 bg-os-surface border border-os-border/30 rounded-lg pl-3 pr-7 text-[13px] text-white
                     focus:outline-none focus:border-os-primary/40 cursor-pointer appearance-none
                     bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]
                     bg-no-repeat bg-[right_8px_center]"
        >
          <option value="token-id">Token ID</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="recently-listed">Recently Listed</option>
          <option value="recently-sold">Recently Sold</option>
          <option value="name-asc">Name: A to Z</option>
        </select>

        <div className="flex items-center bg-os-surface border border-os-border/30 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`h-7 w-7 flex items-center justify-center rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-os-primary/15 text-os-primary'
                : 'text-os-text-secondary hover:text-white'
            }`}
          >
            <GridIcon size={14} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`h-7 w-7 flex items-center justify-center rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-os-primary/15 text-os-primary'
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
