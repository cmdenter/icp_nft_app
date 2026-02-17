import React from 'react';
import { Link } from 'react-router-dom';
import { COLLECTIONS } from '../api/collections';
import { SafeImg } from './SafeImg';
import { VerifiedIcon, ICPTokenIcon, ChevronRight, CompassIcon, TrendingIcon, MintIcon } from './icons';

const CATEGORY_DEFS: {
  id: string;
  name: string;
  gradient: string;
  letter: string;
  count: number;
}[] = (() => {
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

const FEATURED = COLLECTIONS.filter((c) => !c.isLocal).slice(0, 3);

interface MegaMenuNFTProps {
  onClose: () => void;
}

export const MegaMenuNFT: React.FC<MegaMenuNFTProps> = ({ onClose }) => {
  return (
    <div className="fixed top-[72px] left-0 right-0 z-[45] animate-mega-menu-in">
      {/* Backdrop */}
      <div className="mega-menu-backdrop fixed inset-0 top-[72px]" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-os-surface/98 backdrop-blur-xl border-b border-os-border/40 shadow-2xl shadow-black/50">
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          <div className="grid grid-cols-3 gap-8">
            {/* Col 1: Categories */}
            <div>
              <h3 className="text-xs font-bold text-os-text-secondary uppercase tracking-wider mb-3">
                Categories
              </h3>
              <div className="space-y-1">
                {CATEGORY_DEFS.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/?category=${cat.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-os-card/50 transition-colors group"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cat.gradient} flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 transition-opacity`}
                    >
                      <span className="text-white text-sm font-bold">{cat.letter}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white group-hover:text-os-primary transition-colors">
                        {cat.name}
                      </p>
                      <p className="text-[11px] text-os-text-secondary">
                        {cat.count} {cat.count === 1 ? 'collection' : 'collections'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Col 2: Featured Collections */}
            <div>
              <h3 className="text-xs font-bold text-os-text-secondary uppercase tracking-wider mb-3">
                Featured Collections
              </h3>
              <div className="space-y-1">
                {FEATURED.map((col) => (
                  <Link
                    key={col.id}
                    to={`/collection/${col.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-os-card/50 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-os-card border border-os-border/30 shrink-0">
                      <SafeImg
                        urls={col.image ? [col.image] : []}
                        fallback={col.name[0]}
                        alt={col.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-white truncate group-hover:text-os-primary transition-colors">
                          {col.name}
                        </p>
                        {col.verified && <VerifiedIcon size={13} className="shrink-0" />}
                      </div>
                      {col.floorPrice != null && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <ICPTokenIcon size={12} />
                          <span className="text-[11px] text-os-text-secondary">
                            Floor: {col.floorPrice} ICP
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-os-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      View <ChevronRight size={10} className="inline" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Col 3: Quick Links */}
            <div>
              <h3 className="text-xs font-bold text-os-text-secondary uppercase tracking-wider mb-3">
                Quick Links
              </h3>
              <div className="space-y-1">
                <Link
                  to="/"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-os-card/50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-os-primary/10 border border-os-primary/20 flex items-center justify-center shrink-0">
                    <CompassIcon size={16} className="text-os-primary" />
                  </div>
                  <span className="text-sm font-medium text-white group-hover:text-os-primary transition-colors">
                    Explore All
                  </span>
                </Link>
                <Link
                  to="/rankings"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-os-card/50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-os-green/10 border border-os-green/20 flex items-center justify-center shrink-0">
                    <TrendingIcon size={16} className="text-os-green" />
                  </div>
                  <span className="text-sm font-medium text-white group-hover:text-os-primary transition-colors">
                    Rankings
                  </span>
                </Link>
                <Link
                  to="/create"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-os-card/50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <MintIcon size={16} className="text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-white group-hover:text-os-primary transition-colors">
                    Create NFT
                  </span>
                </Link>
              </div>

              {/* Trending */}
              <div className="mt-5 pt-4 border-t border-os-border/30">
                <h4 className="text-[11px] font-bold text-os-text-secondary uppercase tracking-wider mb-2">
                  Trending
                </h4>
                <div className="space-y-1">
                  {FEATURED.slice(0, 3).map((col) => (
                    <Link
                      key={`trending-${col.id}`}
                      to={`/collection/${col.id}`}
                      onClick={onClose}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-os-card/40 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-md overflow-hidden bg-os-card shrink-0">
                        <SafeImg
                          urls={col.image ? [col.image] : []}
                          fallback={col.name[0]}
                          alt={col.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-xs text-os-text-secondary group-hover:text-white transition-colors truncate">
                        {col.name}
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
