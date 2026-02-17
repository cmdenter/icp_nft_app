import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useNotificationStore } from '../../store/notificationStore';
import { SafeImg } from '../SafeImg';
import { TrashIcon, CartIcon, HeartIcon } from '../icons';

export const Watchlist: React.FC = () => {
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const addToCart = useCartStore((s) => s.addItem);
  const isInCart = useCartStore((s) => s.isInCart);
  const showToast = useNotificationStore((s) => s.showToast);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-os-border bg-os-surface p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-os-secondary/10 flex items-center justify-center mx-auto mb-4">
          <HeartIcon size={28} className="text-os-secondary" />
        </div>
        <p className="text-lg font-semibold text-white mb-2">Watchlist is empty</p>
        <p className="text-sm text-os-text-secondary mb-6">Click the heart icon on any NFT to save it here.</p>
        <Link to="/" className="btn btn-md btn-primary inline-flex">Browse NFTs</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Watchlist ({items.length})</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => {
          const inCart = isInCart(item.collectionId, item.tokenIndex);
          return (
            <div
              key={`${item.collectionId}-${item.tokenIndex}`}
              className="rounded-2xl border border-os-border bg-os-surface overflow-hidden card-hover-glow"
            >
              <Link
                to={`/collection/${item.collectionId}/nft/${item.tokenIndex}`}
                className="block"
              >
                <div className="aspect-square bg-os-card overflow-hidden">
                  <SafeImg
                    src={item.image}
                    alt={item.name}
                    fallback={item.name[0] || '?'}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
              <div className="p-3.5">
                <Link
                  to={`/collection/${item.collectionId}`}
                  className="text-[11px] text-os-primary font-semibold hover:underline"
                >
                  {item.collectionName}
                </Link>
                <p className="font-bold text-white text-sm truncate mt-0.5">{item.name}</p>
                {item.price != null && (
                  <p className="text-sm text-os-text-secondary mt-1">{item.price.toFixed(2)} ICP</p>
                )}

                <div className="flex gap-2 mt-3">
                  {item.price != null && (
                    <button
                      onClick={() => {
                        if (inCart) return;
                        addToCart({
                          collectionId: item.collectionId,
                          tokenIndex: item.tokenIndex,
                          name: item.name,
                          image: item.image,
                          collectionName: item.collectionName,
                          price: item.price!,
                          seller: '',
                          addedAt: Date.now(),
                        });
                        showToast({ type: 'success', title: 'Added to cart', message: item.name });
                      }}
                      disabled={inCart}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-os-primary hover:bg-os-primary-hover disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition-colors text-xs btn-press"
                    >
                      <CartIcon size={14} />
                      {inCart ? 'In Cart' : 'Add to Cart'}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      removeItem(item.collectionId, item.tokenIndex);
                      showToast({ type: 'info', title: 'Removed from watchlist' });
                    }}
                    className="w-9 h-9 rounded-lg bg-os-card hover:bg-os-secondary/10 hover:text-os-secondary flex items-center justify-center text-os-text-secondary transition-colors shrink-0"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
