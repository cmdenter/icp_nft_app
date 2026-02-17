import React from 'react';
import { Link } from 'react-router-dom';
import { useNFTStore } from '../../store/nftStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { usePurchaseHistoryStore } from '../../store/purchaseHistoryStore';
import { SafeImg } from '../SafeImg';
import {
  ShoppingBagIcon, HeartIcon, TagIcon, PackageIcon, SettingsIcon,
  ChevronRight, TrendingIcon,
} from '../icons';

export const AccountOverview: React.FC = () => {
  const profileTokens = useNFTStore((s) => s.profileTokens);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const purchases = usePurchaseHistoryStore((s) => s.purchases);

  const successfulPurchases = purchases.filter((p) => p.status === 'success');
  const recentPurchases = successfulPurchases.slice(0, 4);

  const quickLinks = [
    { label: 'My Collection', to: '/account/collection', desc: `${profileTokens.length} items`, Icon: PackageIcon, color: 'text-os-primary', bg: 'bg-os-primary/10' },
    { label: 'Watchlist', to: '/account/watchlist', desc: `${wishlistCount} saved`, Icon: HeartIcon, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'Listings', to: '/account/listings', desc: 'Manage active', Icon: TagIcon, color: 'text-os-green', bg: 'bg-os-green/10' },
    { label: 'Purchases', to: '/account/purchases', desc: `${successfulPurchases.length} transactions`, Icon: ShoppingBagIcon, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Settings', to: '/account/settings', desc: 'Profile & wallet', Icon: SettingsIcon, color: 'text-os-text-secondary', bg: 'bg-os-card' },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Navigation */}
      <div>
        <h3 className="text-[11px] font-bold text-os-text-secondary uppercase tracking-wider mb-3">Quick Access</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group flex items-center gap-3 p-3.5 rounded-xl bg-os-surface border border-os-border/50 hover:border-os-primary/30 transition-all duration-200"
            >
              <div className={`w-10 h-10 rounded-xl ${link.bg} flex items-center justify-center shrink-0`}>
                <link.Icon size={18} className={link.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white group-hover:text-os-primary transition-colors">{link.label}</p>
                <p className="text-[11px] text-os-text-secondary">{link.desc}</p>
              </div>
              <ChevronRight size={14} className="text-os-text-secondary/40 group-hover:text-os-primary transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {recentPurchases.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-bold text-os-text-secondary uppercase tracking-wider">Recent Activity</h3>
            <Link to="/account/purchases" className="text-[11px] text-os-primary hover:text-os-primary-hover transition-colors flex items-center gap-1">
              View all <ChevronRight size={10} />
            </Link>
          </div>
          <div className="rounded-xl bg-os-surface border border-os-border/50 overflow-hidden">
            {recentPurchases.map((p, i) => (
              <Link
                key={p.id}
                to={`/collection/${p.collectionId}/nft/${p.tokenIndex}`}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-os-card/40 transition-colors ${i > 0 ? 'border-t border-os-border/30' : ''}`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-os-card shrink-0">
                  <SafeImg src={p.image} alt={p.name} fallback="?" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                  <p className="text-[11px] text-os-text-secondary">{p.collectionName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-white">{p.price.toFixed(2)} ICP</p>
                  <p className="text-[10px] text-os-text-secondary">
                    {new Date(p.purchasedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state when nothing at all */}
      {recentPurchases.length === 0 && profileTokens.length === 0 && (
        <div className="rounded-2xl border border-dashed border-os-border/50 bg-os-surface/50 p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-os-primary/10 flex items-center justify-center mx-auto mb-4">
            <TrendingIcon size={24} className="text-os-primary" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Get Started</h3>
          <p className="text-sm text-os-text-secondary mb-5 max-w-sm mx-auto">
            Explore collections, purchase NFTs, and build your on-chain portfolio.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/" className="btn btn-md btn-primary">Browse NFTs</Link>
            <Link to="/tokens" className="btn btn-md btn-secondary">Explore Tokens</Link>
          </div>
        </div>
      )}
    </div>
  );
};
