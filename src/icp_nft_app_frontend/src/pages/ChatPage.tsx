import React, { useState, useMemo } from 'react';
import { CHANNELS, DEFAULT_CHANNEL, useChatStore } from '../store/chatStore';
import { useAdminStore } from '../store/adminStore';
import { ShareChat } from '../components/ShareChat';
import { AdSlot } from '../components/AdSlot';
import { SidebarWidgets } from '../components/SidebarWidgets';
import { HashIcon, ChatIcon } from '../components/icons';

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

const ChatPage: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState(DEFAULT_CHANNEL);
  const getMessageCount = useChatStore((s) => s.getMessageCount);
  const news = useAdminStore((s) => s.news);

  const activeDef = CHANNELS.find((c) => c.id === activeChannel) || CHANNELS[0];

  const latestNews = useMemo(() => {
    return news.slice(0, 3);
  }, [news]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-12">
      {/* Page header */}
      <div className="flex items-center gap-3 py-4">
        <ChatIcon size={24} className="text-os-primary" />
        <h1 className="text-2xl font-bold text-white">Community Chat</h1>
      </div>

      {/* Mobile channel tabs (visible only < lg) */}
      <div className="lg:hidden mb-4">
        <div className="flex gap-1 overflow-x-auto hide-scrollbar pb-2">
          {CHANNELS.map((ch) => {
            const isActive = activeChannel === ch.id;
            const count = getMessageCount(ch.id);
            return (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`relative flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-os-primary/8 text-white'
                    : 'text-os-text-secondary hover:text-white hover:bg-os-card/40'
                }`}
              >
                <HashIcon size={14} className={isActive ? 'text-os-primary' : ''} />
                {ch.name}
                {count > 0 && (
                  <span className="ml-1 text-[10px] font-bold bg-os-card px-1.5 py-0.5 rounded-full text-os-text-secondary">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-column layout with vertical ad banners flanking chat */}
      <div className="flex gap-5">
        {/* LEFT SIDEBAR — Channels + Vertical Ad Stack */}
        <aside className="hidden lg:block w-[220px] shrink-0">
          <div className="sticky top-[80px] space-y-4">
            {/* Channel list */}
            <nav>
              <p className="text-[11px] font-bold text-os-text-secondary uppercase tracking-wider mb-2 px-3">
                Channels
              </p>
              <div className="flex flex-col gap-0.5">
                {CHANNELS.map((ch) => {
                  const isActive = activeChannel === ch.id;
                  const count = getMessageCount(ch.id);
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setActiveChannel(ch.id)}
                      className={`relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all duration-200 ${
                        isActive
                          ? 'bg-os-primary/8 text-white'
                          : 'text-os-text-secondary hover:text-white hover:bg-os-card/40'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-os-primary" />
                      )}
                      <HashIcon size={14} className={isActive ? 'text-os-primary' : ''} />
                      {ch.name}
                      {count > 0 && (
                        <span className="ml-auto text-[10px] font-bold bg-os-card px-1.5 py-0.5 rounded-full text-os-text-secondary">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Vertical ad stack — left side */}
            <AdSlot placement="sidebar" />
            <AdSlot placement="sidebar" />

            {/* Latest news */}
            {latestNews.length > 0 && (
              <div className="rounded-xl bg-os-surface/80 border border-os-border/50 p-3.5">
                <p className="text-[11px] font-bold text-os-text-secondary uppercase tracking-wider mb-2.5 px-0.5">
                  Latest News
                </p>
                <div className="space-y-2.5">
                  {latestNews.map((item) => (
                    <div key={item.id} className="space-y-0.5">
                      <h4 className="text-[12px] font-bold text-white leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-os-text-secondary line-clamp-2 leading-relaxed">
                        {item.body}
                      </p>
                      <p className="text-[10px] text-os-text-secondary/60">
                        {timeAgo(item.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* CENTER CHAT */}
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl border border-os-border/50 bg-os-surface p-5">
            {/* Channel header */}
            <div className="flex items-center gap-2.5 mb-4">
              <HashIcon size={18} className="text-os-primary" />
              <span className="text-sm font-bold text-white">{activeDef.name}</span>
              {getMessageCount(activeChannel) > 0 && (
                <span className="text-[10px] font-bold bg-os-primary/15 text-os-primary px-2 py-0.5 rounded-full">
                  {getMessageCount(activeChannel)}
                </span>
              )}
            </div>

            {/* ShareChat thread */}
            <ShareChat threadId={activeChannel} title={`# ${activeDef.name}`} />
          </div>
        </div>

        {/* RIGHT SIDEBAR — Vertical Ad Stack + Widgets */}
        <aside className="hidden lg:block w-[240px] shrink-0">
          <div className="sticky top-[80px] space-y-4">
            <AdSlot placement="sidebar" />
            <AdSlot placement="sidebar" />
            <SidebarWidgets />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ChatPage;
