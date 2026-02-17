import React from 'react';
import { useNFTStore } from '../store/nftStore';
import { TrendingIcon, VerifiedIcon } from './icons';

export const TrendingTable: React.FC = () => {
  const collection = useNFTStore((s) => s.collection);

  if (!collection) return null;

  // Simulate trending data from traits
  const traitCategories = collection.traits || [];
  const rows = traitCategories.map((cat, i) => ({
    rank: i + 1,
    name: `${cat.category} Collection`,
    floor: (0.05 + i * 0.02).toFixed(3),
    volume: (2.5 + i * 1.2).toFixed(1),
    change: ((Math.random() - 0.3) * 20).toFixed(1),
    items: cat.values.reduce((sum, v) => sum + v.count, 0),
    owners: Math.floor(Math.random() * 50) + 10,
  }));

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 px-4 mb-4">
        <TrendingIcon size={18} className="text-os-primary" />
        <h2 className="text-lg font-bold text-white">Trending</h2>
      </div>

      <div className="mx-4 bg-os-surface rounded-2xl border border-os-border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[40px_1fr_100px_100px_80px_80px_80px] gap-4 px-4 py-3 text-xs font-semibold text-os-text-secondary border-b border-os-border">
          <span>#</span>
          <span>Collection</span>
          <span className="text-right">Floor Price</span>
          <span className="text-right">Volume</span>
          <span className="text-right">Change</span>
          <span className="text-right">Items</span>
          <span className="text-right">Owners</span>
        </div>

        {/* Rows */}
        {rows.map((row) => {
          const changeNum = parseFloat(row.change);
          return (
            <div
              key={row.rank}
              className="grid grid-cols-[40px_1fr_100px_100px_80px_80px_80px] gap-4 px-4 py-3 items-center border-b border-os-border/40 hover:bg-os-card/50 transition-colors cursor-pointer"
            >
              <span className="text-sm text-os-text-secondary font-medium">{row.rank}</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-os-card flex items-center justify-center">
                  <span className="text-xs font-bold text-os-primary">{row.name[0]}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-white">{row.name}</span>
                  <VerifiedIcon size={14} />
                </div>
              </div>
              <div className="text-right flex items-center justify-end gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#E5E8EB">
                  <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                </svg>
                <span className="text-sm text-white font-medium">{row.floor}</span>
              </div>
              <div className="text-right flex items-center justify-end gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#E5E8EB">
                  <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                </svg>
                <span className="text-sm text-white font-medium">{row.volume}</span>
              </div>
              <span className={`text-sm text-right font-medium ${changeNum >= 0 ? 'text-os-green' : 'text-os-red'}`}>
                {changeNum >= 0 ? '+' : ''}{row.change}%
              </span>
              <span className="text-sm text-right text-os-text-secondary">{row.items}</span>
              <span className="text-sm text-right text-os-text-secondary">{row.owners}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
