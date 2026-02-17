import type { CollectionEntry, GalleryItem } from '../types';
import { fetchIcrc7Tokens, fetchIcrc7Supply } from './icrc7';
import { fetchExtTokens } from './ext';

const MAX_MAINNET_ITEMS = 10;

export async function fetchExternalTokens(
  collection: CollectionEntry,
  page: number
): Promise<{ items: GalleryItem[]; hasMore: boolean; total: number }> {
  if (collection.isLocal) {
    throw new Error('Use api/client.ts for local collection');
  }

  // Only load first page for mainnet collections to avoid heavy network usage
  if (page > 0) {
    return { items: [], hasMore: false, total: collection.totalSupply || 0 };
  }

  switch (collection.standard) {
    case 'icrc7': {
      const result = await fetchIcrc7Tokens(collection, null, MAX_MAINNET_ITEMS);
      const total = await fetchIcrc7Supply(collection);
      return { items: result.items, hasMore: false, total };
    }
    case 'ext': {
      const result = await fetchExtTokens(collection, 0, MAX_MAINNET_ITEMS);
      return { items: result.items, hasMore: false, total: result.total };
    }
    default:
      throw new Error(`Unknown standard: ${collection.standard}`);
  }
}
