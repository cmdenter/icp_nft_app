import React from 'react';
import { VerifiedIcon } from './icons';
import type { CollectionEntry, GalleryItem } from '../types';

interface ProductBulletPointsProps {
  collection: CollectionEntry;
  token: GalleryItem;
  listing?: { price: number; seller: string };
  isOwner: boolean;
}

export const ProductBulletPoints: React.FC<ProductBulletPointsProps> = ({
  collection,
  token,
  listing,
  isOwner,
}) => {
  const standardLabel = collection.standard === 'ext' ? 'EXT' : collection.standard === 'icrc7' ? 'ICRC-7' : collection.standard.toUpperCase();

  return (
    <ul className="list-disc list-inside space-y-1.5 text-sm text-os-text-secondary">
      <li>
        Collection:{' '}
        <span className="text-white font-medium inline-flex items-center gap-1">
          {collection.name}
          {collection.verified && <VerifiedIcon size={13} />}
        </span>
      </li>
      <li>
        Token Standard: <span className="text-white font-medium">{standardLabel}</span>
      </li>
      <li>
        Network: <span className="text-white font-medium">Internet Computer (Mainnet)</span>
      </li>
      {collection.totalSupply && (
        <li>
          Total Supply: <span className="text-white font-medium">{collection.totalSupply.toLocaleString()} items</span>
        </li>
      )}
      {token.traits && token.traits.length > 0 && (
        <li>
          Traits: <span className="text-white font-medium">{token.traits.length} properties</span>
        </li>
      )}
      <li>
        Status:{' '}
        {isOwner ? (
          <span className="text-os-green font-medium">You own this NFT</span>
        ) : listing ? (
          <span className="text-os-green font-medium">Listed for {listing.price.toFixed(2)} ICP</span>
        ) : (
          <span className="text-os-text-secondary font-medium">Not currently listed</span>
        )}
      </li>
    </ul>
  );
};
