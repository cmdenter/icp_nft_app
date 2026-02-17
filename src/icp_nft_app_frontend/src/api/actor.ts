import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import type { Trait } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const idlFactory: any = ({ IDL: T }: { IDL: any }) => {
  const TraitRecord = T.Record({ category: T.Text, value: T.Text });
  return T.Service({
    mint: T.Func(
      [T.Principal, T.Text, T.Text, T.Text, T.Vec(TraitRecord)],
      [T.Nat],
      []
    ),
    transfer: T.Func(
      [T.Nat, T.Principal],
      [T.Bool],
      []
    ),
    rebuildAllViews: T.Func([], [], []),
  });
};

let agent: HttpAgent | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let nftActor: any = null;

declare const process: { env: Record<string, string | undefined> };

function getCanisterId(): string {
  try {
    return process.env.CANISTER_ID_NFT || '';
  } catch {
    return '';
  }
}

export function getAgent(): HttpAgent {
  if (!agent) {
    agent = new HttpAgent({ host: 'http://127.0.0.1:4943' });
    agent.fetchRootKey().catch(console.error);
  }
  return agent;
}

export function getNftActor() {
  if (!nftActor) {
    const canisterId = getCanisterId();
    if (!canisterId) throw new Error('CANISTER_ID_NFT not set');
    nftActor = Actor.createActor(idlFactory, {
      agent: getAgent(),
      canisterId,
    });
  }
  return nftActor;
}

export async function mintNFT(
  to: string,
  name: string,
  description: string,
  image: string,
  traits: Trait[]
): Promise<number> {
  const actor = getNftActor();
  const principal = Principal.fromText(to);
  const result = await actor.mint(principal, name, description, image, traits);
  return Number(result);
}

export async function transferNFT(
  tokenId: number,
  to: string
): Promise<boolean> {
  const actor = getNftActor();
  const principal = Principal.fromText(to);
  return await actor.transfer(BigInt(tokenId), principal);
}

export { Principal };
