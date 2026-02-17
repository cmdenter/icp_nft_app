import { create } from 'zustand';

export interface PurchaseRecord {
  id: string;
  collectionId: string;
  tokenIndex: number;
  name: string;
  image: string;
  collectionName: string;
  price: number;
  seller: string;
  purchasedAt: number;
  status: 'success' | 'failed' | 'pending';
  error?: string;
}

const STORAGE_KEY = 'nft_purchases';
const MAX_RECORDS = 200;

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

interface PurchaseHistoryStore {
  purchases: PurchaseRecord[];
  addPurchase: (p: Omit<PurchaseRecord, 'id'>) => void;
  updatePurchase: (id: string, updates: Partial<PurchaseRecord>) => void;
  getPurchases: () => PurchaseRecord[];
  _hydrate: () => void;
}

function persist(purchases: PurchaseRecord[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases.slice(0, MAX_RECORDS))); } catch { /* quota */ }
}

export const usePurchaseHistoryStore = create<PurchaseHistoryStore>((set, get) => ({
  purchases: [],

  addPurchase: (p) => {
    const record: PurchaseRecord = { ...p, id: genId() };
    const updated = [record, ...get().purchases].slice(0, MAX_RECORDS);
    set({ purchases: updated });
    persist(updated);
    return record.id;
  },

  updatePurchase: (id, updates) => {
    const updated = get().purchases.map((p) => p.id === id ? { ...p, ...updates } : p);
    set({ purchases: updated });
    persist(updated);
  },

  getPurchases: () => get().purchases,

  _hydrate: () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      set({ purchases: Array.isArray(raw) ? raw : [] });
    } catch { set({ purchases: [] }); }
  },
}));
