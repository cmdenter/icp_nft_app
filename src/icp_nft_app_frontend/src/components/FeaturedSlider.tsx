import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from './icons';
import { useNFTStore } from '../store/nftStore';
import type { GalleryItem } from '../types';

export const FeaturedSlider: React.FC = () => {
  const navigate = useNavigate();
  const pages = useNFTStore((s) => s.pages);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Pick featured items (e.g. legendaries and rares)
  const allItems: GalleryItem[] = [];
  for (const [, items] of pages) allItems.push(...items);

  const featured = allItems
    .filter((item) => {
      const rarity = item.traits?.find((t) => t.category === 'Rarity')?.value;
      return rarity === 'Legendary' || rarity === 'Rare';
    })
    .slice(0, 12);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll);
    checkScroll();
    return () => el.removeEventListener('scroll', checkScroll);
  }, [featured.length]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (featured.length === 0) return null;

  return (
    <div className="relative mb-6">
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-lg font-bold text-white">Notable Items</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="w-8 h-8 rounded-full bg-os-surface border border-os-border flex items-center justify-center disabled:opacity-30 hover:bg-os-card transition-colors shadow-lg backdrop-blur-sm"
          >
            <ChevronLeft size={16} className="text-white" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="w-8 h-8 rounded-full bg-os-surface border border-os-border flex items-center justify-center disabled:opacity-30 hover:bg-os-card transition-colors shadow-lg backdrop-blur-sm"
          >
            <ChevronRight size={16} className="text-white" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar px-4 pb-2"
      >
        {featured.map((item) => {
          const rarity = item.traits?.find((t) => t.category === 'Rarity')?.value;
          return (
            <div
              key={item.id}
              onClick={() => navigate(`/nft/${item.id}`)}
              className="shrink-0 w-[240px] rounded-2xl bg-os-surface border border-os-border overflow-hidden cursor-pointer hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-250 group"
            >
              <div className="aspect-square bg-os-card overflow-hidden relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-250 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {rarity && (
                  <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                    rarity === 'Legendary' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-purple-400/20 text-purple-400'
                  }`}>
                    {rarity}
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs text-os-text-secondary">ICP Speed NFTs</p>
                <p className="text-sm font-semibold text-white truncate mt-0.5">{item.name}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#E5E8EB">
                    <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                  </svg>
                  <span className="text-sm font-bold text-white">
                    {(0.01 + item.id * 0.005).toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
