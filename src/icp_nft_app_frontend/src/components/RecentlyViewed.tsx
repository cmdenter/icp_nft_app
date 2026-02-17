import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from './icons';
import { SafeImg } from './SafeImg';
import { useNFTStore } from '../store/nftStore';

export const RecentlyViewed: React.FC = () => {
  const navigate = useNavigate();
  const items = useNFTStore((s) => s.recentlyViewed);
  const loadRecentlyViewed = useNFTStore((s) => s.loadRecentlyViewed);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);

  useEffect(() => { loadRecentlyViewed(); }, [loadRecentlyViewed]);

  const check = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanL(el.scrollLeft > 4);
    setCanR(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    check();
    el.addEventListener('scroll', check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', check); ro.disconnect(); };
  }, [check, items.length]);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Recently Viewed</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll(-1)}
            disabled={!canL}
            className="w-8 h-8 rounded-full bg-os-surface border border-os-border/40 flex items-center justify-center disabled:opacity-30 hover:bg-os-card transition-colors"
          >
            <ChevronLeft size={14} className="text-white" />
          </button>
          <button
            onClick={() => scroll(1)}
            disabled={!canR}
            className="w-8 h-8 rounded-full bg-os-surface border border-os-border/40 flex items-center justify-center disabled:opacity-30 hover:bg-os-card transition-colors"
          >
            <ChevronRight size={14} className="text-white" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-2"
      >
        {items.map((item) => (
          <div
            key={`${item.collectionId || 'local'}-${item.id}`}
            onClick={() => {
              if (item.collectionId && item.collectionId !== 'local') {
                navigate(`/collection/${item.collectionId}/nft/${item.id}`);
              } else {
                navigate(`/nft/${item.id}`);
              }
            }}
            className="shrink-0 w-[160px] sm:w-[180px] snap-start cursor-pointer group"
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-os-card mb-2">
              <SafeImg
                src={item.image}
                alt={item.name}
                fallback={item.collectionName?.[0] || '#'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-250"
                loading="lazy"
              />
            </div>
            {item.collectionName && (
              <p className="text-[11px] text-os-primary font-semibold truncate">{item.collectionName}</p>
            )}
            <p className="text-sm font-bold text-white truncate">{item.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
