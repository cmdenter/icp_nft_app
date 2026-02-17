import { Actor, HttpAgent } from '@dfinity/agent';
import type { CollectionEntry, GalleryItem, Trait } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const icrc7IdlFactory: any = ({ IDL: T }: { IDL: any }) => {
  const Value = T.Rec();
  Value.fill(
    T.Variant({
      Nat: T.Nat,
      Int: T.Int,
      Text: T.Text,
      Blob: T.Vec(T.Nat8),
      Array: T.Vec(Value),
      Map: T.Vec(T.Tuple(T.Text, Value)),
    })
  );

  const Account = T.Record({
    owner: T.Principal,
    subaccount: T.Opt(T.Vec(T.Nat8)),
  });

  return T.Service({
    icrc7_name: T.Func([], [T.Text], ['query']),
    icrc7_symbol: T.Func([], [T.Text], ['query']),
    icrc7_total_supply: T.Func([], [T.Nat], ['query']),
    icrc7_tokens: T.Func(
      [T.Opt(T.Nat), T.Opt(T.Nat)],
      [T.Vec(T.Nat)],
      ['query']
    ),
    icrc7_token_metadata: T.Func(
      [T.Vec(T.Nat)],
      [T.Vec(T.Opt(T.Vec(T.Tuple(T.Text, Value))))],
      ['query']
    ),
    icrc7_owner_of: T.Func(
      [T.Vec(T.Nat)],
      [T.Vec(T.Opt(Account))],
      ['query']
    ),
  });
};

const agentCache = new Map<string, HttpAgent>();

function getAgentForHost(host: string): HttpAgent {
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

function createIcrc7Actor(collection: CollectionEntry) {
  const agent = getAgentForHost(collection.host);
  return Actor.createActor(icrc7IdlFactory, {
    agent,
    canisterId: collection.canisterId,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseMetadata(tokenId: number, metadata: [string, any][] | null, collectionId: string): GalleryItem | null {
  if (!metadata) return null;

  let name = `#${tokenId}`;
  let description = '';
  let image = '';
  const traits: Trait[] = [];

  for (const [key, value] of metadata) {
    const textVal = value?.Text;
    if (key === 'icrc7:name' || key === 'name') name = textVal || name;
    else if (key === 'icrc7:description' || key === 'description') description = textVal || '';
    else if (key === 'icrc7:image' || key === 'image') image = textVal || '';
    else if (key === 'icrc7:metadata' && value?.Map) {
      for (const [traitKey, traitVal] of value.Map) {
        traits.push({ category: traitKey, value: traitVal?.Text || String(traitVal?.Nat || '') });
      }
    } else if (!key.startsWith('icrc7:') && textVal) {
      traits.push({ category: key, value: textVal });
    }
  }

  return { id: tokenId, name, description, image, owner: '', mintedAt: 0, traits, collectionId };
}

export async function fetchIcrc7Tokens(
  collection: CollectionEntry,
  prev: number | null,
  take: number
): Promise<{ items: GalleryItem[]; hasMore: boolean }> {
  const actor = createIcrc7Actor(collection);

  const tokenIds = (await actor.icrc7_tokens(
    prev !== null ? [BigInt(prev)] : [],
    [BigInt(take + 1)]
  )) as bigint[];

  const hasMore = tokenIds.length > take;
  const pageIds = hasMore ? tokenIds.slice(0, take) : tokenIds;
  if (pageIds.length === 0) return { items: [], hasMore: false };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [metadataResults, ownerResults] = (await Promise.all([
    actor.icrc7_token_metadata(pageIds),
    actor.icrc7_owner_of(pageIds),
  ])) as [any[], any[]];

  const items: GalleryItem[] = [];
  for (let i = 0; i < pageIds.length; i++) {
    const tokenId = Number(pageIds[i]);
    const metadata = metadataResults[i]?.[0] || null;
    const owner = ownerResults[i]?.[0];
    const item = parseMetadata(tokenId, metadata, collection.id);
    if (item) {
      if (owner) item.owner = owner.owner.toText();
      items.push(item);
    }
  }

  return { items, hasMore };
}

export async function fetchIcrc7Supply(collection: CollectionEntry): Promise<number> {
  const actor = createIcrc7Actor(collection);
  const supply = await actor.icrc7_total_supply();
  return Number(supply);
}
