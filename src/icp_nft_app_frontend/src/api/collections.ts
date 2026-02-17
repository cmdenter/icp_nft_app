import type { CollectionEntry, CreatorInfo } from '../types';
import { getExtImageUrls } from './ext';

const LOCAL_HOST = 'http://127.0.0.1:4943';
const MAINNET_HOST = 'https://ic0.app';

declare const process: { env: Record<string, string | undefined> };

function getLocalCanisterId(): string {
  try {
    return process.env.CANISTER_ID_NFT || '';
  } catch {
    return '';
  }
}

/** Build the best direct image URL for an EXT collection */
function extImageUrl(canisterId: string, index: number): string {
  return getExtImageUrls(canisterId, index)[0];
}

export const COLLECTIONS: CollectionEntry[] = [
  {
    id: 'local',
    name: 'ICP Speed NFTs',
    canisterId: getLocalCanisterId(),
    standard: 'local',
    isLocal: true,
    host: LOCAL_HOST,
    image: '',
    description: 'High-performance NFTs on the Internet Computer.',
    verified: true,
  },
  {
    id: 'icpunks',
    name: 'ICPunks',
    canisterId: 'qcg3w-tyaaa-aaaah-qakea-cai',
    standard: 'ext',
    isLocal: false,
    host: MAINNET_HOST,
    image: extImageUrl('qcg3w-tyaaa-aaaah-qakea-cai', 1),
    banner: extImageUrl('qcg3w-tyaaa-aaaah-qakea-cai', 42),
    description: '10,000 uniquely generated pixel art characters living as NFTs on the Internet Computer. Each ICPunk is algorithmically created with distinct attributes including hairstyles, accessories, and expressions — making every one truly one-of-a-kind.',
    verified: true,
    totalSupply: 10000,
    floorPrice: 2.5,
    category: 'pfps',
    website: 'https://icpunks.com',
    twitter: 'ICPunks',
    discord: 'https://discord.gg/icpunks',
    launchDate: '2021-08-06',
    royaltyPercent: 2,
    creator: {
      id: 'icpunks-team',
      name: 'ICPunks Team',
      avatar: extImageUrl('qcg3w-tyaaa-aaaah-qakea-cai', 0),
      bio: 'Pioneers of NFTs on the Internet Computer. Building pixel art culture on ICP since day one.',
      website: 'https://icpunks.com',
      twitter: 'ICPunks',
      discord: 'https://discord.gg/icpunks',
    },
  },
  {
    id: 'motoko-ghosts',
    name: 'Motoko Ghosts',
    canisterId: 'oeee4-qaaaa-aaaak-qaaeq-cai',
    standard: 'ext',
    isLocal: false,
    host: MAINNET_HOST,
    image: extImageUrl('oeee4-qaaaa-aaaak-qaaeq-cai', 1),
    banner: extImageUrl('oeee4-qaaaa-aaaak-qaaeq-cai', 100),
    description: '2,048 hand-drawn ghost NFTs inspired by the Motoko programming language. Each ghost features unique traits and expressions, celebrating the creative spirit of the Internet Computer developer community.',
    verified: true,
    totalSupply: 2048,
    floorPrice: 0.8,
    category: 'art',
    twitter: 'MotokoGhosts',
    launchDate: '2021-10-15',
    royaltyPercent: 5,
    creator: {
      id: 'motoko-ghosts-studio',
      name: 'Motoko Ghosts Studio',
      avatar: extImageUrl('oeee4-qaaaa-aaaak-qaaeq-cai', 0),
      bio: 'Digital artists creating ghost-themed collectibles on the Internet Computer.',
      twitter: 'MotokoGhosts',
    },
  },
  {
    id: 'cronic-critters',
    name: 'Cronic Critters',
    canisterId: 'e3izy-jiaaa-aaaah-qacbq-cai',
    standard: 'ext',
    isLocal: false,
    host: MAINNET_HOST,
    image: extImageUrl('e3izy-jiaaa-aaaah-qacbq-cai', 1),
    banner: extImageUrl('e3izy-jiaaa-aaaah-qacbq-cai', 50),
    description: '2,000 collectible critters from the Cronics play-to-earn gaming universe on the Internet Computer. Battle, trade, and evolve your Cronic in an on-chain gaming ecosystem.',
    verified: true,
    totalSupply: 2000,
    floorPrice: 0.15,
    category: 'gaming',
    website: 'https://crfrm.gg',
    twitter: 'CronicsCRFRM',
    discord: 'https://discord.gg/cronics',
    launchDate: '2021-09-01',
    royaltyPercent: 3,
    creator: {
      id: 'toniq-labs',
      name: 'Toniq Labs',
      avatar: extImageUrl('e3izy-jiaaa-aaaah-qacbq-cai', 0),
      bio: 'Building the infrastructure for NFTs and gaming on the Internet Computer. Creators of Entrepot marketplace and the EXT token standard.',
      website: 'https://toniq.io',
      twitter: 'AviateInc',
      github: 'https://github.com/AviateInc',
    },
  },
];

export function getCollection(id: string): CollectionEntry | undefined {
  return COLLECTIONS.find((c) => c.id === id);
}

export function getCollectionByCanister(canisterId: string): CollectionEntry | undefined {
  return COLLECTIONS.find((c) => c.canisterId === canisterId);
}

export function getCreator(creatorId: string): CreatorInfo | undefined {
  for (const c of COLLECTIONS) {
    if (c.creator?.id === creatorId) return c.creator;
  }
  return undefined;
}

export function getCollectionsByCreator(creatorId: string): CollectionEntry[] {
  return COLLECTIONS.filter((c) => c.creator?.id === creatorId);
}

/** Get image URLs for a creator's avatar — falls back to their first collection's NFT */
export function getCreatorAvatarUrls(creatorId: string): string[] {
  const creator = getCreator(creatorId);
  if (creator?.avatar) return [creator.avatar];
  const cols = getCollectionsByCreator(creatorId);
  const ext = cols.find((c) => c.standard === 'ext');
  if (ext) return getExtImageUrls(ext.canisterId, 0);
  const anyExt = COLLECTIONS.find((c) => c.standard === 'ext');
  if (anyExt) return getExtImageUrls(anyExt.canisterId, 1);
  return [];
}

/** Get image URLs for a collection's avatar — never empty */
export function getCollectionImageUrls(collection: CollectionEntry): string[] {
  if (collection.image) return [collection.image];
  if (collection.standard === 'ext') return getExtImageUrls(collection.canisterId, 0);
  const ext = COLLECTIONS.find((c) => c.standard === 'ext');
  if (ext) return getExtImageUrls(ext.canisterId, 1);
  return [];
}

/** Get image URLs for a collection's banner — never empty */
export function getCollectionBannerUrls(collection: CollectionEntry): string[] {
  if (collection.banner) return [collection.banner];
  if (collection.image) return [collection.image];
  if (collection.standard === 'ext') return getExtImageUrls(collection.canisterId, 42);
  const ext = COLLECTIONS.find((c) => c.standard === 'ext');
  if (ext) return getExtImageUrls(ext.canisterId, 42);
  return [];
}
