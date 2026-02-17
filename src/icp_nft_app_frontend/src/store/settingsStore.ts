import { create } from 'zustand';

const STORAGE_KEY = 'nft_settings';

interface ProfileSettings {
  displayName: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  themeColor: string;
  website: string;
  twitter: string;
  discord: string;
}

const DEFAULTS: ProfileSettings = {
  displayName: '',
  bio: '',
  avatarUrl: '',
  bannerUrl: '',
  themeColor: '#2081E2',
  website: '',
  twitter: '',
  discord: '',
};

interface SettingsStore extends ProfileSettings {
  setField: <K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) => void;
  setDisplayName: (name: string) => void;
  _hydrate: () => void;
}

function persist(settings: ProfileSettings) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch { /* quota */ }
}

function getSnapshot(state: SettingsStore): ProfileSettings {
  return {
    displayName: state.displayName,
    bio: state.bio,
    avatarUrl: state.avatarUrl,
    bannerUrl: state.bannerUrl,
    themeColor: state.themeColor,
    website: state.website,
    twitter: state.twitter,
    discord: state.discord,
  };
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...DEFAULTS,

  setField: (key, value) => {
    set({ [key]: value } as Partial<SettingsStore>);
    persist(getSnapshot({ ...get(), [key]: value } as SettingsStore));
  },

  setDisplayName: (name) => {
    set({ displayName: name });
    persist(getSnapshot({ ...get(), displayName: name } as SettingsStore));
  },

  _hydrate: () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (raw && typeof raw === 'object') {
        const merged: Partial<ProfileSettings> = {};
        for (const k of Object.keys(DEFAULTS) as (keyof ProfileSettings)[]) {
          if (typeof raw[k] === 'string') merged[k] = raw[k];
        }
        set(merged);
      }
    } catch { /* ignore */ }
  },
}));
