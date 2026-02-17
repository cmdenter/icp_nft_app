import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, XIcon } from './icons';
import type { GalleryItem } from '../types';
import type { ExtListing } from '../api/ext-market';

type StatusFilter = 'all' | 'listed' | 'not-listed';

interface CollectionFilterSidebarProps {
  items: GalleryItem[];
  listings: Map<number, ExtListing> | undefined;
  statusFilter: StatusFilter;
  setStatusFilter: (v: StatusFilter) => void;
  priceRange: { min: string; max: string };
  setPriceRange: (v: { min: string; max: string }) => void;
  traitFilters: Map<string, Set<string>>;
  setTraitFilters: (v: Map<string, Set<string>>) => void;
  onClose: () => void;
}

export const CollectionFilterSidebar: React.FC<CollectionFilterSidebarProps> = ({
  items,
  listings,
  statusFilter,
  setStatusFilter,
  priceRange,
  setPriceRange,
  traitFilters,
  setTraitFilters,
  onClose,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    status: true,
    price: true,
  });

  // Local price inputs (only applied on "Go")
  const [localMin, setLocalMin] = useState(priceRange.min);
  const [localMax, setLocalMax] = useState(priceRange.max);

  // Compute trait category -> value -> count from items
  const traitMap = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const item of items) {
      for (const trait of item.traits) {
        let valueMap = map.get(trait.category);
        if (!valueMap) {
          valueMap = new Map();
          map.set(trait.category, valueMap);
        }
        valueMap.set(trait.value, (valueMap.get(trait.value) || 0) + 1);
      }
    }
    return map;
  }, [items]);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTraitToggle = (category: string, value: string) => {
    const next = new Map(traitFilters);
    const existing = next.get(category);
    const values = existing ? new Set(existing) : new Set<string>();
    if (values.has(value)) {
      values.delete(value);
    } else {
      values.add(value);
    }
    if (values.size === 0) {
      next.delete(category);
    } else {
      next.set(category, values);
    }
    setTraitFilters(next);
  };

  const handlePriceGo = () => {
    setPriceRange({ min: localMin, max: localMax });
  };

  // Initialize open state for trait sections on first render
  const traitCategories = useMemo(() => Array.from(traitMap.keys()).sort(), [traitMap]);

  return (
    <div className="w-[260px] shrink-0 bg-os-surface/60 border-r border-os-border/30 p-4 sticky top-[88px] max-h-[calc(100vh-88px)] overflow-y-auto">
      {/* Mobile close button */}
      <div className="flex items-center justify-between mb-3 lg:hidden">
        <span className="text-sm font-bold text-white">Filters</span>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-os-card/60 text-os-text-secondary hover:text-white transition-colors">
          <XIcon size={18} />
        </button>
      </div>

      {/* Status Section */}
      <div className="border-b border-os-border/30 py-3">
        <button
          onClick={() => toggleSection('status')}
          className="flex items-center justify-between w-full text-sm font-bold text-white"
        >
          Status
          {openSections['status'] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {openSections['status'] && (
          <div className="mt-2 flex flex-col gap-1">
            {([
              { value: 'all' as const, label: 'All' },
              { value: 'listed' as const, label: 'Listed' },
              { value: 'not-listed' as const, label: 'Not Listed' },
            ]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold text-left transition-all duration-250 ${
                  statusFilter === opt.value
                    ? 'bg-os-primary/20 text-os-primary'
                    : 'text-os-text-secondary hover:text-white hover:bg-os-surface'
                }`}
              >
                {opt.label}
                {opt.value === 'listed' && listings && (
                  <span className="ml-1.5 text-[11px] opacity-60">({listings.size})</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Section */}
      <div className="border-b border-os-border/30 py-3">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-sm font-bold text-white"
        >
          Price (ICP)
          {openSections['price'] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {openSections['price'] && (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              className="w-full bg-os-card border border-os-border/40 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-os-text-secondary/50 focus:outline-none focus:border-os-primary/50"
            />
            <span className="text-os-text-secondary text-xs">-</span>
            <input
              type="number"
              placeholder="Max"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              className="w-full bg-os-card border border-os-border/40 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-os-text-secondary/50 focus:outline-none focus:border-os-primary/50"
            />
            <button
              onClick={handlePriceGo}
              className="px-3 py-1.5 bg-os-primary/20 text-os-primary text-xs font-bold rounded-lg hover:bg-os-primary/30 transition-colors shrink-0"
            >
              Go
            </button>
          </div>
        )}
      </div>

      {/* Trait Sections */}
      {traitCategories.map((category) => {
        const values = traitMap.get(category);
        if (!values) return null;
        const isOpen = openSections[`trait-${category}`] ?? false;
        const selectedValues = traitFilters.get(category);

        return (
          <div key={category} className="border-b border-os-border/30 py-3">
            <button
              onClick={() => toggleSection(`trait-${category}`)}
              className="flex items-center justify-between w-full text-sm font-bold text-white"
            >
              <span className="truncate">{category}</span>
              {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {isOpen && (
              <div className="mt-2 flex flex-col gap-1 max-h-[200px] overflow-y-auto">
                {Array.from(values.entries())
                  .sort((a, b) => b[1] - a[1])
                  .map(([value, count]) => {
                    const checked = selectedValues?.has(value) ?? false;
                    return (
                      <label
                        key={value}
                        className="flex items-center gap-2 px-1 py-1 rounded cursor-pointer hover:bg-os-card/40 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleTraitToggle(category, value)}
                          className="w-3.5 h-3.5 rounded border-os-border/40 bg-os-card accent-[var(--color-os-primary)] cursor-pointer"
                        />
                        <span className="text-xs text-os-text-secondary flex-1 truncate">{value}</span>
                        <span className="text-[11px] text-os-text-secondary/60 bg-os-card/60 px-1.5 py-0.5 rounded-md tabular-nums">
                          {count}
                        </span>
                      </label>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
