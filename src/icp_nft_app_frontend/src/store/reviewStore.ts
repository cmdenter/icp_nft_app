import { create } from 'zustand';

export interface Review {
  id: string;
  collectionId: string;
  tokenIndex?: number;
  rating: number;
  text: string;
  author: string;
  createdAt: number;
}

const STORAGE_KEY = 'nft_reviews';
const VOTES_STORAGE_KEY = 'nft_review_votes';

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

interface ReviewStore {
  reviews: Review[];
  helpfulVotes: Record<string, 'yes' | 'no'>;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  deleteReview: (id: string) => void;
  getReviewsForToken: (collectionId: string, tokenIndex: number) => Review[];
  getReviewsForCollection: (collectionId: string) => Review[];
  getAverageRating: (collectionId: string, tokenIndex?: number) => { avg: number; count: number };
  voteHelpful: (reviewId: string, vote: 'yes' | 'no') => void;
  getVote: (reviewId: string) => 'yes' | 'no' | null;
  _hydrate: () => void;
}

function persist(reviews: Review[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews)); } catch { /* quota */ }
}

function persistVotes(votes: Record<string, 'yes' | 'no'>) {
  try { localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votes)); } catch { /* quota */ }
}

export const useReviewStore = create<ReviewStore>((set, get) => ({
  reviews: [],
  helpfulVotes: {},

  addReview: (review) => {
    const newReview: Review = { ...review, id: genId(), createdAt: Date.now() };
    const updated = [newReview, ...get().reviews];
    set({ reviews: updated });
    persist(updated);
  },

  deleteReview: (id) => {
    const updated = get().reviews.filter((r) => r.id !== id);
    set({ reviews: updated });
    persist(updated);
  },

  getReviewsForToken: (collectionId, tokenIndex) => {
    return get().reviews.filter(
      (r) => r.collectionId === collectionId && r.tokenIndex === tokenIndex
    );
  },

  getReviewsForCollection: (collectionId) => {
    return get().reviews.filter((r) => r.collectionId === collectionId);
  },

  getAverageRating: (collectionId, tokenIndex) => {
    const filtered = tokenIndex != null
      ? get().reviews.filter((r) => r.collectionId === collectionId && r.tokenIndex === tokenIndex)
      : get().reviews.filter((r) => r.collectionId === collectionId);
    if (filtered.length === 0) return { avg: 0, count: 0 };
    const sum = filtered.reduce((s, r) => s + r.rating, 0);
    return { avg: sum / filtered.length, count: filtered.length };
  },

  voteHelpful: (reviewId, vote) => {
    const updated = { ...get().helpfulVotes, [reviewId]: vote };
    set({ helpfulVotes: updated });
    persistVotes(updated);
  },

  getVote: (reviewId) => {
    return get().helpfulVotes[reviewId] || null;
  },

  _hydrate: () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      set({ reviews: Array.isArray(raw) ? raw : [] });
    } catch { set({ reviews: [] }); }

    try {
      const rawVotes = JSON.parse(localStorage.getItem(VOTES_STORAGE_KEY) || '{}');
      set({ helpfulVotes: typeof rawVotes === 'object' && rawVotes !== null ? rawVotes : {} });
    } catch { set({ helpfulVotes: {} }); }
  },
}));
