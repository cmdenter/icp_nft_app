import { create } from 'zustand';
import type { CreatorInfo, CreatorAnnouncement, CreatorPayout } from '../types';

const STORAGE_KEY = 'creator_dashboard';

interface PersistedState {
  claimedCreatorIds: string[];
  announcements: Record<string, CreatorAnnouncement[]>;
  payouts: CreatorPayout[];
  profileOverrides: Record<string, Partial<CreatorInfo>>;
}

interface CreatorStore {
  claimedCreatorIds: string[];
  announcements: Record<string, CreatorAnnouncement[]>;
  payouts: CreatorPayout[];
  profileOverrides: Record<string, Partial<CreatorInfo>>;

  claimCreatorPage: (creatorId: string) => void;
  unclaimCreatorPage: (creatorId: string) => void;
  isCreatorClaimed: (creatorId: string) => boolean;

  addAnnouncement: (creatorId: string, text: string) => void;
  deleteAnnouncement: (creatorId: string, announcementId: string) => void;
  getAnnouncements: (creatorId: string) => CreatorAnnouncement[];

  updateProfile: (creatorId: string, data: Partial<CreatorInfo>) => void;

  _hydrate: () => void;
}

function persistState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota */ }
}

function getPersistedFields(state: CreatorStore): PersistedState {
  return {
    claimedCreatorIds: state.claimedCreatorIds,
    announcements: state.announcements,
    payouts: state.payouts,
    profileOverrides: state.profileOverrides,
  };
}

export const useCreatorStore = create<CreatorStore>((set, get) => ({
  claimedCreatorIds: [],
  announcements: {},
  payouts: [],
  profileOverrides: {},

  claimCreatorPage: (creatorId) => {
    const ids = get().claimedCreatorIds;
    if (ids.includes(creatorId)) return;
    const next = { ...get(), claimedCreatorIds: [...ids, creatorId] };
    set({ claimedCreatorIds: next.claimedCreatorIds });
    persistState(getPersistedFields(get()));
  },

  unclaimCreatorPage: (creatorId) => {
    set({ claimedCreatorIds: get().claimedCreatorIds.filter((id) => id !== creatorId) });
    persistState(getPersistedFields(get()));
  },

  isCreatorClaimed: (creatorId) => get().claimedCreatorIds.includes(creatorId),

  addAnnouncement: (creatorId, text) => {
    const all = { ...get().announcements };
    const list = all[creatorId] || [];
    all[creatorId] = [
      { id: crypto.randomUUID(), text, createdAt: Date.now() },
      ...list,
    ];
    set({ announcements: all });
    persistState(getPersistedFields(get()));
  },

  deleteAnnouncement: (creatorId, announcementId) => {
    const all = { ...get().announcements };
    all[creatorId] = (all[creatorId] || []).filter((a) => a.id !== announcementId);
    set({ announcements: all });
    persistState(getPersistedFields(get()));
  },

  getAnnouncements: (creatorId) => get().announcements[creatorId] || [],

  updateProfile: (creatorId, data) => {
    const overrides = { ...get().profileOverrides };
    overrides[creatorId] = { ...overrides[creatorId], ...data };
    set({ profileOverrides: overrides });
    persistState(getPersistedFields(get()));
  },

  _hydrate: () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Partial<PersistedState>;
      set({
        claimedCreatorIds: raw.claimedCreatorIds || [],
        announcements: raw.announcements || {},
        payouts: raw.payouts || [],
        profileOverrides: raw.profileOverrides || {},
      });
    } catch { /* ignore */ }
  },
}));
