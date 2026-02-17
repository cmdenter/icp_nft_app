import React from 'react';
import type { GridDensity } from '../types';

export const SkeletonCard: React.FC = () => (
  <div className="rounded-2xl bg-os-surface border border-os-border/40 overflow-hidden">
    <div className="aspect-square skeleton" />
    <div className="p-3">
      <div className="h-3 w-1/3 rounded skeleton mb-2" />
      <div className="h-4 w-3/4 rounded skeleton mb-3" />
      <div className="border-t border-os-border pt-2 mt-2 flex justify-between">
        <div className="h-3 w-16 rounded skeleton" />
        <div className="h-3 w-12 rounded skeleton" />
      </div>
    </div>
  </div>
);

export const SkeletonGrid: React.FC<{ count?: number; density?: GridDensity }> = ({
  count = 20,
  density = 'medium',
}) => {
  const gridCols =
    density === 'large'
      ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      : density === 'medium'
        ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
        : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export const SkeletonActivityRow: React.FC = () => (
  <div className="grid grid-cols-[120px_1fr_120px_1fr_1fr_100px] gap-4 px-4 py-3 border-b border-os-border/30">
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-lg skeleton" />
      <div className="h-4 w-16 rounded skeleton" />
    </div>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg skeleton" />
      <div className="h-4 w-24 rounded skeleton" />
    </div>
    <div className="h-4 w-16 rounded skeleton" />
    <div className="h-4 w-20 rounded skeleton" />
    <div className="h-4 w-20 rounded skeleton" />
    <div className="h-4 w-12 rounded skeleton ml-auto" />
  </div>
);

export const SkeletonBanner: React.FC = () => (
  <div>
    <div className="h-[220px] skeleton" />
    <div className="max-w-[1400px] mx-auto px-4 -mt-16 flex items-end gap-4">
      <div className="w-[130px] h-[130px] rounded-xl skeleton border-4 border-os-bg" />
      <div className="pb-4">
        <div className="h-8 w-48 rounded skeleton mb-2" />
        <div className="h-4 w-64 rounded skeleton" />
      </div>
    </div>
  </div>
);
