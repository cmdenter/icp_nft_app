import React, { useMemo } from 'react';
import { SafeImg } from './SafeImg';
import { getExtImageUrls } from '../api/ext';
import { getCollection } from '../api/collections';
import type { GalleryItem } from '../types';

interface ComparisonTableProps {
  currentToken: GalleryItem;
  collectionId: string;
  items: GalleryItem[];
  listings: Map<number, { price: number; seller: string }>;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  currentToken,
  collectionId,
  items,
  listings,
}) => {
  const collection = getCollection(collectionId);

  const comparables = useMemo(() => {
    // Prioritize listed items, then unlisted
    const others = items.filter((i) => i.id !== currentToken.id);
    const listed = others.filter((i) => listings.has(i.id));
    const unlisted = others.filter((i) => !listings.has(i.id));
    return [...listed, ...unlisted].slice(0, 3);
  }, [items, currentToken.id, listings]);

  if (comparables.length === 0) return null;

  const allTokens = [currentToken, ...comparables];

  const getUrls = (tokenId: number, image: string) => {
    if (collection && collection.standard === 'ext') {
      return getExtImageUrls(collection.canisterId, tokenId);
    }
    return [image];
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-3 px-3 text-os-text-secondary font-semibold text-xs w-28">Attribute</th>
            {allTokens.map((token, i) => (
              <th
                key={token.id}
                className={`text-center py-3 px-3 min-w-[140px] ${
                  i === 0 ? 'bg-os-primary/10 rounded-t-xl' : ''
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-[60px] h-[60px] rounded-lg overflow-hidden border border-os-border/40 bg-os-card">
                    <SafeImg
                      urls={getUrls(token.id, token.image)}
                      alt={token.name}
                      fallback={token.name?.[0] || '#'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {i === 0 && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-os-primary/20 text-os-primary">
                      This item
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Name */}
          <tr className="border-t border-os-border/20">
            <td className="py-3 px-3 text-os-text-secondary font-medium">Name</td>
            {allTokens.map((token, i) => (
              <td
                key={token.id}
                className={`py-3 px-3 text-center text-white font-medium text-xs ${
                  i === 0 ? 'bg-os-primary/10' : ''
                }`}
              >
                {token.name}
              </td>
            ))}
          </tr>

          {/* Price */}
          <tr className="border-t border-os-border/20">
            <td className="py-3 px-3 text-os-text-secondary font-medium">Price</td>
            {allTokens.map((token, i) => {
              const l = listings.get(token.id);
              return (
                <td
                  key={token.id}
                  className={`py-3 px-3 text-center ${i === 0 ? 'bg-os-primary/10' : ''}`}
                >
                  {l ? (
                    <span className="text-os-green font-semibold">{l.price.toFixed(2)} ICP</span>
                  ) : (
                    <span className="text-os-text-secondary">Not listed</span>
                  )}
                </td>
              );
            })}
          </tr>

          {/* Token ID */}
          <tr className="border-t border-os-border/20">
            <td className="py-3 px-3 text-os-text-secondary font-medium">Token ID</td>
            {allTokens.map((token, i) => (
              <td
                key={token.id}
                className={`py-3 px-3 text-center text-os-primary font-mono text-xs ${
                  i === 0 ? 'bg-os-primary/10' : ''
                }`}
              >
                #{token.id}
              </td>
            ))}
          </tr>

          {/* Traits count */}
          <tr className="border-t border-os-border/20">
            <td className="py-3 px-3 text-os-text-secondary font-medium"># of Traits</td>
            {allTokens.map((token, i) => (
              <td
                key={token.id}
                className={`py-3 px-3 text-center text-white ${
                  i === 0 ? 'bg-os-primary/10' : ''
                }`}
              >
                {token.traits?.length || 0}
              </td>
            ))}
          </tr>

          {/* Status */}
          <tr className="border-t border-os-border/20">
            <td className="py-3 px-3 text-os-text-secondary font-medium">Status</td>
            {allTokens.map((token, i) => {
              const l = listings.get(token.id);
              return (
                <td
                  key={token.id}
                  className={`py-3 px-3 text-center ${
                    i === 0 ? 'bg-os-primary/10 rounded-b-xl' : ''
                  }`}
                >
                  {l ? (
                    <span className="inline-block px-2 py-0.5 rounded bg-os-green/15 text-os-green text-xs font-semibold">
                      For Sale
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded bg-os-card text-os-text-secondary text-xs">
                      Not Listed
                    </span>
                  )}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
