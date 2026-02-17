import React, { useMemo } from 'react';
import { TokenCarousel } from './TokenCarousel';
import { TOKEN_CATEGORY_DEFS } from '../api/tokens';
import { useLiveTokens, useRelatedTokens } from '../hooks/useTokenData';
import type { TokenCategory, TokenEntry } from '../types';

interface TokenRecommendationsProps {
  type: 'also-viewed' | 'top-rated' | 'new-releases';
  currentTokenId: string;
  category?: TokenCategory;
}

export const TokenRecommendations: React.FC<TokenRecommendationsProps> = ({
  type,
  currentTokenId,
  category,
}) => {
  const allTokens = useLiveTokens();
  const related = useRelatedTokens(currentTokenId);

  const { title, tokens } = useMemo(() => {
    if (type === 'also-viewed') {
      const categoryTokens: TokenEntry[] = category
        ? allTokens.filter((t) => t.category === category)
        : [];

      // Merge + deduplicate, excluding current token
      const seen = new Set<string>();
      const merged: TokenEntry[] = [];
      for (const t of [...categoryTokens, ...related]) {
        if (t.id === currentTokenId || seen.has(t.id)) continue;
        seen.add(t.id);
        merged.push(t);
      }

      return {
        title: 'Customers Who Viewed This Also Viewed',
        tokens: merged,
      };
    }

    if (type === 'top-rated') {
      const catDef = TOKEN_CATEGORY_DEFS.find((c) => c.id === category);
      const categoryName = catDef?.name ?? 'Tokens';

      const sorted = allTokens
        .filter((t) => t.id !== currentTokenId)
        .sort((a, b) => (b.volume24h ?? 0) - (a.volume24h ?? 0));

      return {
        title: `Top Rated in ${categoryName}`,
        tokens: sorted,
      };
    }

    // new-releases
    const withLaunch = allTokens
      .filter((t) => t.id !== currentTokenId && t.launchDate)
      .sort((a, b) => {
        const da = a.launchDate ?? '';
        const db = b.launchDate ?? '';
        return db.localeCompare(da);
      });

    return {
      title: 'New Releases',
      tokens: withLaunch,
    };
  }, [type, currentTokenId, category, allTokens, related]);

  if (tokens.length === 0) return null;

  return (
    <TokenCarousel
      title={title}
      tokens={tokens}
      showViewAll
      viewAllLink="/tokens"
    />
  );
};
