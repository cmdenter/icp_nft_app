import React from 'react';
import { useAdminStore } from '../store/adminStore';
import { NewspaperIcon, PinIcon } from './icons';

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const NewsFeed: React.FC = () => {
  const news = useAdminStore((s) => s.news);

  if (news.length === 0) return null;

  const sorted = [...news].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.createdAt - a.createdAt;
  });

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-5">
        <NewspaperIcon size={20} className="text-os-primary" />
        <h2 className="text-xl font-bold text-white">Latest News</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.slice(0, 6).map((item) => (
          <div
            key={item.id}
            className="rounded-xl bg-os-surface border border-os-border/40 p-4 hover:border-os-primary/30 transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-sm font-bold text-white line-clamp-1">{item.title}</h3>
              {item.pinned && <PinIcon size={14} className="text-os-yellow shrink-0 mt-0.5" />}
            </div>
            <p className="text-[13px] text-os-text-secondary line-clamp-2 leading-relaxed mb-3">
              {item.body}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-os-text-secondary">
              <span>{item.author}</span>
              <span>·</span>
              <span>{timeAgo(item.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
