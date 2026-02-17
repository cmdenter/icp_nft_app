import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useNFTStore } from '../store/nftStore';
import { MintIcon, TransferIcon } from './icons';
import { useNavigate } from 'react-router-dom';

const EVENT_FILTERS = ['All', 'Mints', 'Transfers'] as const;
type EventFilter = (typeof EVENT_FILTERS)[number];

function timeAgo(timestamp: number): string {
  const now = Date.now();
  const ts = timestamp > 1e15 ? timestamp / 1e6 : timestamp;
  const diff = now - ts;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function truncateAddr(addr: string): string {
  if (addr.length <= 12) return addr;
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

export const ActivityTable: React.FC = () => {
  const navigate = useNavigate();
  const events = useNFTStore((s) => s.activityEvents);
  const loadActivity = useNFTStore((s) => s.loadActivity);
  const activityLoading = useNFTStore((s) => s.activityLoading);
  const activityHasMore = useNFTStore((s) => s.activityHasMore);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<EventFilter>('All');

  useEffect(() => {
    if (events.length === 0) loadActivity(true);
  }, [events.length, loadActivity]);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && activityHasMore && !activityLoading) {
        loadActivity();
      }
    },
    [activityHasMore, activityLoading, loadActivity]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleIntersection, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersection]);

  const filteredEvents = filter === 'All'
    ? events
    : events.filter((e) =>
        filter === 'Mints' ? e.eventType === 'Mint' : e.eventType === 'Transfer'
      );

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-4">
      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-os-border overflow-x-auto hide-scrollbar">
        {EVENT_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-os-primary text-white'
                : 'bg-os-surface text-os-text-secondary hover:bg-os-card hover:text-white border border-os-border'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-os-surface rounded-2xl border border-os-border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[120px_1fr_120px_1fr_1fr_100px] gap-4 px-4 py-3 text-xs font-semibold text-os-text-secondary border-b border-os-border">
          <span>Event</span>
          <span>Item</span>
          <span>Price</span>
          <span>From</span>
          <span>To</span>
          <span className="text-right">Date</span>
        </div>

        {/* Rows */}
        {filteredEvents.map((event, i) => (
          <div
            key={`${event.tokenId}-${event.timestamp}-${i}`}
            className="grid grid-cols-[120px_1fr_120px_1fr_1fr_100px] gap-4 px-4 py-3 items-center border-b border-os-border/30 hover:bg-os-card/40 transition-colors duration-150 cursor-pointer"
            onClick={() => navigate(`/nft/${event.tokenId}`)}
          >
            {/* Event type */}
            <div className="flex items-center gap-2">
              {event.eventType === 'Mint' ? (
                <div className="w-6 h-6 rounded-lg bg-os-green/10 flex items-center justify-center">
                  <MintIcon size={12} className="text-os-green" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-lg bg-os-primary/10 flex items-center justify-center">
                  <TransferIcon size={12} className="text-os-primary" />
                </div>
              )}
              <span className="text-sm text-white font-medium">{event.eventType}</span>
            </div>

            {/* Item */}
            <div className="flex items-center gap-3">
              <img
                src={event.tokenImage}
                alt={event.tokenName}
                className="w-10 h-10 rounded-lg object-cover bg-os-card"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="min-w-0">
                <p className="text-xs text-os-text-secondary">ICP Speed NFTs</p>
                <p className="text-sm text-white font-medium truncate">{event.tokenName}</p>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#E5E8EB">
                <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
              </svg>
              <span className="text-sm text-white font-medium">
                {(0.01 + event.tokenId * 0.005).toFixed(3)}
              </span>
            </div>

            {/* From */}
            <span className="text-sm text-os-primary font-mono truncate">
              {event.from ? truncateAddr(event.from) : '--'}
            </span>

            {/* To */}
            <span className="text-sm text-os-primary font-mono truncate">
              {truncateAddr(event.to)}
            </span>

            {/* Date */}
            <span className="text-sm text-os-primary text-right">
              {timeAgo(event.timestamp)}
            </span>
          </div>
        ))}
      </div>

      {/* Loading / sentinel */}
      {activityHasMore && (
        <div ref={sentinelRef} className="py-6 text-center">
          {activityLoading && (
            <div className="w-5 h-5 border-2 border-os-text-secondary border-t-transparent rounded-full animate-spin mx-auto" />
          )}
        </div>
      )}

      {!activityHasMore && filteredEvents.length > 0 && (
        <p className="text-center text-os-text-secondary text-xs py-4">
          {filteredEvents.length} events
        </p>
      )}

      {!activityLoading && filteredEvents.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-os-text-secondary">No activity yet</p>
        </div>
      )}
    </div>
  );
};
