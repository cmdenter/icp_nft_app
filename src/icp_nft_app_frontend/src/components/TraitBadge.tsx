import React from 'react';
import type { Trait } from '../types';

interface Props {
  trait: Trait;
  percentage?: number;
}

export const TraitBadge: React.FC<Props> = ({ trait, percentage }) => (
  <div className="bg-os-primary/10 border border-os-primary/20 rounded-xl px-4 py-3 text-center hover:bg-os-primary/15 hover:border-os-primary/30 transition-all duration-250 shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
    <p className="text-[11px] uppercase tracking-[0.12em] text-os-primary font-bold">
      {trait.category}
    </p>
    <p className="text-[15px] font-bold text-white mt-0.5">
      {trait.value}
    </p>
    {percentage !== undefined && (
      <p className="text-[11px] text-os-text-secondary mt-0.5">
        {percentage.toFixed(1)}% have this trait
      </p>
    )}
  </div>
);
