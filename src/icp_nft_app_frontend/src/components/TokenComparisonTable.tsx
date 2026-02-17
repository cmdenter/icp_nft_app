import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PriceChangeBadge } from './PriceChangeBadge';
import { CheckCircleIcon } from './icons';
import type { TokenEntry } from '../types';
import { TOKEN_CATEGORY_DEFS, FALLBACK_LOGO } from '../api/tokens';

interface TokenComparisonTableProps {
  currentToken: TokenEntry;
  comparables: TokenEntry[];
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

export const TokenComparisonTable: React.FC<TokenComparisonTableProps> = ({
  currentToken,
  comparables,
}) => {
  const navigate = useNavigate();

  if (comparables.length === 0) return null;

  const allTokens = [currentToken, ...comparables.slice(0, 3)];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-3 px-3 text-os-text-secondary font-semibold text-xs w-28">Attribute</th>
            {allTokens.map((token, i) => (
              <th
                key={token.id}
                className={`text-center py-3 px-3 min-w-[140px] ${
                  i === 0 ? 'bg-os-primary/5 rounded-t-xl' : ''
                }`}
              >
                <div
                  className="flex flex-col items-center gap-2 cursor-pointer"
                  onClick={() => navigate(`/token/${token.id}`)}
                >
                  <img
                    src={token.logo}
                    alt={token.symbol}
                    className="w-12 h-12 rounded-full border border-os-border/40 bg-os-card"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_LOGO; }}
                  />
                  <div className="text-center">
                    <p className="text-xs font-bold text-white">{token.name}</p>
                    <p className="text-[11px] text-os-text-secondary">{token.symbol}</p>
                  </div>
                  {i === 0 && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-os-primary/20 text-os-primary">
                      Current
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Price */}
          <tr className="border-t border-os-border/20">
            <td className="py-3 px-3 text-os-text-secondary font-medium">Price</td>
            {allTokens.map((token, i) => (
              <td
                key={token.id}
                className={`py-3 px-3 text-center text-white font-semibold ${
                  i === 0 ? 'bg-os-primary/5' : ''
                }`}
              >
                {formatPrice(token.price)}
              </td>
            ))}
          </tr>

          {/* Market Cap */}
          <tr className="border-t border-os-border/20">
            <td className="py-3 px-3 text-os-text-secondary font-medium">Market Cap</td>
            {allTokens.map((token, i) => (
              <td
                key={token.id}
                className={`py-3 px-3 text-center text-white ${
                  i === 0 ? 'bg-os-primary/5' : ''
                }`}
              >
                {formatMarketCap(token.marketCap)}
              </td>
            ))}
          </tr>

          {/* 24h Change */}
          <tr className="border-t border-os-border/20">
            <td className="py-3 px-3 text-os-text-secondary font-medium">24h Change</td>
            {allTokens.map((token, i) => (
              <td
                key={token.id}
                className={`py-3 px-3 text-center ${
                  i === 0 ? 'bg-os-primary/5' : ''
                }`}
              >
                <div className="flex justify-center">
                  <PriceChangeBadge change={token.change24h} size="sm" />
                </div>
              </td>
            ))}
          </tr>

          {/* Category */}
          <tr className="border-t border-os-border/20">
            <td className="py-3 px-3 text-os-text-secondary font-medium">Category</td>
            {allTokens.map((token, i) => {
              const name = TOKEN_CATEGORY_DEFS.find((c) => c.id === token.category)?.name ?? token.category;
              return (
                <td
                  key={token.id}
                  className={`py-3 px-3 text-center ${
                    i === 0 ? 'bg-os-primary/5' : ''
                  }`}
                >
                  <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-os-primary/10 text-os-primary">
                    {name}
                  </span>
                </td>
              );
            })}
          </tr>

          {/* Standard */}
          <tr className="border-t border-os-border/20">
            <td className="py-3 px-3 text-os-text-secondary font-medium">Standard</td>
            {allTokens.map((token, i) => (
              <td
                key={token.id}
                className={`py-3 px-3 text-center text-white font-mono text-xs ${
                  i === 0 ? 'bg-os-primary/5' : ''
                }`}
              >
                {token.standard}
              </td>
            ))}
          </tr>

          {/* Verified */}
          <tr className="border-t border-os-border/20">
            <td className="py-3 px-3 text-os-text-secondary font-medium">Verified</td>
            {allTokens.map((token, i) => (
              <td
                key={token.id}
                className={`py-3 px-3 text-center ${
                  i === 0 ? 'bg-os-primary/5 rounded-b-xl' : ''
                }`}
              >
                {token.verified ? (
                  <div className="flex justify-center">
                    <CheckCircleIcon size={16} className="text-os-green" />
                  </div>
                ) : (
                  <span className="text-os-text-secondary">&mdash;</span>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
