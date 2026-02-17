import React, { useState, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useNFTStore } from '../store/nftStore';
import { ThumbsUpIcon, ThumbsDownIcon, TrashIcon, SendIcon } from './icons';

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

interface ShareChatProps {
  threadId: string;
  title?: string;
}

export const ShareChat: React.FC<ShareChatProps> = ({ threadId, title }) => {
  const [text, setText] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [visibleCount, setVisibleCount] = useState(20);

  const currentPrincipal = useNFTStore((s) => s.plugPrincipal || s.principal || '') || 'Anonymous';
  const addMessage = useChatStore((s) => s.addMessage);
  const deleteMessage = useChatStore((s) => s.deleteMessage);
  const toggleLike = useChatStore((s) => s.toggleLike);
  const toggleDislike = useChatStore((s) => s.toggleDislike);
  const getMessages = useChatStore((s) => s.getMessages);
  const getMessageCount = useChatStore((s) => s.getMessageCount);
  const likedMessages = useChatStore((s) => s.likedMessages);
  const dislikedMessages = useChatStore((s) => s.dislikedMessages);

  useEffect(() => {
    setVisibleCount(20);
  }, [threadId]);

  const allMessages = getMessages(threadId);
  const messageCount = getMessageCount(threadId);

  const sorted = sort === 'newest'
    ? allMessages
    : [...allMessages].reverse();

  const visible = sorted.slice(0, visibleCount);
  const hasMore = messageCount > visibleCount;

  const charsLeft = 280 - text.length;
  const canSend = text.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    addMessage({
      threadId,
      author: currentPrincipal,
      text: text.trim(),
    });
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const truncateAuthor = (author: string) => {
    if (author.length <= 8) return author;
    return author.slice(0, 8) + '...';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h3 className="text-white font-semibold text-sm">
          {title || 'Share Chat'}
        </h3>
        <span className="text-[10px] font-bold bg-os-primary/20 text-os-primary px-1.5 py-0.5 rounded-full">
          {messageCount}
        </span>
      </div>

      {/* Input area */}
      <div className="rounded-xl bg-os-surface border border-os-border/40 p-3">
        <textarea
          rows={2}
          maxLength={280}
          placeholder="Share your thoughts..."
          className="w-full bg-transparent text-sm text-white placeholder-os-text-secondary/50 resize-none outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="flex items-center justify-between mt-2">
          <div />
          <div className="flex items-center gap-3">
            <span
              className={`text-[10px] ${
                charsLeft < 20 ? 'text-os-secondary' : 'text-os-text-secondary'
              }`}
            >
              {charsLeft}
            </span>
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-os-primary hover:bg-os-primary-hover text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <SendIcon size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Sort toggle */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setSort('newest')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            sort === 'newest'
              ? 'bg-os-primary text-white'
              : 'bg-os-surface text-os-text-secondary hover:text-white'
          }`}
        >
          Newest
        </button>
        <button
          onClick={() => setSort('oldest')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            sort === 'oldest'
              ? 'bg-os-primary text-white'
              : 'bg-os-surface text-os-text-secondary hover:text-white'
          }`}
        >
          Oldest
        </button>
      </div>

      {/* Message list */}
      {messageCount === 0 ? (
        <p className="text-sm text-os-text-secondary text-center py-8">
          Be the first to share your thoughts
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((msg) => (
            <div
              key={msg.id}
              className="rounded-xl bg-os-surface/50 border-l-[3px] border-l-os-primary/40 border border-os-border/20 p-3"
            >
              {/* Top row: avatar, author, timestamp */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-os-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-os-primary">
                    {msg.author.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-white font-medium truncate">
                  {truncateAuthor(msg.author)}
                </span>
                <span className="text-[10px] text-os-text-secondary ml-auto flex-shrink-0">
                  {timeAgo(msg.timestamp)}
                </span>
              </div>

              {/* Message text */}
              <p className="text-sm text-white/90 leading-relaxed mb-2">
                {msg.text}
              </p>

              {/* Bottom row: thumbs up, thumbs down, spacer, delete */}
              <div className="flex items-center gap-3">
                {/* Thumbs up */}
                <button
                  onClick={() => toggleLike(msg.id)}
                  className={`flex items-center gap-1 text-xs transition-colors ${
                    likedMessages[msg.id]
                      ? 'text-os-green'
                      : 'text-os-text-secondary hover:text-os-green'
                  }`}
                >
                  <ThumbsUpIcon size={14} />
                  {msg.likes > 0 && <span>{msg.likes}</span>}
                </button>

                {/* Thumbs down */}
                <button
                  onClick={() => toggleDislike(msg.id)}
                  className={`flex items-center gap-1 text-xs transition-colors ${
                    dislikedMessages[msg.id]
                      ? 'text-os-secondary'
                      : 'text-os-text-secondary hover:text-os-secondary'
                  }`}
                >
                  <ThumbsDownIcon size={14} />
                  {msg.dislikes > 0 && <span>{msg.dislikes}</span>}
                </button>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Delete (only if current user is author) */}
                {msg.author === currentPrincipal && (
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    className="text-os-text-secondary/40 hover:text-os-secondary transition-colors"
                  >
                    <TrashIcon size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Load More */}
          {hasMore && (
            <button
              onClick={() => setVisibleCount((c) => c + 20)}
              className="text-sm text-os-primary hover:text-os-primary-hover font-medium transition-colors py-2"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
};
