import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from './icons';
import { useTokenStore } from '../store/tokenStore';
import { FALLBACK_LOGO } from '../api/tokens';

export const RecentlyViewedTokens: React.FC = () => {
  const navigate = useNavigate();
  const recentItems = useTokenStore((s) => s.recentlyViewedTokens);
  const liveTokensMap = useTokenStore((s) => s.liveTokensMap);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);

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
  }, [check, recentItems.length]);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  if (recentItems.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Recently Viewed Tokens</h2>
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
        className="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-2"
      >
        {recentItems.map((item) => {
          const full = liveTokensMap[item.id];
          const price = full?.price;

          return (
            <div
              key={item.id}
              onClick={() => navigate(`/token/${item.id}`)}
              className="shrink-0 w-[160px] sm:w-[180px] snap-start cursor-pointer group"
            >
              <div className="rounded-xl bg-os-surface border border-os-border/40 p-3 hover:bg-os-card/60 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={item.logo}
                    alt={item.symbol}
                    className="w-10 h-10 rounded-full shrink-0"
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_LOGO; }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{item.name}</p>
                    <p className="text-[11px] text-os-text-secondary">{item.symbol}</p>
                  </div>
                </div>
                {price != null && (
                  <p className="text-sm font-bold text-white">
                    {price >= 1 ? `$${price.toFixed(2)}` : `$${price.toFixed(4)}`}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
