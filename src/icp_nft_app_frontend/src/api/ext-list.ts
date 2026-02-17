import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import type { CollectionEntry } from '../types';
import { isPlugAvailable } from './plug-wallet';

/**
 * EXT standard: query ownership + list/delist NFTs.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extOwnerIdlFactory = ({ IDL }: { IDL: any }) => {
  const AccountIdentifier = IDL.Text;
  const TokenIndex = IDL.Nat32;
  const CommonError = IDL.Variant({
    InvalidToken: IDL.Text,
    Other: IDL.Text,
  });
  return IDL.Service({
    tokens: IDL.Func(
      [AccountIdentifier],
      [IDL.Variant({ ok: IDL.Vec(TokenIndex), err: CommonError })],
      ['query']
    ),
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extListIdlFactory = ({ IDL }: { IDL: any }) => {
  const TokenIdentifier = IDL.Text;
  const CommonError = IDL.Variant({
    InvalidToken: TokenIdentifier,
    Other: IDL.Text,
  });
  const ListRequest = IDL.Record({
    token: TokenIdentifier,
    from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    price: IDL.Opt(IDL.Nat64),
  });
  return IDL.Service({
    list: IDL.Func(
      [ListRequest],
      [IDL.Variant({ ok: IDL.Null, err: CommonError })],
      []
    ),
  });
};

function makeExtTokenId(canisterId: string, index: number): string {
  const padding = new Uint8Array([10, 116, 105, 100]);
  const principalBytes = Principal.fromText(canisterId).toUint8Array();
  const indexBytes = new Uint8Array(4);
  new DataView(indexBytes.buffer).setUint32(0, index, false);
  const combined = new Uint8Array(padding.length + principalBytes.length + indexBytes.length);
  combined.set(padding, 0);
  combined.set(principalBytes, padding.length);
  combined.set(indexBytes, padding.length + principalBytes.length);
  return Principal.fromUint8Array(combined).toText();
}

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

/**
 * Query which token indices are owned by an account in an EXT collection.
 * Uses anonymous agent (read-only query).
 */
export async function fetchOwnedTokens(
  collection: CollectionEntry,
  accountId: string
): Promise<number[]> {
  try {
    const agent = getAgent(collection.host);
    const actor = Actor.createActor(extOwnerIdlFactory, {
      agent,
      canisterId: collection.canisterId,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await actor.tokens(accountId);
    if ('ok' in result) {
      return Array.from(result.ok as number[]).sort((a, b) => a - b);
    }
    return [];
  } catch (err) {
    console.warn(`Failed to fetch owned tokens for ${collection.id}:`, err);
    return [];
  }
}

export interface ListResult {
  success: boolean;
  error?: string;
}

/**
 * List an EXT NFT for sale via Plug wallet.
 * Calls the canister's `list` function with the token and price.
 */
export async function listExtNFT(
  collection: CollectionEntry,
  tokenIndex: number,
  priceICP: number
): Promise<ListResult> {
  if (!isPlugAvailable() || !window.ic?.plug) {
    return { success: false, error: 'Plug wallet not available' };
  }

  const tokenId = makeExtTokenId(collection.canisterId, tokenIndex);
  const priceE8s = Math.round(priceICP * 1e8);

  try {
    const actor = await window.ic.plug.createActor({
      canisterId: collection.canisterId,
      interfaceFactory: extListIdlFactory,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await actor.list({
      token: tokenId,
      from_subaccount: [],
      price: [BigInt(priceE8s)],
    });

    if ('ok' in result) {
      return { success: true };
    }
    const msg = 'Other' in result.err ? result.err.Other : 'Listing failed';
    return { success: false, error: msg };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Listing failed' };
  }
}

/**
 * Delist (remove from sale) an EXT NFT via Plug wallet.
 * Calls `list` with price = null.
 */
export async function delistExtNFT(
  collection: CollectionEntry,
  tokenIndex: number
): Promise<ListResult> {
  if (!isPlugAvailable() || !window.ic?.plug) {
    return { success: false, error: 'Plug wallet not available' };
  }

  const tokenId = makeExtTokenId(collection.canisterId, tokenIndex);

  try {
    const actor = await window.ic.plug.createActor({
      canisterId: collection.canisterId,
      interfaceFactory: extListIdlFactory,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await actor.list({
      token: tokenId,
      from_subaccount: [],
      price: [],
    });

    if ('ok' in result) {
      return { success: true };
    }
    const msg = 'Other' in result.err ? result.err.Other : 'Delisting failed';
    return { success: false, error: msg };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Delisting failed' };
  }
}
