import React, { useMemo } from 'react';
import { CollectionCarousel } from './CollectionCarousel';
import { COLLECTIONS } from '../api/collections';
import { useNFTStore } from '../store/nftStore';
import { usePurchaseHistoryStore } from '../store/purchaseHistoryStore';
import type { GalleryItem } from '../types';

interface RecommendationsProps {
  type: 'also-bought' | 'popular-in-category';
  currentCollectionId?: string;
  currentTokenIndex?: number;
  category?: string;
}

export const Recommendations: React.FC<RecommendationsProps> = ({
  type,
  currentCollectionId,
  currentTokenIndex,
  category,
}) => {
  const externalItems = useNFTStore((s) => s.externalItems);
  const purchases = usePurchaseHistoryStore((s) => s.purchases);

  const result = useMemo(() => {
    if (type === 'also-bought') {
      // Get unique collection IDs from user's purchase history
      const purchasedCollectionIds = new Set(
        purchases
          .filter((p) => p.status === 'success')
          .map((p) => p.collectionId)
      );

      // Collect items from those collections, excluding the current item
      const items: GalleryItem[] = [];
      for (const collId of purchasedCollectionIds) {
        const collItems = externalItems.get(collId);
        if (!collItems) continue;

        for (const item of collItems) {
          // Exclude the current item
          if (
            collId === currentCollectionId &&
            item.id === currentTokenIndex
          ) {
            continue;
          }
          items.push(item);
        }
      }

      return {
        title: 'Customers Also Bought',
        items: items.slice(0, 20),
      };
    }

    if (type === 'popular-in-category') {
      if (!category) return { title: '', items: [] };

      // Format category name for display
      const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

      // Find collections in the same category, excluding the current collection
      const matchingCollections = COLLECTIONS.filter(
        (c) => c.category === category && c.id !== currentCollectionId && !c.isLocal
      );

      // Pull items from those collections
      const items: GalleryItem[] = [];
      for (const col of matchingCollections) {
        const collItems = externalItems.get(col.id);
        if (!collItems) continue;
        items.push(...collItems);
      }

      return {
        title: `Popular in ${categoryLabel}`,
        items: items.slice(0, 20),
      };
    }

    return { title: '', items: [] };
  }, [type, purchases, externalItems, currentCollectionId, currentTokenIndex, category]);

  if (result.items.length === 0) return null;

  return (
    <CollectionCarousel
      title={result.title}
      items={result.items}
      showViewAll={false}
    />
  );
};
