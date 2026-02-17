import type { GalleryResponse, TokenDetail, CollectionStats, ActivityResponse, SearchResponse } from '../types';

const BASE = '';

export const api = {
  async getGallery(page: number): Promise<GalleryResponse> {
    const res = await fetch(`${BASE}/api/gallery?page=${page}`);
    if (!res.ok) throw new Error(`Gallery fetch failed: ${res.status}`);
    return res.json();
  },

  async getToken(id: number): Promise<TokenDetail> {
    const res = await fetch(`${BASE}/api/token/${id}`);
    if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
    return res.json();
  },

  async getCollection(): Promise<CollectionStats> {
    const res = await fetch(`${BASE}/api/collection`);
    if (!res.ok) throw new Error(`Collection fetch failed: ${res.status}`);
    return res.json();
  },

  async getActivity(page: number): Promise<ActivityResponse> {
    const res = await fetch(`${BASE}/api/activity?page=${page}`);
    if (!res.ok) throw new Error(`Activity fetch failed: ${res.status}`);
    return res.json();
  },

  async getTokenActivity(tokenId: number, page: number): Promise<ActivityResponse> {
    const res = await fetch(`${BASE}/api/activity/token/${tokenId}?page=${page}`);
    if (!res.ok) throw new Error(`Token activity fetch failed: ${res.status}`);
    return res.json();
  },

  async search(query: string, page: number): Promise<SearchResponse> {
    const res = await fetch(`${BASE}/api/search?q=${encodeURIComponent(query)}&page=${page}`);
    if (!res.ok) throw new Error(`Search failed: ${res.status}`);
    return res.json();
  },

  async getOwnerTokens(principal: string, page: number): Promise<GalleryResponse> {
    const res = await fetch(`${BASE}/api/tokens/owner/${principal}?page=${page}`);
    if (!res.ok) throw new Error(`Owner tokens fetch failed: ${res.status}`);
    return res.json();
  },
};
