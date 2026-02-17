import React from 'react';
import { Link } from 'react-router-dom';
import { TOKEN_CATEGORY_DEFS, FALLBACK_LOGO } from '../api/tokens';
import { useFeaturedTokens, useLiveTokens } from '../hooks/useTokenData';
import { PriceChangeBadge } from './PriceChangeBadge';
import { TokenIcon, ChevronRight } from './icons';

interface MegaMenuTokensProps {
  onClose: () => void;
}

export const MegaMenuTokens: React.FC<MegaMenuTokensProps> = ({ onClose }) => {
  const featuredTokens = useFeaturedTokens().slice(0, 3);
  const allTokens = useLiveTokens();
  const newestTokens = React.useMemo(
    () =>
      [...allTokens]
        .filter((t) => t.launchDate)
        .sort((a, b) => (b.launchDate || '').localeCompare(a.launchDate || ''))
        .slice(0, 3),
    [allTokens],
  );

  return (
    <div className="fixed top-[72px] left-0 right-0 z-[45] animate-mega-menu-in">
      {/* Backdrop */}
      <div className="mega-menu-backdrop fixed inset-0 top-[72px]" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-os-surface/98 backdrop-blur-xl border-b border-os-border/40 shadow-2xl shadow-black/50">
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          <div className="grid grid-cols-3 gap-8">
            {/* Col 1: Token Categories */}
            <div>
              <h3 className="text-xs font-bold text-os-text-secondary uppercase tracking-wider mb-3">
                Token Categories
              </h3>
              <div className="space-y-0.5">
                {TOKEN_CATEGORY_DEFS.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/tokens?category=${cat.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-os-card/50 transition-colors group"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.gradient} flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 transition-opacity`}
                    >
                      <TokenIcon size={14} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-white group-hover:text-os-primary transition-colors">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Col 2: Featured Tokens */}
            <div>
              <h3 className="text-xs font-bold text-os-text-secondary uppercase tracking-wider mb-3">
                Featured Tokens
              </h3>
              <div className="space-y-1">
                {featuredTokens.map((token) => (
                  <Link
                    key={token.id}
                    to={`/token/${token.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-os-card/50 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-os-card border border-os-border/30 shrink-0 flex items-center justify-center">
                      {token.logo ? (
                        <img
                          src={token.logo}
                          alt={token.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_LOGO; }}
                        />
                      ) : (
                        <TokenIcon size={20} className="text-os-text-secondary" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-white truncate group-hover:text-os-primary transition-colors">
                          {token.name}
                        </p>
                        <span className="text-[11px] text-os-text-secondary">{token.symbol}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-semibold text-white">
                          ${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: token.price < 1 ? 4 : 2 })}
                        </span>
                        <PriceChangeBadge change={token.change24h} size="sm" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Col 3: Quick Links + New Listings */}
            <div>
              <h3 className="text-xs font-bold text-os-text-secondary uppercase tracking-wider mb-3">
                Quick Links
              </h3>
              <div className="space-y-1">
                <Link
                  to="/tokens"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-os-card/50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-os-primary/10 border border-os-primary/20 flex items-center justify-center shrink-0">
                    <TokenIcon size={16} className="text-os-primary" />
                  </div>
                  <span className="text-sm font-medium text-white group-hover:text-os-primary transition-colors">
                    All Tokens
                  </span>
                  <ChevronRight size={14} className="text-os-text-secondary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>

              {/* New Listings */}
              <div className="mt-5 pt-4 border-t border-os-border/30">
                <h4 className="text-[11px] font-bold text-os-text-secondary uppercase tracking-wider mb-2">
                  New Listings
                </h4>
                <div className="space-y-1">
                  {newestTokens.map((token) => (
                    <Link
                      key={`new-${token.id}`}
                      to={`/token/${token.id}`}
                      onClick={onClose}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-os-card/40 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-os-card shrink-0 flex items-center justify-center">
                        {token.logo ? (
                          <img
                            src={token.logo}
                            alt={token.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_LOGO; }}
                          />
                        ) : (
                          <TokenIcon size={12} className="text-os-text-secondary" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs text-os-text-secondary group-hover:text-white transition-colors truncate block">
                          {token.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-os-text-secondary shrink-0">
                        {token.symbol}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
