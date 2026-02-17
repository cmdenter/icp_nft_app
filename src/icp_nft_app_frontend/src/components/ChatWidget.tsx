import React, { useState } from 'react';
import { CHANNELS, DEFAULT_CHANNEL } from '../store/chatStore';
import { useChatStore } from '../store/chatStore';
import { ShareChat } from './ShareChat';
import { ChatIcon, XIcon, HashIcon } from './icons';

export const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState(DEFAULT_CHANNEL);
  const messages = useChatStore((s) => s.messages);

  const totalMessages = messages.length;
  const activeDef = CHANNELS.find((c) => c.id === channel) || CHANNELS[0];

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[60] w-12 h-12 rounded-full bg-os-primary hover:bg-os-primary-hover shadow-xl shadow-os-primary/30 flex items-center justify-center transition-all hover:scale-105 btn-press"
      >
        <ChatIcon size={22} className="text-white" />
        {totalMessages > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-os-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {totalMessages > 99 ? '99' : totalMessages}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[60] w-[380px] h-[500px] flex flex-col rounded-2xl bg-os-surface border border-os-border/50 shadow-2xl shadow-black/40 animate-float-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-os-border/30 shrink-0">
        <div className="flex items-center gap-2">
          <ChatIcon size={16} className="text-os-primary" />
          <span className="text-sm font-bold text-white">Chat</span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="w-7 h-7 rounded-lg hover:bg-os-card/60 flex items-center justify-center text-os-text-secondary hover:text-white transition-colors"
        >
          <XIcon size={14} />
        </button>
      </div>

      {/* Channel tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-os-border/20 overflow-x-auto hide-scrollbar shrink-0">
        {CHANNELS.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setChannel(ch.id)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
              channel === ch.id
                ? 'bg-os-primary/15 text-os-primary'
                : 'text-os-text-secondary hover:text-white hover:bg-os-card/40'
            }`}
          >
            <HashIcon size={10} />
            {ch.name}
          </button>
        ))}
      </div>

      {/* Chat content */}
      <div className="flex-1 overflow-y-auto p-3">
        <ShareChat threadId={channel} title={activeDef.name} />
      </div>
    </div>
  );
};
