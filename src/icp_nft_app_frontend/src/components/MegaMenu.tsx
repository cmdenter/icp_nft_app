import React from 'react';
import { Link } from 'react-router-dom';
import { COLLECTIONS } from '../api/collections';
import { TOKEN_CATEGORY_DEFS, FALLBACK_LOGO } from '../api/tokens';
import { useFeaturedTokens } from '../hooks/useTokenData';
import { SafeImg } from './SafeImg';
import { PriceChangeBadge } from './PriceChangeBadge';
import {
  VerifiedIcon,
  ICPTokenIcon,
  ChevronRight,
  CompassIcon,
  TrendingIcon,
  MintIcon,
  TokenIcon,
  ImageIcon,
  UserIcon,
  CartIcon,
} from './icons';

// ---------------------------------------------------------------------------
// NFT data
// ---------------------------------------------------------------------------

const NFT_CATEGORIES = (() => {
  const external = COLLECTIONS.filter((c) => !c.isLocal);
  const cats = [
    { id: 'art', name: 'Art', gradient: 'from-pink-500 to-orange-500', letter: 'A' },
    { id: 'pfps', name: 'PFPs', gradient: 'from-blue-500 to-purple-600', letter: 'P' },
    { id: 'gaming', name: 'Gaming', gradient: 'from-green-500 to-teal-500', letter: 'G' },
    { id: 'collectibles', name: 'Collectibles', gradient: 'from-yellow-500 to-red-500', letter: 'C' },
    { id: 'music', name: 'Music', gradient: 'from-violet-500 to-fuchsia-500', letter: 'M' },
  ];
  return cats.map((cat) => ({
    ...cat,
    count: external.filter((c) => c.category === cat.id).length,
  }));
})();

