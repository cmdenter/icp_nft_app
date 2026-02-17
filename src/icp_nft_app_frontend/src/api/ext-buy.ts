import { Principal } from '@dfinity/principal';
import type { CollectionEntry } from '../types';
import { principalToAccountId, isPlugAvailable } from './plug-wallet';

/** 1% platform commission on every sale */
const COMMISSION_RATE = 0.01;

/** ICP ledger transfer fee (0.0001 ICP) */
const ICP_TRANSFER_FEE_E8S = 10_000;

// ⚠️ SET YOUR PRINCIPAL HERE to receive 1% commission on marketplace sales.
// Leave empty to skip commission collection.
export const PLATFORM_FEE_PRINCIPAL = '';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extBuyIdlFactory = ({ IDL }: { IDL: any }) => {
  const TokenIdentifier = IDL.Text;
  const AccountIdentifier = IDL.Text;
  const CommonError = IDL.Variant({
    InvalidToken: TokenIdentifier,
    Other: IDL.Text,
  });
  return IDL.Service({
    lock: IDL.Func(
      [TokenIdentifier, IDL.Nat64, AccountIdentifier, IDL.Vec(IDL.Nat8)],
      [IDL.Variant({ ok: IDL.Nat, err: CommonError })],
      []
    ),
    settle: IDL.Func(
      [TokenIdentifier],
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

export interface BuyResult {
  success: boolean;
  error?: string;
}

/**
 * Buy an EXT-standard NFT via Plug wallet.
 * Flow: lock → transfer ICP to canister → settle → transfer commission
 */
export async function buyExtNFT(
  collection: CollectionEntry,
  tokenIndex: number,
  priceICP: number
): Promise<BuyResult> {
  if (!isPlugAvailable() || !window.ic?.plug) {
    return { success: false, error: 'Plug wallet not available' };
  }

  const plug = window.ic.plug;
  const buyerAccountId: string | undefined = plug.accountId;
  if (!buyerAccountId) {
    return { success: false, error: 'Wallet not connected' };
  }

  const tokenId = makeExtTokenId(collection.canisterId, tokenIndex);
  const priceE8s = Math.round(priceICP * 1e8);
  const canisterAccountId = principalToAccountId(collection.canisterId);

  try {
    // 1. Create actor via Plug (signed with user identity)
    const actor = await plug.createActor({
      canisterId: collection.canisterId,
      interfaceFactory: extBuyIdlFactory,
    });

    // 2. Lock the listing
    const lockRes = await actor.lock(tokenId, BigInt(priceE8s), buyerAccountId, []);
    if ('err' in lockRes) {
      const msg = 'Other' in lockRes.err ? lockRes.err.Other : 'Failed to lock token';
      return { success: false, error: msg };
    }

    // 3. Transfer listing price to NFT canister
    const txResult = await plug.requestTransfer({
      to: canisterAccountId,
      amount: priceE8s,
    });
    if (!txResult) {
      return { success: false, error: 'Transfer rejected' };
    }

    // 4. Settle — canister verifies payment and transfers NFT to buyer
    const settleRes = await actor.settle(tokenId);
    if ('err' in settleRes) {
      return {
        success: false,
        error: 'Settlement failed. Your ICP was sent — contact the collection for a refund.',
      };
    }

    // 5. Commission transfer (best-effort, non-blocking)
    if (PLATFORM_FEE_PRINCIPAL) {
      const commissionE8s = Math.round(priceE8s * COMMISSION_RATE);
      if (commissionE8s > ICP_TRANSFER_FEE_E8S) {
        try {
          const platformAccountId = principalToAccountId(PLATFORM_FEE_PRINCIPAL);
          await plug.requestTransfer({ to: platformAccountId, amount: commissionE8s });
        } catch (err) {
          console.warn('Commission transfer failed (non-critical):', err);
        }
      }
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Purchase failed' };
  }
}

/** Compute cost breakdown for the buyer */
export function getBuyCostBreakdown(priceICP: number) {
  const commission = priceICP * COMMISSION_RATE;
  const fees = (ICP_TRANSFER_FEE_E8S * 2) / 1e8;
  return {
    price: priceICP,
    commission: Math.round(commission * 1e4) / 1e4,
    fees: Math.round(fees * 1e4) / 1e4,
    total: Math.round((priceICP + commission + fees) * 1e4) / 1e4,
  };
}
