import { create } from 'zustand';

export interface CartItem {
  collectionId: string;
  tokenIndex: number;
  name: string;
  image: string;
  collectionName: string;
  price: number;
  seller: string;
  addedAt: number;
}

function cartKey(item: Pick<CartItem, 'collectionId' | 'tokenIndex'>): string {
  return `${item.collectionId}-${item.tokenIndex}`;
}

const STORAGE_KEY = 'nft_cart';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (collectionId: string, tokenIndex: number) => void;
  removeSuccessful: (keys: string[]) => void;
  clearCart: () => void;
  isInCart: (collectionId: string, tokenIndex: number) => boolean;
  totalPrice: () => number;
  itemCount: () => number;
  _hydrate: () => void;
}

function persist(items: CartItem[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* quota */ }
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) => {
    const { items } = get();
    if (items.some((i) => cartKey(i) === cartKey(item))) return;
    const updated = [...items, item];
    set({ items: updated });
    persist(updated);
  },

  removeItem: (collectionId, tokenIndex) => {
    const key = `${collectionId}-${tokenIndex}`;
    const updated = get().items.filter((i) => cartKey(i) !== key);
    set({ items: updated });
    persist(updated);
  },

  removeSuccessful: (keys) => {
    const updated = get().items.filter((i) => !keys.includes(cartKey(i)));
    set({ items: updated });
    persist(updated);
  },

  clearCart: () => {
    set({ items: [] });
    localStorage.removeItem(STORAGE_KEY);
  },

  isInCart: (collectionId, tokenIndex) => {
    return get().items.some((i) => cartKey(i) === `${collectionId}-${tokenIndex}`);
  },

  totalPrice: () => get().items.reduce((sum, i) => sum + i.price, 0),
  itemCount: () => get().items.length,

  _hydrate: () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      set({ items: Array.isArray(raw) ? raw : [] });
    } catch { set({ items: [] }); }
  },
}));
