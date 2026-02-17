import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePurchaseHistoryStore } from '../../store/purchaseHistoryStore';
import { SafeImg } from '../SafeImg';
import { CheckCircleIcon, XCircleIcon, ShoppingBagIcon } from '../icons';

type SortBy = 'newest' | 'oldest' | 'price-high' | 'price-low';

export const PurchaseHistory: React.FC = () => {
  const purchases = usePurchaseHistoryStore((s) => s.purchases);
  const [sortBy, setSortBy] = useState<SortBy>('newest');

  const sorted = [...purchases].sort((a, b) => {
    switch (sortBy) {
      case 'oldest': return a.purchasedAt - b.purchasedAt;
      case 'price-high': return b.price - a.price;
      case 'price-low': return a.price - b.price;
      default: return b.purchasedAt - a.purchasedAt;
    }
  });

  function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  if (purchases.length === 0) {
    return (
      <div className="rounded-2xl border border-os-border bg-os-surface p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-os-primary/10 flex items-center justify-center mx-auto mb-4">
          <ShoppingBagIcon size={28} className="text-os-primary" />
        </div>
        <p className="text-lg font-semibold text-white mb-2">No purchases yet</p>
        <p className="text-sm text-os-text-secondary mb-6">Items you buy will appear here.</p>
        <Link to="/" className="btn btn-md btn-primary inline-flex">Browse NFTs</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Purchase History</h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="bg-os-card border border-os-border rounded-lg px-3 py-1.5 text-xs text-white"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="price-high">Price: High to Low</option>
          <option value="price-low">Price: Low to High</option>
        </select>
      </div>

      <div className="rounded-2xl border border-os-border bg-os-surface overflow-hidden">
        <div className="divide-y divide-os-border/30">
          {sorted.map((p) => (
            <Link
              key={p.id}
              to={`/collection/${p.collectionId}/nft/${p.tokenIndex}`}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-os-card/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-os-card shrink-0">
                <SafeImg src={p.image} alt={p.name} fallback="?" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                <p className="text-[11px] text-os-text-secondary">{p.collectionName}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-white">{p.price.toFixed(2)} ICP</p>
                <p className="text-[11px] text-os-text-secondary">{formatDate(p.purchasedAt)}</p>
              </div>
              <div className="shrink-0 ml-2">
                {p.status === 'success' ? (
                  <CheckCircleIcon size={16} className="text-os-green" />
                ) : (
                  <XCircleIcon size={16} className="text-os-secondary" />
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
