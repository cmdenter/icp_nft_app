import React, { useMemo } from 'react';
import { useAdminStore } from '../store/adminStore';
import { ExternalLink } from './icons';

interface AdSlotProps {
  placement: 'sidebar' | 'feed' | 'banner';
}

export const AdSlot: React.FC<AdSlotProps> = ({ placement }) => {
  const ads = useAdminStore((s) => s.ads);

  const ad = useMemo(() => {
    const active = ads.filter((a) => a.active && a.placement === placement);
    if (active.length === 0) return null;
    return active[Math.floor(Math.random() * active.length)];
  }, [ads, placement]);

  if (!ad) return null;

  return (
    <a
      href={ad.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl bg-os-surface border border-os-border/40 overflow-hidden hover:border-os-primary/30 transition-all group"
    >
      {ad.imageUrl && (
        <div className="h-32 overflow-hidden bg-os-card">
          <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      <div className="p-3.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-os-text-secondary/60 bg-os-card px-1.5 py-0.5 rounded">
            Sponsored
          </span>
        </div>
        <h4 className="text-sm font-semibold text-white group-hover:text-os-primary transition-colors mb-1">
          {ad.title}
        </h4>
        <p className="text-[12px] text-os-text-secondary line-clamp-2">{ad.description}</p>
        <div className="flex items-center gap-1 mt-2 text-[11px] text-os-primary">
          Learn more <ExternalLink size={10} />
        </div>
      </div>
    </a>
  );
};
