import React, { useState } from 'react';
import { ChevronDown, SearchIcon, XIcon } from './icons';
import { useNFTStore } from '../store/nftStore';

export const FilterSidebar: React.FC = () => {
  const collection = useNFTStore((s) => s.collection);
  const activeTraitFilters = useNFTStore((s) => s.activeTraitFilters);
  const toggleTraitFilter = useNFTStore((s) => s.toggleTraitFilter);
  const totalSupply = useNFTStore((s) => s.totalSupply);
  const setFilterSidebarOpen = useNFTStore((s) => s.setFilterSidebarOpen);

  const categories = collection?.traits || [];

  return (
    <div className="w-[340px] shrink-0 border-r border-os-border bg-os-bg overflow-y-auto h-[calc(100vh-280px)] sticky top-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-os-border">
        <span className="text-base font-bold text-white">Filters</span>
        <button
          onClick={() => setFilterSidebarOpen(false)}
          aria-label="Close filters"
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-os-surface transition-colors"
        >
          <XIcon size={16} className="text-os-text-secondary" />
        </button>
      </div>

      {/* Status Filter */}
      <FilterSection title="Status" defaultOpen>
        <div className="flex gap-2" role="group" aria-label="Status filter">
          {['All', 'Listed', 'Not Listed'].map((status) => (
            <button
              key={status}
              aria-pressed={status === 'All'}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                status === 'All'
                  ? 'bg-os-primary text-white'
                  : 'bg-os-surface text-os-text-secondary hover:bg-os-card hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price Filter */}
      <FilterSection title="Price">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <input
              type="number"
              placeholder="Min"
              aria-label="Minimum price"
              className="w-full bg-os-surface border border-os-border rounded-lg px-3 py-2 text-sm text-white placeholder-os-text-secondary focus:outline-none focus:border-os-primary focus:ring-2 focus:ring-os-primary/30"
            />
          </div>
          <span className="text-os-text-secondary text-sm">to</span>
          <div className="flex-1">
            <input
              type="number"
              placeholder="Max"
              aria-label="Maximum price"
              className="w-full bg-os-surface border border-os-border rounded-lg px-3 py-2 text-sm text-white placeholder-os-text-secondary focus:outline-none focus:border-os-primary focus:ring-2 focus:ring-os-primary/30"
            />
          </div>
        </div>
        <button className="w-full mt-2 bg-os-primary hover:bg-os-primary-hover text-white text-sm font-semibold py-2 rounded-lg transition-colors">
          Apply
        </button>
      </FilterSection>

      {/* Trait Filters */}
      {categories.map((cat) => (
        <TraitCategory
          key={cat.category}
          category={cat.category}
          values={cat.values}
          totalSupply={totalSupply || collection?.totalSupply || 1}
          activeFilters={activeTraitFilters}
          onToggle={toggleTraitFilter}
        />
      ))}

      {categories.length === 0 && (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-os-text-secondary">No traits available</p>
        </div>
      )}
    </div>
  );
};

// Reusable collapsible filter section
const FilterSection: React.FC<{
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-os-border">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-os-surface/50 transition-colors"
      >
        <span className="text-sm font-semibold text-white">{title}</span>
        <ChevronDown
          size={16}
          className={`text-os-text-secondary transition-transform duration-250 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
};

// Trait category with search
interface TraitCategoryProps {
  category: string;
  values: { value: string; count: number }[];
  totalSupply: number;
  activeFilters: { category: string; value: string }[];
  onToggle: (filter: { category: string; value: string }) => void;
}

const TraitCategory: React.FC<TraitCategoryProps> = ({
  category,
  values,
  totalSupply,
  activeFilters,
  onToggle,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = search
    ? values.filter((v) => v.value.toLowerCase().includes(search.toLowerCase()))
    : values;

  const activeCount = activeFilters.filter((f) => f.category === category).length;

  return (
    <div className="border-b border-os-border">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-os-surface/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{category}</span>
          {activeCount > 0 && (
            <span className="bg-os-primary text-white text-[11px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {activeCount}
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-os-text-secondary transition-transform duration-250 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-3">
          {/* Search within trait */}
          <div className="flex items-center bg-os-surface border border-os-border rounded-lg px-2.5 py-1.5 mb-2">
            <SearchIcon size={14} className="text-os-text-secondary shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${category}`}
              aria-label={`Search ${category} traits`}
              className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-os-text-secondary ml-2"
            />
          </div>

          {/* Trait values */}
          <div className="max-h-[200px] overflow-y-auto space-y-0.5">
            {filtered.map((v) => {
              const isActive = activeFilters.some(
                (f) => f.category === category && f.value === v.value
              );
              const pct = ((v.count / totalSupply) * 100).toFixed(0);

              return (
                <button
                  key={v.value}
                  onClick={() => onToggle({ category, value: v.value })}
                  role="checkbox"
                  aria-checked={isActive}
                  aria-label={`${v.value} (${v.count} items)`}
                  className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-os-primary/15'
                      : 'hover:bg-os-surface'
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-os-primary border-os-primary'
                        : 'border-os-text-secondary'
                    }`}
                  >
                    {isActive && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                        <path d="M8.5 2.5L4 7L1.5 4.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  <span className={`flex-1 text-xs ${isActive ? 'text-white font-semibold' : 'text-os-text'}`}>
                    {v.value}
                  </span>
                  <span className="text-[11px] text-os-text-secondary">
                    {v.count} ({pct}%)
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
