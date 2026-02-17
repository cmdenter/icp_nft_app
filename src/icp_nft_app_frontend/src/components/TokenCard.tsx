import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PriceChangeBadge } from './PriceChangeBadge';
import { VerifiedIcon } from './icons';
import { TOKEN_CATEGORY_DEFS, FALLBACK_LOGO } from '../api/tokens';
import type { TokenEntry } from '../types';

interface TokenCardProps {
  token: TokenEntry;
  compact?: boolean;
}

function formatMarketCap(n: number | undefined | null): string {
  if (n == null) return '--';
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatPrice(price: number): string {
  if (price >= 1_000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

export const TokenCard: React.FC<TokenCardProps> = ({ token, compact }) => {
  const navigate = useNavigate();

  const categoryDef = TOKEN_CATEGORY_DEFS.find((c) => c.id === token.category);
  const gradient = categoryDef?.gradient ?? 'from-gray-500/30 to-slate-500/20';
  const categoryName = categoryDef?.name ?? token.category;

  if (compact) {
    return (
      <div
        onClick={() => navigate(`/token/${token.id}`)}
        className="rounded-xl bg-os-surface border border-os-border/40 p-3 hover:bg-os-card/60 cursor-pointer transition-colors flex items-center gap-3"
      >
        <img
          src={token.logo}
          alt={token.symbol}
          className="w-10 h-10 rounded-full shrink-0"
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_LOGO; }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-white truncate">{token.name}</span>
            {token.verified && <VerifiedIcon size={12} />}
          </div>
          <span className="text-[11px] text-os-text-secondary">{token.symbol}</span>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-bold text-white">{formatPrice(token.price)}</p>
          <PriceChangeBadge change={token.change24h} size="sm" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/token/${token.id}`)}
      className="card-base group overflow-hidden cursor-pointer"
    >
      {/* Gradient header */}
      <div className={`relative h-28 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <img
          src={token.logo}
          alt={token.symbol}
          className="w-20 h-20 rounded-full border-4 border-os-bg shadow-lg"
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_LOGO; }}
        />
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Name + symbol */}
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-sm font-bold text-white truncate">{token.name}</span>
          {token.verified && <VerifiedIcon size={13} />}
          <span className="text-xs text-os-text-secondary ml-auto shrink-0">{token.symbol}</span>
        </div>

        {/* Price + 24h change */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-white">{formatPrice(token.price)}</span>
          <PriceChangeBadge change={token.change24h} size="sm" />
        </div>

        {/* Category badge */}
        <div className="mt-2">
          <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-os-primary/10 text-os-primary">
            {categoryName}
          </span>
        </div>

        {/* Market cap */}
        {token.marketCap != null && (
          <p className="text-[11px] text-os-text-secondary mt-2">
            MCap: {formatMarketCap(token.marketCap)}
          </p>
        )}
      </div>
    </div>
  );
};
