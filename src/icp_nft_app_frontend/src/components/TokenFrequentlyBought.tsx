import React from 'react';
import type { TokenEntry } from '../types';
import { FALLBACK_LOGO } from '../api/tokens';

interface TokenFrequentlyBoughtProps {
  token: TokenEntry;
  relatedTokens: TokenEntry[];
}

function formatPrice(price: number): string {
  if (price >= 1_000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

export const TokenFrequentlyBought: React.FC<TokenFrequentlyBoughtProps> = ({
  token,
  relatedTokens,
}) => {
  if (relatedTokens.length < 2) return null;

  const displayedTokens = [token, relatedTokens[0], relatedTokens[1]];
  const combinedPrice = displayedTokens.reduce((sum, t) => sum + t.price, 0);

  return (
    <div className="bg-os-surface border border-os-border rounded-2xl p-5">
      <h3 className="text-sm font-bold text-white mb-4">Frequently Bought Together</h3>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {displayedTokens.map((t, i) => (
          <React.Fragment key={t.id}>
            {i > 0 && (
              <span className="text-2xl text-os-text-secondary font-light">+</span>
            )}
            <div className="flex flex-col items-center gap-1.5">
              <img
                src={t.logo}
                alt={t.symbol}
                className="w-10 h-10 rounded-full"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = FALLBACK_LOGO;
                }}
              />
              <p className="text-xs text-white font-medium">{t.name}</p>
              <p className="text-[11px] text-os-text-secondary">{t.symbol}</p>
              <p className="text-xs text-os-primary font-semibold">{formatPrice(t.price)}</p>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-os-border/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-sm text-os-text-secondary">
          Total: <span className="text-white font-bold text-base">{formatPrice(combinedPrice)}</span>
        </div>
        <a
          href="https://app.icpswap.com/swap"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-os-primary hover:bg-os-primary-hover text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all"
        >
          Swap all on ICPSwap
        </a>
      </div>
    </div>
  );
};
