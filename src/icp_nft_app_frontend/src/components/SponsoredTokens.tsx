import React from 'react';
import { Link } from 'react-router-dom';
import { PriceChangeBadge } from './PriceChangeBadge';
import { FALLBACK_LOGO } from '../api/tokens';
import type { TokenEntry } from '../types';

interface SponsoredTokensProps {
  tokens: TokenEntry[];
  variant: 'banner' | 'sidebar';
  label?: string;
}

function formatPrice(price: number): string {
  if (price >= 1_000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

export const SponsoredTokens: React.FC<SponsoredTokensProps> = ({ tokens, variant, label }) => {
  if (tokens.length === 0) return null;

  const sponsoredLabel = label ?? 'Sponsored';

  if (variant === 'banner') {
    const bannerTokens = tokens.slice(0, 3);

    return (
      <div className="rounded-2xl bg-gradient-to-r from-os-surface to-os-card border border-os-border/40 p-5">
        <p className="text-[10px] font-semibold text-os-text-secondary/60 uppercase tracking-wider mb-3">
          {sponsoredLabel}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {bannerTokens.map((token) => (
            <Link
              key={token.id}
              to={`/token/${token.id}`}
              className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-os-bg/40 transition-colors"
            >
              <img
                src={token.logo}
                alt={token.symbol}
                className="w-12 h-12 rounded-full shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = FALLBACK_LOGO;
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{token.name}</p>
                <p className="text-xs text-os-text-secondary">{token.symbol}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-white">{formatPrice(token.price)}</p>
                <PriceChangeBadge change={token.change24h} size="sm" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Sidebar variant
  const sidebarTokens = tokens.slice(0, 2);

  return (
    <div className="rounded-2xl bg-os-surface border border-os-border/40 p-4 space-y-3">
      <p className="text-[10px] font-semibold text-os-text-secondary/60 uppercase tracking-wider">
        {sponsoredLabel}
      </p>
      {sidebarTokens.map((token) => (
        <Link
          key={token.id}
          to={`/token/${token.id}`}
          className="flex items-center gap-3 rounded-xl p-2 hover:bg-os-bg/40 transition-colors"
        >
          <img
            src={token.logo}
            alt={token.symbol}
            className="w-9 h-9 rounded-full shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_LOGO;
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{token.name}</p>
            <p className="text-[11px] text-os-text-secondary">{token.symbol}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-bold text-white">{formatPrice(token.price)}</p>
            <PriceChangeBadge change={token.change24h} size="sm" />
          </div>
        </Link>
      ))}
    </div>
  );
};
