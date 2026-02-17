import React from 'react';
import { FALLBACK_LOGO, TOKEN_CATEGORY_DEFS } from '../api/tokens';
import { GlobeIcon, ExternalLink } from './icons';
import type { TokenEntry } from '../types';

interface BrandContentProps {
  token: TokenEntry;
}

function formatLargeNumber(n: number | undefined | null): string {
  if (n == null) return '--';
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(0)}`;
}

export const BrandContent: React.FC<BrandContentProps> = ({ token }) => {
  const catDef = TOKEN_CATEGORY_DEFS.find((c) => c.id === token.category);
  const gradient = catDef?.gradient ?? 'from-gray-500/30 to-slate-500/20';

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.currentTarget as HTMLImageElement).src = FALLBACK_LOGO;
  };

  return (
    <div className="bg-os-surface border border-os-border rounded-2xl overflow-hidden">
      {/* Hero banner */}
      <div className={`relative h-40 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-3">
          <img
            src={token.logo}
            alt={token.symbol}
            className="w-20 h-20 rounded-full border-4 border-white/10"
            onError={handleImgError}
          />
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">{token.name}</h2>
            <p className="text-sm text-white/60">{token.symbol}</p>
          </div>
        </div>
      </div>

      {/* Content body */}
      <div className="p-6 space-y-6">
        {/* About section */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-os-text-secondary mb-2">About</h3>
          <p className="text-sm text-os-text-secondary leading-relaxed">{token.description}</p>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-os-text-secondary mb-1">Market Cap</p>
            <p className="text-sm font-bold text-white">{formatLargeNumber(token.marketCap)}</p>
          </div>
          <div>
            <p className="text-xs text-os-text-secondary mb-1">24h Volume</p>
            <p className="text-sm font-bold text-white">{formatLargeNumber(token.volume24h)}</p>
          </div>
          <div>
            <p className="text-xs text-os-text-secondary mb-1">Network</p>
            <p className="text-sm font-bold text-white">Internet Computer</p>
          </div>
          <div>
            <p className="text-xs text-os-text-secondary mb-1">Standard</p>
            <p className="text-sm font-bold text-white">{token.standard}</p>
          </div>
        </div>

        {/* Use Cases */}
        {token.useCases.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-os-text-secondary mb-2">Use Cases</h3>
            <div className="flex flex-wrap gap-2">
              {token.useCases.map((uc) => (
                <span
                  key={uc}
                  className="px-3 py-1.5 rounded-full bg-os-primary/10 text-os-primary text-xs font-semibold"
                >
                  {uc}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Team */}
        {token.team && token.team.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-os-text-secondary mb-2">Team</h3>
            <div className="flex flex-wrap gap-3">
              {token.team.map((member) => (
                <div key={member.name} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-os-card border border-os-border/40 flex items-center justify-center text-xs font-bold text-white">
                    {member.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{member.name}</p>
                    <p className="text-xs text-os-text-secondary">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Links row */}
        <div className="flex flex-wrap gap-2">
          {token.website && (
            <a
              href={token.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-os-card border border-os-border/40 text-xs text-os-text-secondary hover:text-white transition-colors"
            >
              <GlobeIcon size={12} />
              Website
              <ExternalLink size={10} />
            </a>
          )}
          {token.twitter && (
            <a
              href={`https://x.com/${token.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-os-card border border-os-border/40 text-xs text-os-text-secondary hover:text-white transition-colors"
            >
              <span className="font-bold">&#120143;</span>
              @{token.twitter}
              <ExternalLink size={10} />
            </a>
          )}
          {token.github && (
            <a
              href={token.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-os-card border border-os-border/40 text-xs text-os-text-secondary hover:text-white transition-colors"
            >
              GitHub
              <ExternalLink size={10} />
            </a>
          )}
          {token.whitepaper && (
            <a
              href={token.whitepaper}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-os-card border border-os-border/40 text-xs text-os-text-secondary hover:text-white transition-colors"
            >
              Whitepaper
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
