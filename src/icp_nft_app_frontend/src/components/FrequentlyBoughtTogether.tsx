import React, { useMemo } from 'react';
import { SafeImg } from './SafeImg';
import { useCartStore } from '../store/cartStore';
import { useNotificationStore } from '../store/notificationStore';
import { getExtImageUrls } from '../api/ext';
import { getCollection } from '../api/collections';
import type { GalleryItem } from '../types';

interface FrequentlyBoughtTogetherProps {
  collectionId: string;
  currentTokenIndex: number;
  listings: Map<number, { price: number; seller: string }>;
  items: GalleryItem[];
}

export const FrequentlyBoughtTogether: React.FC<FrequentlyBoughtTogetherProps> = ({
  collectionId,
  currentTokenIndex,
  listings,
  items,
}) => {
  const addToCart = useCartStore((s) => s.addItem);
  const isInCart = useCartStore((s) => s.isInCart);
  const showToast = useNotificationStore((s) => s.showToast);

  const collection = getCollection(collectionId);

  const otherListed = useMemo(() => {
    return items
      .filter((item) => item.id !== currentTokenIndex && listings.has(item.id))
      .slice(0, 2);
  }, [items, currentTokenIndex, listings]);

  if (otherListed.length < 2) return null;

  const currentListing = listings.get(currentTokenIndex);
  const currentItem = items.find((i) => i.id === currentTokenIndex);

  const bundleItems = [
    ...(currentItem && currentListing ? [{ item: currentItem, listing: currentListing }] : []),
    ...otherListed.map((item) => ({ item, listing: listings.get(item.id)! })),
  ];

  const combinedPrice = bundleItems.reduce((sum, { listing }) => sum + listing.price, 0);

  const getUrls = (tokenIndex: number, image: string) => {
    if (collection && collection.standard === 'ext') {
      return getExtImageUrls(collection.canisterId, tokenIndex);
    }
    return [image];
  };

  const handleAddAll = () => {
    let added = 0;
    for (const { item, listing } of bundleItems) {
      if (!isInCart(collectionId, item.id)) {
        addToCart({
          collectionId,
          tokenIndex: item.id,
          name: item.name,
          image: getUrls(item.id, item.image)[0] || '',
          collectionName: collection?.name || '',
          price: listing.price,
          seller: listing.seller,
          addedAt: Date.now(),
        });
        added++;
      }
    }
    if (added > 0) {
      showToast({ type: 'success', title: `Added ${added} item${added !== 1 ? 's' : ''} to cart` });
    } else {
      showToast({ type: 'info', title: 'All items already in cart' });
    }
  };

  return (
    <div className="bg-os-surface border border-os-border rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {bundleItems.map(({ item, listing }, i) => {
          const urls = getUrls(item.id, item.image);
          return (
            <React.Fragment key={item.id}>
              {i > 0 && (
                <span className="text-2xl text-os-text-secondary font-light">+</span>
              )}
              <div className="flex flex-col items-center gap-1.5 w-[100px]">
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-os-border/40 bg-os-card">
                  <SafeImg
                    urls={urls}
                    alt={item.name}
                    fallback={item.name?.[0] || '#'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-white font-medium truncate w-full text-center">{item.name}</p>
                <p className="text-xs text-os-primary font-semibold">{listing.price.toFixed(2)} ICP</p>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-os-border/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-sm text-os-text-secondary">
          Total: <span className="text-white font-bold text-base">{combinedPrice.toFixed(2)} ICP</span>
        </div>
        <button
          onClick={handleAddAll}
          className="bg-os-primary hover:bg-os-primary-hover text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-os-primary/20 btn-press"
        >
          Add all {bundleItems.length} to Cart
        </button>
      </div>
    </div>
  );
};
