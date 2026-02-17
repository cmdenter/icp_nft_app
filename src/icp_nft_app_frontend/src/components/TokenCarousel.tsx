import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from './icons';
import { PriceChangeBadge } from './PriceChangeBadge';
import { FALLBACK_LOGO } from '../api/tokens';
import type { TokenEntry } from '../types';

interface TokenCarouselProps {
  title: string;
  tokens: TokenEntry[];
  showViewAll?: boolean;
  viewAllLink?: string;
}

export const TokenCarousel: React.FC<TokenCarouselProps> = ({
  title,
  tokens,
  showViewAll,
  viewAllLink,
}) => {
  const navigate = useNavigate();
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
  }, [check, tokens.length]);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  if (tokens.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <div className="flex items-center gap-2">
          {showViewAll && viewAllLink && (
            <Link to={viewAllLink} className="text-sm text-os-primary hover:text-os-primary-hover font-medium mr-2">
              View all &rarr;
            </Link>
          )}
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
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-2"
      >
        {tokens.map((token) => (
          <div
            key={token.id}
            onClick={() => navigate(`/token/${token.id}`)}
            className="shrink-0 w-[200px] snap-start cursor-pointer"
          >
            <div className="rounded-xl bg-os-surface border border-os-border/40 p-3 hover:bg-os-card/60 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={token.logo}
                  alt={token.symbol}
                  className="w-12 h-12 rounded-full shrink-0"
                  loading="lazy"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_LOGO; }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{token.name}</p>
                  <p className="text-[11px] text-os-text-secondary">{token.symbol}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {token.price >= 1 ? `$${token.price.toFixed(2)}` : `$${token.price.toFixed(4)}`}
                </span>
                <PriceChangeBadge change={token.change24h} size="sm" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
