// --- Core data types ---

export interface Trait {
  category: string;
  value: string;
}

export interface TraitWithRarity extends Trait {
  count: number;
  percentage: number;
}

export interface TraitValueStat {
  value: string;
  count: number;
}

export interface TraitCategoryStat {
  category: string;
  values: TraitValueStat[];
}

export interface GalleryItem {
  id: number;
  name: string;
  description: string;
  image: string;
  owner: string;
  mintedAt: number;
  traits: Trait[];
  collectionId?: string;
}

export interface GalleryResponse {
  items: GalleryItem[];
  page: number;
  pageSize: number;
  totalSupply: number;
  totalPages: number;
}

export interface TokenDetail {
  id: number;
  name: string;
  description: string;
  image: string;
  owner: string;
  mintedAt: number;
  traits: Trait[];
  collectionId?: string;
}

export interface CollectionStats {
  name: string;
  symbol: string;
  description: string;
  totalSupply: number;
  uniqueOwners: number;
  traits: TraitCategoryStat[];
}

export interface MintArgs {
  name: string;
  description: string;
  image: string;
  traits: Trait[];
}

// --- Activity ---

export interface ActivityEvent {
  eventType: string;
  tokenId: number;
  tokenName: string;
  tokenImage: string;
  from: string;
  to: string;
  timestamp: number;
}

export interface ActivityResponse {
  items: ActivityEvent[];
  page: number;
  totalEvents: number;
  totalPages: number;
}

// --- Search ---

export interface SearchResponse {
  items: GalleryItem[];
  page: number;
  totalResults: number;
  totalPages: number;
}

// --- UI state types ---

export type GridDensity = 'small' | 'medium' | 'large';

export type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'id-asc' | 'id-desc';

export type CollectionTab = 'items' | 'activity';

export interface TraitFilter {
  category: string;
  value: string;
}

// --- Collection registry ---

export type CollectionStandard = 'icrc7' | 'ext' | 'local';

export type NFTCategory = 'art' | 'pfps' | 'gaming' | 'collectibles' | 'music';

export type SearchScope = 'all' | 'collections' | 'nfts' | 'creators' | 'tokens';

export type ExtCollectionTab = 'items' | 'activity' | 'analytics' | 'chat';

export interface CreatorInfo {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  website?: string;
  twitter?: string;
  discord?: string;
  github?: string;
}

export interface ExtCollectionStats {
  totalVolume: number;
  salesCount: number;
  averagePrice: number;
  floorPrice: number;
  listedCount: number;
  listedPercent: number;
  uniqueSellers: number;
  uniqueBuyers: number;
  highestSale: number;
  last24hVolume: number;
  last24hSales: number;
  priceChange24h: number;
}

export interface CollectionEntry {
  id: string;
  name: string;
  canisterId: string;
  standard: CollectionStandard;
  isLocal: boolean;
  host: string;
  image: string;
  banner?: string;
  description: string;
  verified: boolean;
  totalSupply?: number;
  floorPrice?: number;
  category?: NFTCategory;
  creator?: CreatorInfo;
  website?: string;
  twitter?: string;
  discord?: string;
  launchDate?: string;
  royaltyPercent?: number;
}

// --- Creator Dashboard ---

export type CreatorDashboardTab = 'overview' | 'collections' | 'listings' | 'analytics' | 'payouts' | 'settings';

export interface CreatorAnnouncement {
  id: string;
  text: string;
  createdAt: number;
}

export interface CreatorPayout {
  id: string;
  creatorId: string;
  amount: number;
  date: number;
  status: 'completed' | 'pending' | 'processing';
  txHash?: string;
}

// --- Token Marketplace ---

export type TokenCategory = 'layer-1' | 'wrapped' | 'sns-dao' | 'defi' | 'gaming' | 'infrastructure' | 'ai' | 'entertainment' | 'meme' | 'rwa';

export interface TokenEntry {
  id: string;
  name: string;
  symbol: string;
  canisterId: string;
  standard: 'ICRC-1' | 'ICRC-2';
  logo: string;
  banner?: string;
  description: string;
  category: TokenCategory;
  website?: string;
  twitter?: string;
  discord?: string;
  github?: string;
  whitepaper?: string;
  launchDate?: string;
  verified: boolean;
  totalSupply?: number;
  circulatingSupply?: number;
  maxSupply?: number;
  price: number;
  priceICP: number;
  marketCap?: number;
  volume24h?: number;
  change24h?: number;
  allTimeHigh?: number;
  allTimeLow?: number;
  bulletPoints: string[];
  tokenomicsDescription?: string;
  useCases: string[];
  team?: { name: string; role: string }[];
  relatedTokenIds?: string[];
}

export interface RecentlyViewedToken {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  viewedAt: number;
}

export interface RecentlyViewedItem {
  id: number;
  name: string;
  image: string;
  collectionId?: string;
  collectionName?: string;
  viewedAt: number;
}
