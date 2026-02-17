import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SafeImg } from './SafeImg';
import { ICPTokenIcon } from './icons';
import { getExtImageUrls } from '../api/ext';
import { timeAgo, truncateAddr, formatPrice } from '../utils/format';
import type { ExtTransaction } from '../api/ext-market';

interface CollectionActivityTableProps {
  transactions: ExtTransaction[];
  collectionId: string;
  collectionName: string;
  canisterId: string;
}

const PAGE_SIZE = 100;

export const CollectionActivityTable: React.FC<CollectionActivityTableProps> = ({
  transactions,
  collectionId,
  collectionName,
  canisterId,
}) => {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const sorted = useMemo(
    () => [...transactions].sort((a, b) => b.time - a.time),
    [transactions],
  );

  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  if (transactions.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <p className="text-center text-os-text-secondary py-16">
          No transactions found
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-os-text-secondary">
          {transactions.length} transactions
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {/* Table header */}
        <div className="grid grid-cols-[100px_1fr_120px_1fr_1fr_100px] gap-2 px-4 py-3 border-b border-os-border/30 text-[11px] font-bold uppercase text-os-text-secondary tracking-wider min-w-[640px]">
          <span>Event</span>
          <span>Item</span>
          <span>Price</span>
          <span className="hidden sm:block">From</span>
          <span className="hidden sm:block">To</span>
          <span>Date</span>
        </div>

        {/* Rows */}
        {visible.map((tx, i) => {
          const imageUrls = getExtImageUrls(canisterId, tx.tokenIndex);
          return (
            <div
              key={`${tx.tokenIndex}-${tx.time}-${i}`}
              className="grid grid-cols-[100px_1fr_120px_1fr_1fr_100px] gap-2 px-4 py-3 border-b border-os-border/10 hover:bg-os-card/30 transition-colors cursor-pointer min-w-[640px]"
              onClick={() =>
                navigate(`/collection/${collectionId}/nft/${tx.tokenIndex}`)
              }
            >
              {/* Event */}
              <div className="flex items-center">
                <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-os-green/15 text-os-green">
                  Sale
                </span>
              </div>

              {/* Item */}
              <div className="flex items-center gap-2 min-w-0">
                <SafeImg
                  urls={imageUrls}
                  alt={`${collectionName} #${tx.tokenIndex}`}
                  fallback={`#${tx.tokenIndex}`}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
                <span className="text-sm text-white truncate">
                  {collectionName} #{tx.tokenIndex}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-1">
                <ICPTokenIcon size={14} />
                <span className="text-sm font-semibold text-white">
                  {formatPrice(tx.price)}
                </span>
              </div>

              {/* From */}
              <div className="hidden sm:flex items-center">
                <span className="font-mono text-xs text-os-primary truncate">
                  {truncateAddr(tx.seller)}
                </span>
              </div>

              {/* To */}
              <div className="hidden sm:flex items-center">
                <span className="font-mono text-xs text-os-primary truncate">
                  {truncateAddr(tx.buyer)}
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center">
                <span className="text-xs text-os-text-secondary">
                  {timeAgo(tx.time)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          >
            Show more
          </button>
        </div>
      )}
    </div>
  );
};
