import React, { useState } from 'react';
import { CHANNELS, DEFAULT_CHANNEL } from '../store/chatStore';
import { useChatStore } from '../store/chatStore';
import { ShareChat } from '../components/ShareChat';
import { HashIcon, ChatIcon } from '../components/icons';

const ChatPage: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState(DEFAULT_CHANNEL);
  const getMessageCount = useChatStore((s) => s.getMessageCount);

  const activeDef = CHANNELS.find((c) => c.id === activeChannel) || CHANNELS[0];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 py-4">
        <ChatIcon size={24} className="text-os-primary" />
        <h1 className="text-2xl font-bold text-white">Community Chat</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Channel Sidebar */}
        <nav className="lg:w-[220px] shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible hide-scrollbar pb-2 lg:pb-0 lg:sticky lg:top-[160px]">
            <p className="hidden lg:block text-[11px] font-bold text-os-text-secondary uppercase tracking-wider mb-2 px-3">Channels</p>
            {CHANNELS.map((ch) => {
              const isActive = activeChannel === ch.id;
              const count = getMessageCount(ch.id);
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-os-primary/8 text-white'
                      : 'text-os-text-secondary hover:text-white hover:bg-os-card/40'
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-os-primary hidden lg:block" />}
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

        {/* Chat Content */}
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl border border-os-border/50 bg-os-surface p-5">
            <ShareChat threadId={activeChannel} title={`# ${activeDef.name}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
