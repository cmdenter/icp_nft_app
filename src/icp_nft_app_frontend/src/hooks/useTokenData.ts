import { useMemo } from 'react';
import { useTokenStore } from '../store/tokenStore';
import type { TokenEntry, TokenCategory } from '../types';

const FEATURED_IDS = ['icp', 'ckbtc', 'kong', 'chat'];

export function useLiveToken(id: string): TokenEntry | undefined {
  return useTokenStore((s) => s.liveTokensMap[id]);
}

export function useLiveTokens(): TokenEntry[] {
  return useTokenStore((s) => s.liveTokens);
}

export function useFeaturedTokens(): TokenEntry[] {
  const liveTokens = useTokenStore((s) => s.liveTokens);
  return useMemo(
    () => liveTokens.filter((t) => FEATURED_IDS.includes(t.id)),
    [liveTokens],
  );
}

export function useTokensByCategory(cat: TokenCategory): TokenEntry[] {
  const liveTokens = useTokenStore((s) => s.liveTokens);
  return useMemo(
    () => liveTokens.filter((t) => t.category === cat),
    [liveTokens, cat],
  );
}

export function useRelatedTokens(id: string): TokenEntry[] {
  const liveTokensMap = useTokenStore((s) => s.liveTokensMap);
  return useMemo(() => {
    const token = liveTokensMap[id];
    if (!token?.relatedTokenIds) return [];
    return token.relatedTokenIds
      .map((rid) => liveTokensMap[rid])
      .filter((t): t is TokenEntry => t != null);
  }, [liveTokensMap, id]);
}

export function usePricesLoaded(): boolean {
  return useTokenStore((s) => s.pricesLoaded);
}
