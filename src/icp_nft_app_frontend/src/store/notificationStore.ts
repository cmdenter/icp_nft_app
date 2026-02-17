import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: number;
  read: boolean;
  link?: string;
}

export interface Toast {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

const STORAGE_KEY = 'nft_notifications';
const MAX_NOTIFICATIONS = 50;

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

interface NotificationStore {
  notifications: Notification[];
  toasts: Toast[];
  unreadCount: () => number;
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  showToast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
  _hydrate: () => void;
}

function persist(notifications: Notification[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS))); } catch { /* quota */ }
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  toasts: [],

  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  addNotification: (n) => {
    const notification: Notification = { ...n, id: genId(), createdAt: Date.now(), read: false };
    const updated = [notification, ...get().notifications].slice(0, MAX_NOTIFICATIONS);
    set({ notifications: updated });
    persist(updated);
  },

  showToast: (t) => {
    const toast: Toast = { ...t, id: genId() };
    set({ toasts: [...get().toasts, toast] });
    const duration = t.duration ?? 4000;
    setTimeout(() => {
      set({ toasts: get().toasts.filter((tt) => tt.id !== toast.id) });
    }, duration);
  },

  dismissToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  markRead: (id) => {
    const updated = get().notifications.map((n) => n.id === id ? { ...n, read: true } : n);
    set({ notifications: updated });
    persist(updated);
  },

  markAllRead: () => {
    const updated = get().notifications.map((n) => ({ ...n, read: true }));
    set({ notifications: updated });
    persist(updated);
  },

  clearNotifications: () => {
    set({ notifications: [] });
    localStorage.removeItem(STORAGE_KEY);
  },

  _hydrate: () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      set({ notifications: Array.isArray(raw) ? raw : [] });
    } catch { set({ notifications: [] }); }
  },
}));
