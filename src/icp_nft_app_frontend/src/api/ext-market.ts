import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import type { CollectionEntry } from '../types';

/**
 * EXT standard marketplace queries.
 * Fetches listings (items for sale) and transaction history from EXT canisters.
 */

export interface ExtListing {
  seller: string;
  price: number; // ICP
  locked: boolean;
}

export interface ExtTransaction {
  tokenIndex: number;
  seller: string;
  buyer: string;
  price: number; // ICP
  time: number; // ms timestamp
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extMarketIdlFactory: any = ({ IDL }: { IDL: any }) => {
  const TokenIndex = IDL.Nat32;
  const Listing = IDL.Record({
    locked: IDL.Opt(IDL.Int),
    seller: IDL.Principal,
    price: IDL.Nat64,
  });
  const Transaction = IDL.Record({
    token: IDL.Text,
    seller: IDL.Principal,
    buyer: IDL.Principal,
    price: IDL.Nat64,
    time: IDL.Int,
  });

  return IDL.Service({
    listings: IDL.Func([], [IDL.Vec(IDL.Tuple(TokenIndex, Listing))], ['query']),
    transactions: IDL.Func([], [IDL.Vec(Transaction)], ['query']),
  });
};

const agentCache = new Map<string, HttpAgent>();

function getAgent(host: string): HttpAgent {
  let agent = agentCache.get(host);
  if (!agent) {
    agent = new HttpAgent({ host });
    if (host.includes('127.0.0.1') || host.includes('localhost')) {
      agent.fetchRootKey().catch(console.error);
    }
    agentCache.set(host, agent);
  }
  return agent;
}

function createExtActor(collection: CollectionEntry) {
  const agent = getAgent(collection.host);
  return Actor.createActor(extMarketIdlFactory, {
    agent,
    canisterId: collection.canisterId,
  });
}

/** Extract token index from an EXT TokenIdentifier string */
function extractTokenIndex(tokenId: string): number | null {
  try {
    const bytes = Principal.fromText(tokenId).toUint8Array();
    if (bytes.length < 8) return null;
    // Last 4 bytes are the big-endian token index
    const view = new DataView(bytes.buffer, bytes.byteOffset + bytes.length - 4, 4);
    return view.getUint32(0, false);
  } catch {
    return null;
  }
}

/**
 * Fetch all current listings (items for sale) from an EXT collection.
 * Returns Map<tokenIndex, listing>.
 */
export async function fetchExtListings(
  collection: CollectionEntry
): Promise<Map<number, ExtListing>> {
  const result = new Map<number, ExtListing>();
  try {
    const actor = createExtActor(collection);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = (await actor.listings()) as [number, any][];
    for (const [index, listing] of raw) {
      result.set(index, {
        seller: listing.seller.toText(),
        price: Number(listing.price) / 1e8,
        locked: listing.locked?.[0] != null,
      });
    }
  } catch (err) {
    console.warn(`Failed to fetch listings for ${collection.id}:`, err);
  }
  return result;
}

/**
 * Fetch transaction history from an EXT collection.
 * Returns most recent transactions (capped at 500 to avoid choking).
 */
export async function fetchExtTransactions(
  collection: CollectionEntry
): Promise<ExtTransaction[]> {
  try {
    const actor = createExtActor(collection);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = (await actor.transactions()) as any[];

    // Take only the most recent 500 to keep things manageable
    const recent = raw.slice(-500);

    return recent.map((tx) => ({
      tokenIndex: extractTokenIndex(tx.token) ?? -1,
      seller: tx.seller.toText(),
      buyer: tx.buyer.toText(),
      price: Number(tx.price) / 1e8,
      time: Number(tx.time) / 1e6, // nanoseconds → ms
    }));
  } catch (err) {
    console.warn(`Failed to fetch transactions for ${collection.id}:`, err);
    return [];
  }
}

/**
 * Get transactions filtered to a specific token index.
 */
export function getTokenTransactions(
  allTransactions: ExtTransaction[],
  tokenIndex: number
): ExtTransaction[] {
  return allTransactions.filter((tx) => tx.tokenIndex === tokenIndex);
}
