import { create } from 'zustand';

export interface WishlistItem {
  collectionId: string;
  tokenIndex: number;
  name: string;
  image: string;
  collectionName: string;
  price?: number;
  addedAt: number;
}

function wlKey(item: Pick<WishlistItem, 'collectionId' | 'tokenIndex'>): string {
  return `${item.collectionId}-${item.tokenIndex}`;
}

const STORAGE_KEY = 'nft_wishlist';

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (collectionId: string, tokenIndex: number) => void;
  isWishlisted: (collectionId: string, tokenIndex: number) => boolean;
  toggleWishlist: (item: WishlistItem) => void;
  clearWishlist: () => void;
  itemCount: () => number;
  _hydrate: () => void;
}

function persist(items: WishlistItem[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* quota */ }
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],

  addItem: (item) => {
    const { items } = get();
    if (items.some((i) => wlKey(i) === wlKey(item))) return;
    const updated = [item, ...items];
    set({ items: updated });
    persist(updated);
  },

  removeItem: (collectionId, tokenIndex) => {
    const key = `${collectionId}-${tokenIndex}`;
    const updated = get().items.filter((i) => wlKey(i) !== key);
    set({ items: updated });
    persist(updated);
  },

  isWishlisted: (collectionId, tokenIndex) => {
    return get().items.some((i) => wlKey(i) === `${collectionId}-${tokenIndex}`);
  },

  toggleWishlist: (item) => {
    const key = wlKey(item);
    const { items } = get();
    const exists = items.some((i) => wlKey(i) === key);
    if (exists) {
      const updated = items.filter((i) => wlKey(i) !== key);
      set({ items: updated });
      persist(updated);
    } else {
      const updated = [item, ...items];
      set({ items: updated });
      persist(updated);
    }
  },

  clearWishlist: () => {
    set({ items: [] });
    localStorage.removeItem(STORAGE_KEY);
  },

  itemCount: () => get().items.length,

  _hydrate: () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      set({ items: Array.isArray(raw) ? raw : [] });
    } catch { set({ items: [] }); }
  },
}));
