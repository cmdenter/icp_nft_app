import { Principal } from '@dfinity/principal';
import type { CollectionEntry, GalleryItem } from '../types';

/**
 * Construct an EXT TokenIdentifier from canister ID + token index.
 * Format: \x0Atid + canister principal bytes + 4-byte big-endian index,
 * then encoded as Principal text.
 */
function makeExtTokenId(canisterId: string, index: number): string {
  const padding = new Uint8Array([10, 116, 105, 100]); // \x0Atid
  const principalBytes = Principal.fromText(canisterId).toUint8Array();
  const indexBytes = new Uint8Array(4);
  new DataView(indexBytes.buffer).setUint32(0, index, false); // big-endian

  const combined = new Uint8Array(padding.length + principalBytes.length + indexBytes.length);
  combined.set(padding, 0);
  combined.set(principalBytes, padding.length);
  combined.set(indexBytes, padding.length + principalBytes.length);

  return Principal.fromUint8Array(combined).toText();
}

// ICPunks uses /Token/{index} (redirects to cache CDN).
// Most other EXT canisters use ?tokenid= and return /Token/ as plain text.
const ICPUNKS_CANISTER = 'qcg3w-tyaaa-aaaah-qakea-cai';

/**
 * Get all possible image URLs for an EXT token, ordered by likelihood.
 * Different collections use different HTTP endpoints for images.
 */
export function getExtImageUrls(canisterId: string, index: number): string[] {
  const tokenId = makeExtTokenId(canisterId, index);
  if (canisterId === ICPUNKS_CANISTER) {
    // ICPunks: /Token/{index} redirects to CDN cache; ?tokenid= redirects to broken URL
    return [
      `https://${canisterId}.raw.ic0.app/Token/${index}`,
      `https://${canisterId}.raw.ic0.app/?type=thumbnail&tokenid=${tokenId}`,
    ];
  }
  // All other EXT collections: ?tokenid= returns actual images; /Token/ returns text
  return [
    `https://${canisterId}.raw.ic0.app/?tokenid=${tokenId}`,
    `https://${canisterId}.raw.ic0.app/?type=thumbnail&tokenid=${tokenId}`,
    `https://${canisterId}.raw.ic0.app/Token/${index}`,
  ];
}

/**
 * EXT standard adapter.
 * Uses the standard /?tokenid= query parameter as primary, with fallbacks handled by UI.
 */
export async function fetchExtTokens(
  collection: CollectionEntry,
  page: number,
  pageSize: number
): Promise<{ items: GalleryItem[]; hasMore: boolean; total: number }> {
  const totalSupply = collection.totalSupply || 0;
  const startIndex = page * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalSupply);

  if (startIndex >= totalSupply) {
    return { items: [], hasMore: false, total: totalSupply };
  }

  const items: GalleryItem[] = [];
  for (let i = startIndex; i < endIndex; i++) {
    // Use the first (best) URL from getExtImageUrls for the primary image
    const urls = getExtImageUrls(collection.canisterId, i);
    items.push({
      id: i,
      name: `${collection.name} #${i}`,
      description: '',
      image: urls[0],
      owner: '',
      mintedAt: 0,
      traits: [],
      collectionId: collection.id,
    });
  }

  return {
    items,
    hasMore: endIndex < totalSupply,
    total: totalSupply,
  };
}
