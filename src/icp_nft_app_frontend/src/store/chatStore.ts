import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  threadId: string;
  author: string;
  text: string;
  timestamp: number;
  likes: number;
}

export const CHANNELS = [
  { id: 'global-chat', name: 'Global', icon: 'hash' },
  { id: 'nft-talk', name: 'NFT Talk', icon: 'hash' },
  { id: 'token-talk', name: 'Tokens', icon: 'hash' },
  { id: 'trading', name: 'Trading', icon: 'hash' },
  { id: 'off-topic', name: 'Off-Topic', icon: 'hash' },
] as const;

export const DEFAULT_CHANNEL = 'global-chat';

const STORAGE_KEY = 'nft_chat_messages';
const LIKES_STORAGE_KEY = 'nft_chat_likes';

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

interface ChatStore {
  messages: ChatMessage[];
  likedMessages: Record<string, boolean>;
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp' | 'likes'>) => void;
  deleteMessage: (id: string) => void;
  toggleLike: (messageId: string) => void;
  getMessages: (threadId: string) => ChatMessage[];
  getMessageCount: (threadId: string) => number;
  _hydrate: () => void;
}

function persistMessages(messages: ChatMessage[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch { /* quota */ }
}

function persistLikes(likes: Record<string, boolean>) {
  try { localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likes)); } catch { /* quota */ }
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  likedMessages: {},

  addMessage: (msg) => {
    const newMessage: ChatMessage = { ...msg, id: genId(), timestamp: Date.now(), likes: 0 };
    const updated = [newMessage, ...get().messages];
    set({ messages: updated });
    persistMessages(updated);
  },

  deleteMessage: (id) => {
    const updated = get().messages.filter((m) => m.id !== id);
    set({ messages: updated });
    persistMessages(updated);
  },

  toggleLike: (messageId) => {
    const { messages, likedMessages } = get();
    const alreadyLiked = !!likedMessages[messageId];

    const updatedMessages = messages.map((m) =>
      m.id === messageId
        ? { ...m, likes: alreadyLiked ? Math.max(0, m.likes - 1) : m.likes + 1 }
        : m
    );

    const updatedLikes = { ...likedMessages };
    if (alreadyLiked) {
      delete updatedLikes[messageId];
    } else {
      updatedLikes[messageId] = true;
    }

    set({ messages: updatedMessages, likedMessages: updatedLikes });
    persistMessages(updatedMessages);
    persistLikes(updatedLikes);
  },

  getMessages: (threadId) => {
    return get().messages
      .filter((m) => m.threadId === threadId)
      .sort((a, b) => b.timestamp - a.timestamp);
  },

  getMessageCount: (threadId) => {
    return get().messages.filter((m) => m.threadId === threadId).length;
  },

  _hydrate: () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      set({ messages: Array.isArray(raw) ? raw : [] });
    } catch { set({ messages: [] }); }

    try {
      const rawLikes = JSON.parse(localStorage.getItem(LIKES_STORAGE_KEY) || '{}');
      set({ likedMessages: typeof rawLikes === 'object' && rawLikes !== null ? rawLikes : {} });
    } catch { set({ likedMessages: {} }); }
  },
}));
