import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFeaturedTokens, getAllTokens } from '../api/tokens';
import { COLLECTIONS, getCollectionImageUrls } from '../api/collections';
import { SafeImg } from './SafeImg';
import { AdSlot } from './AdSlot';
import { TrendingIcon, TokenIcon } from './icons';
import type { TokenEntry } from '../types';

function mockPrice(idx: number): string {
  return (idx * 3.7 + 1.2).toFixed(2);
}

function mockChange(idx: number): string {
  return ((idx * 7.3 % 20) - 10).toFixed(1);
}

export const SidebarWidgets: React.FC = () => {
  const navigate = useNavigate();

  const displayTokens = useMemo<TokenEntry[]>(() => {
    const featured = getFeaturedTokens();
    const featuredIds = new Set(featured.map((t) => t.id));
    const rest = getAllTokens().filter((t) => !featuredIds.has(t.id));
    return [...featured, ...rest.slice(0, 4)];
  }, []);

  const extCollections = useMemo(() => {
    return COLLECTIONS.filter((c) => c.standard === 'ext');
  }, []);

  return (
    <div className="space-y-5">
      {/* Token Ticker Widget */}
      <div className="rounded-xl bg-os-surface/80 border border-os-border/30 p-4 transition-colors hover:border-os-border/50">
        <div className="flex items-center gap-2 mb-3">
          <TokenIcon size={16} className="text-os-primary" />
          <p className="text-[11px] font-bold text-os-text-secondary uppercase tracking-wider">
            Token Prices
          </p>
        </div>
        <div className="space-y-2">
          {displayTokens.map((token, idx) => {
            const price = mockPrice(idx);
            const change = parseFloat(mockChange(idx));
            const isPositive = change >= 0;
            return (
              <div key={token.id} className="flex items-center gap-2.5 py-2 px-2 -mx-2 rounded-lg hover:bg-os-card/30 transition-colors cursor-default">
                <img
                  src={token.logo}
                  alt={token.symbol}
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
                <span className="text-xs font-semibold text-white truncate">{token.symbol}</span>
                <span className="ml-auto text-xs text-os-text-secondary font-mono">${price}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isPositive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
                }`}>
                  {isPositive ? '+' : ''}{change.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => navigate('/tokens')}
          className="mt-3 w-full text-center text-[11px] font-semibold text-os-primary hover:text-white bg-transparent hover:bg-os-primary/10 rounded-lg py-2 transition-all duration-200"
        >
          View All
        </button>
      </div>

      {/* Trending NFTs Widget */}
      <div className="rounded-xl bg-os-surface/80 border border-os-border/30 p-4 transition-colors hover:border-os-border/50">
        <div className="flex items-center gap-2 mb-3">
          <TrendingIcon size={16} className="text-os-primary" />
          <p className="text-[11px] font-bold text-os-text-secondary uppercase tracking-wider">
            Trending Collections
          </p>
        </div>
        <div className="space-y-2.5">
          {extCollections.map((col) => {
            const imageUrls = getCollectionImageUrls(col);
            return (
              <button
                key={col.id}
                onClick={() => navigate(`/collection/${col.id}`)}
                className="flex items-center gap-3 w-full text-left py-2 px-2 -mx-2 rounded-lg hover:bg-os-card/30 transition-all duration-200 hover:translate-x-0.5"
              >
                <SafeImg
                  urls={imageUrls}
                  alt={col.name}
                  fallback={col.name.charAt(0)}
                  className="w-8 h-8 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{col.name}</p>
                  {col.floorPrice != null && (
                    <p className="text-[10px] text-os-text-secondary">
                      Floor: {col.floorPrice} <span className="text-os-primary/70">ICP</span>
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ad slot */}
      <AdSlot placement="sidebar" />
    </div>
  );
};
