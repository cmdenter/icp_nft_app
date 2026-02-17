import { create } from 'zustand';

const STORAGE_KEY = 'nft_admin';

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export interface Banner {
  id: string;
  title: string;
  message: string;
  link?: string;
  gradient: string;
  active: boolean;
  createdAt: number;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  link: string;
  placement: 'sidebar' | 'feed' | 'banner';
  active: boolean;
  createdAt: number;
}

export interface NewsItem {
  id: string;
  title: string;
  body: string;
  author: string;
  pinned: boolean;
  createdAt: number;
}

interface AdminStore {
  isAdmin: boolean;
  banners: Banner[];
  ads: Ad[];
  news: NewsItem[];

  toggleAdmin: () => void;

  addBanner: (b: Omit<Banner, 'id' | 'createdAt'>) => void;
  updateBanner: (id: string, updates: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;

  addAd: (a: Omit<Ad, 'id' | 'createdAt'>) => void;
  updateAd: (id: string, updates: Partial<Ad>) => void;
  deleteAd: (id: string) => void;

  addNews: (n: Omit<NewsItem, 'id' | 'createdAt'>) => void;
  updateNews: (id: string, updates: Partial<NewsItem>) => void;
  deleteNews: (id: string) => void;

  _hydrate: () => void;
}

function persistAll(state: { isAdmin: boolean; banners: Banner[]; ads: Ad[]; news: NewsItem[] }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      isAdmin: state.isAdmin,
      banners: state.banners,
      ads: state.ads,
      news: state.news,
    }));
  } catch { /* quota */ }
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  isAdmin: false,
  banners: [],
  ads: [],
  news: [],

  toggleAdmin: () => {
    const next = !get().isAdmin;
    set({ isAdmin: next });
    persistAll({ ...get(), isAdmin: next });
  },

  addBanner: (b) => {
    const banner: Banner = { ...b, id: genId(), createdAt: Date.now() };
    const banners = [banner, ...get().banners];
    set({ banners });
    persistAll(get());
  },
  updateBanner: (id, updates) => {
    const banners = get().banners.map((b) => (b.id === id ? { ...b, ...updates } : b));
    set({ banners });
    persistAll(get());
  },
  deleteBanner: (id) => {
    const banners = get().banners.filter((b) => b.id !== id);
    set({ banners });
    persistAll(get());
  },

  addAd: (a) => {
    const ad: Ad = { ...a, id: genId(), createdAt: Date.now() };
    const ads = [ad, ...get().ads];
    set({ ads });
    persistAll(get());
  },
  updateAd: (id, updates) => {
    const ads = get().ads.map((a) => (a.id === id ? { ...a, ...updates } : a));
    set({ ads });
    persistAll(get());
  },
  deleteAd: (id) => {
    const ads = get().ads.filter((a) => a.id !== id);
    set({ ads });
    persistAll(get());
  },

  addNews: (n) => {
    const item: NewsItem = { ...n, id: genId(), createdAt: Date.now() };
    const news = [item, ...get().news];
    set({ news });
    persistAll(get());
  },
  updateNews: (id, updates) => {
    const news = get().news.map((n) => (n.id === id ? { ...n, ...updates } : n));
    set({ news });
    persistAll(get());
  },
  deleteNews: (id) => {
    const news = get().news.filter((n) => n.id !== id);
    set({ news });
    persistAll(get());
  },

  _hydrate: () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (raw && typeof raw === 'object') {
        set({
          isAdmin: !!raw.isAdmin,
          banners: Array.isArray(raw.banners) ? raw.banners : [],
          ads: Array.isArray(raw.ads) ? raw.ads : [],
          news: Array.isArray(raw.news) ? raw.news : [],
        });
      }
    } catch { /* ignore */ }
  },
}));