const FEATURED_COLLECTIONS = COLLECTIONS.filter((c) => !c.isLocal).slice(0, 3);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface MegaMenuProps {
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ onClose }) => {
  const featuredTokens = useFeaturedTokens().slice(0, 3);

  return (
    <>
      {/* Backdrop — covers everything below header */}
      <div
        className="fixed inset-0 top-[104px] z-[54] mega-menu-backdrop"
        onClick={onClose}
      />

      {/* Panel — sits above backdrop */}
      <div className="fixed top-[104px] left-0 right-0 z-[55] animate-mega-menu-in">
        <div className="bg-os-surface border-b border-os-border/40 shadow-2xl shadow-black/50">
          <div className="max-w-[1400px] mx-auto px-6 py-5">

            {/* ── Two-column layout: NFTs | divider | Tokens ── */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-0">

              {/* ===== LEFT HALF: NFTs ===== */}
              <div className="flex-1 lg:pr-8">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon size={16} className="text-os-primary" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">NFTs</h2>
                  <Link
                    to="/"
                    onClick={onClose}
                    className="ml-auto text-xs text-os-primary hover:text-os-primary-hover transition-colors flex items-center gap-1"
                  >
                    Explore All <ChevronRight size={10} />
                  </Link>
                </div>

                <div className="flex gap-6">
                  {/* NFT Categories + Quick links */}
                  <div className="w-1/2">
                    <h3 className="text-[11px] font-bold text-os-text-secondary uppercase tracking-wider mb-2">
                      Categories
                    </h3>
                    <div className="space-y-0.5">
                      {NFT_CATEGORIES.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/?category=${cat.id}`}
                          onClick={onClose}
                          className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-os-card/50 transition-colors group"
                        >
                          <div
                            className={`w-6 h-6 rounded bg-gradient-to-br ${cat.gradient} flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 transition-opacity`}
                          >
                            <span className="text-white text-[10px] font-bold">{cat.letter}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-white group-hover:text-os-primary transition-colors">
                              {cat.name}
                            </p>
                            <p className="text-[10px] text-os-text-secondary leading-none">
                              {cat.count} {cat.count === 1 ? 'collection' : 'collections'}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Quick links */}
                    <div className="mt-2 pt-2 border-t border-os-border/20 space-y-0.5">
                      <Link
                        to="/rankings"
                        onClick={onClose}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-os-card/50 transition-colors group"
                      >
                        <div className="w-6 h-6 rounded bg-os-green/10 border border-os-green/20 flex items-center justify-center shrink-0">
                          <TrendingIcon size={12} className="text-os-green" />
                        </div>
                        <span className="text-[13px] font-medium text-white group-hover:text-os-primary transition-colors">
                          Rankings
                        </span>
                      </Link>
                      <Link
                        to="/create"
                        onClick={onClose}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-os-card/50 transition-colors group"
                      >
                        <div className="w-6 h-6 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                          <MintIcon size={12} className="text-purple-400" />
                        </div>
                        <span className="text-[13px] font-medium text-white group-hover:text-os-primary transition-colors">
                          Create NFT
                        </span>
                      </Link>
                    </div>
                  </div>

                  {/* Featured Collections */}
                  <div className="w-1/2">
                    <h3 className="text-[11px] font-bold text-os-text-secondary uppercase tracking-wider mb-2">
                      Featured Collections
                    </h3>
                    <div className="space-y-1">
                      {FEATURED_COLLECTIONS.map((col) => (
                        <Link
                          key={col.id}
                          to={`/collection/${col.id}`}
                          onClick={onClose}
                          className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-os-card/50 transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-os-card border border-os-border/30 shrink-0">
                            <SafeImg
                              urls={col.image ? [col.image] : []}
                              fallback={col.name[0]}
                              alt={col.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <p className="text-[13px] font-medium text-white truncate group-hover:text-os-primary transition-colors">
                                {col.name}
                              </p>
                              {col.verified && <VerifiedIcon size={11} className="shrink-0" />}
                            </div>
                            {col.floorPrice != null && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <ICPTokenIcon size={10} />
                                <span className="text-[10px] text-os-text-secondary">
                                  Floor: {col.floorPrice} ICP
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vertical divider */}
              <div className="hidden lg:block w-px bg-os-border/30 shrink-0" />

              {/* ===== RIGHT HALF: Tokens ===== */}
              <div className="flex-1 lg:pl-8">
                <div className="flex items-center gap-2 mb-3">
                  <TokenIcon size={16} className="text-os-primary" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Tokens</h2>
                  <Link
                    to="/tokens"
                    onClick={onClose}
                    className="ml-auto text-xs text-os-primary hover:text-os-primary-hover transition-colors flex items-center gap-1"
                  >
                    All Tokens <ChevronRight size={10} />
                  </Link>
                </div>

                <div className="flex gap-6">
                  {/* Token Categories — compact list */}
                  <div className="w-1/2">
                    <h3 className="text-[11px] font-bold text-os-text-secondary uppercase tracking-wider mb-2">
                      Categories
                    </h3>
                    <div className="space-y-0.5">
                      {TOKEN_CATEGORY_DEFS.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/tokens?category=${cat.id}`}
                          onClick={onClose}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-os-card/50 transition-colors group"
                        >
                          <div
                            className={`w-5 h-5 rounded bg-gradient-to-br ${cat.gradient} flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 transition-opacity`}
                          >
                            <TokenIcon size={9} className="text-white" />
                          </div>
                          <span className="text-[13px] font-medium text-white group-hover:text-os-primary transition-colors truncate">
                            {cat.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Featured Tokens */}
                  <div className="w-1/2">
                    <h3 className="text-[11px] font-bold text-os-text-secondary uppercase tracking-wider mb-2">
                      Featured Tokens
                    </h3>
                    <div className="space-y-1">
                      {featuredTokens.map((token) => (
                        <Link
                          key={token.id}
                          to={`/token/${token.id}`}
                          onClick={onClose}
                          className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-os-card/50 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-os-card border border-os-border/30 shrink-0">
                            <img
                              src={token.logo}
                              alt={token.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_LOGO; }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-medium text-white truncate group-hover:text-os-primary transition-colors">
                              {token.symbol}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[11px] font-semibold text-white">
                                ${token.price < 1 ? token.price.toFixed(4) : token.price.toFixed(2)}
                              </span>
                              <PriceChangeBadge change={token.change24h} size="sm" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom bar — account links */}
            <div className="mt-4 pt-3 border-t border-os-border/30 flex items-center gap-5">
              <Link
                to="/account"
                onClick={onClose}
                className="flex items-center gap-2 text-[13px] text-os-text-secondary hover:text-white transition-colors"
              >
                <UserIcon size={14} />
                My Account
              </Link>
              <Link
                to="/cart"
                onClick={onClose}
                className="flex items-center gap-2 text-[13px] text-os-text-secondary hover:text-white transition-colors"
              >
                <CartIcon size={14} />
                Cart
              </Link>
              <Link
                to="/"
                onClick={onClose}
                className="flex items-center gap-2 text-[13px] text-os-text-secondary hover:text-white transition-colors"
              >
                <CompassIcon size={14} />
                Explore
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
