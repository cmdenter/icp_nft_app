import React from 'react';
import { FilterIcon, GridIcon, GridSmallIcon, ListIcon, SearchIcon } from './icons';
import { useNFTStore } from '../store/nftStore';
import type { GridDensity, SortOption } from '../types';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Recently Created' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'id-asc', label: 'Token ID Asc' },
  { value: 'id-desc', label: 'Token ID Desc' },
];

export const GridControls: React.FC = () => {
  const totalSupply = useNFTStore((s) => s.totalSupply);
  const filterSidebarOpen = useNFTStore((s) => s.filterSidebarOpen);
  const setFilterSidebarOpen = useNFTStore((s) => s.setFilterSidebarOpen);
  const gridDensity = useNFTStore((s) => s.gridDensity);
  const setGridDensity = useNFTStore((s) => s.setGridDensity);
  const sortOption = useNFTStore((s) => s.sortOption);
  const setSortOption = useNFTStore((s) => s.setSortOption);
  const activeTraitFilters = useNFTStore((s) => s.activeTraitFilters);
  const clearTraitFilters = useNFTStore((s) => s.clearTraitFilters);

  const densities: { key: GridDensity; icon: React.ReactNode }[] = [
    { key: 'large', icon: <GridIcon size={16} /> },
    { key: 'medium', icon: <GridSmallIcon size={16} /> },
    { key: 'small', icon: <ListIcon size={16} /> },
  ];

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Filter toggle */}
      <button
        onClick={() => setFilterSidebarOpen(!filterSidebarOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
          filterSidebarOpen
            ? 'bg-os-primary text-white'
            : 'bg-os-surface border border-os-border text-os-text-secondary hover:text-white hover:bg-os-card'
        }`}
      >
        <FilterIcon size={16} />
        <span className="hidden sm:inline">Filters</span>
        {activeTraitFilters.length > 0 && (
          <span className="bg-white text-os-primary text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {activeTraitFilters.length}
          </span>
        )}
      </button>

      {activeTraitFilters.length > 0 && (
        <button
          onClick={clearTraitFilters}
          className="text-xs text-os-primary hover:text-os-primary-hover font-semibold transition-colors"
        >
          Clear all
        </button>
      )}

      {/* Search within collection */}
      <div className="hidden md:flex items-center bg-os-surface border border-os-border rounded-xl px-3 py-2 flex-1 max-w-xs">
        <SearchIcon size={14} className="text-os-text-secondary shrink-0" />
        <input
          type="text"
          placeholder="Search by name or attribute"
          className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-os-text-secondary ml-2"
        />
      </div>

      {/* Results count */}
      <span className="text-sm text-os-text-secondary ml-auto">
        {totalSupply.toLocaleString()} results
      </span>

      {/* Sort */}
      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value as SortOption)}
        className="bg-os-surface border border-os-border rounded-xl px-3 py-2.5 text-sm text-white outline-none cursor-pointer hover:bg-os-card transition-colors"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-os-surface">
            {opt.label}
          </option>
        ))}
      </select>

      {/* Grid density */}
      <div className="flex items-center border border-os-border rounded-xl overflow-hidden">
        {densities.map((d) => (
          <button
            key={d.key}
            onClick={() => setGridDensity(d.key)}
            className={`p-2.5 transition-colors ${
              gridDensity === d.key
                ? 'bg-os-card text-white'
                : 'text-os-text-secondary hover:text-white hover:bg-os-surface'
            }`}
          >
            {d.icon}
          </button>
        ))}
      </div>
    </div>
  );
};
