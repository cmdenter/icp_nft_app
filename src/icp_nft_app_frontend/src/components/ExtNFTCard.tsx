import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCollection } from '../api/collections';
import { getExtImageUrls } from '../api/ext';
import { SafeImg } from './SafeImg';
import { StarRating } from './StarRating';
import { HeartIcon, HeartFilledIcon, CartIcon, ICPTokenIcon } from './icons';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useReviewStore } from '../store/reviewStore';
import { useNotificationStore } from '../store/notificationStore';
import type { GalleryItem } from '../types';
import type { ExtListing } from '../api/ext-market';
import type { Review } from '../store/reviewStore';

interface ExtNFTCardProps {
  item: GalleryItem;
  collectionName: string;
  listing?: ExtListing;
  viewMode?: 'grid' | 'list';
  onImageFailed?: () => void;
}

function truncateAddr(addr: string): string {
  if (addr.length <= 14) return addr;
  return addr.slice(0, 5) + '...' + addr.slice(-4);
}

export const ExtNFTCard: React.FC<ExtNFTCardProps> = ({
  item,
  collectionName,
  listing,
  viewMode = 'grid',
  onImageFailed,
}) => {
  const navigate = useNavigate();
  const collectionId = item.collectionId || '';
  const collection = item.collectionId ? getCollection(item.collectionId) : undefined;
  const fallbackUrls = useMemo(
    () => collection ? getExtImageUrls(collection.canisterId, item.id) : [item.image],
    [collection, item.id, item.image]
  );

  // Stores
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(collectionId, item.id));
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isInCart = useCartStore((s) => s.isInCart(collectionId, item.id));
  const addToCart = useCartStore((s) => s.addItem);
  const showToast = useNotificationStore((s) => s.showToast);
  const allReviews = useReviewStore((s) => s.reviews);
  const { avg: reviewAvg, count: reviewCount } = useMemo(() => {
    const filtered = allReviews.filter((r: Review) => r.collectionId === collectionId && r.tokenIndex === item.id);
    if (!filtered.length) return { avg: 0, count: 0 };
    const sum = filtered.reduce((s, r) => s + r.rating, 0);
    return { avg: sum / filtered.length, count: filtered.length };
  }, [allReviews, collectionId, item.id]);

  const handleClick = () => navigate(`/collection/${collectionId}/nft/${item.id}`);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist({
      collectionId,
      tokenIndex: item.id,
      name: item.name,
      image: item.image,
      collectionName,
      price: listing?.price,
      addedAt: Date.now(),
    });
    showToast({
      type: isWishlisted ? 'info' : 'success',
      title: isWishlisted ? 'Removed from watchlist' : 'Added to watchlist',
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInCart || !listing) return;
    addToCart({
      collectionId,
      tokenIndex: item.id,
      name: item.name,
      image: item.image,
      collectionName,
      price: listing.price,
      seller: listing.seller,
      addedAt: Date.now(),
    });
    showToast({ type: 'success', title: 'Added to cart', message: item.name });
  };

  // ─── List View ───────────────────────────────
  if (viewMode === 'list') {
    return (
      <div
        onClick={handleClick}
        className="group flex gap-4 rounded-xl bg-os-surface border border-os-border/40 p-3 cursor-pointer hover:bg-os-card/60 hover:border-os-primary/20 transition-all duration-250"
      >
        {/* Image */}
        <div className="w-[120px] h-[120px] rounded-lg overflow-hidden shrink-0 bg-os-card">
          <SafeImg
            urls={fallbackUrls}
            alt={item.name}
            fallback={collectionName?.[0] || '#'}
            className="w-full h-full object-cover"
            loading="lazy"
            onAllFailed={onImageFailed}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <p className="text-[11px] text-os-primary font-semibold truncate">{collectionName}</p>
            <p className="text-sm font-bold text-white truncate mt-0.5">{item.name}</p>
            {reviewCount > 0 && (
              <div className="flex items-center gap-1.5 mt-1">
                <StarRating rating={reviewAvg} size={12} />
                <span className="text-[11px] text-os-text-secondary">({reviewCount})</span>
              </div>
            )}
            {listing && (
              <p className="text-[11px] text-os-text-secondary mt-1">
                Sold by: <span className="text-os-primary">{truncateAddr(listing.seller)}</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            {listing ? (
              <div className="flex items-center gap-1.5">
                <ICPTokenIcon size={14} />
                <span className="text-lg font-bold text-white">{listing.price.toFixed(2)}</span>
                <span className="text-xs text-os-text-secondary">ICP</span>
              </div>
            ) : (
              <span className="text-xs text-os-text-secondary">Not listed</span>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleWishlist}
                aria-label="Toggle watchlist"
                className="p-1.5 rounded-lg bg-os-card/60 hover:bg-os-card text-os-text-secondary hover:text-white transition-colors"
              >
                {isWishlisted ? <HeartFilledIcon size={14} className="text-os-secondary" /> : <HeartIcon size={14} />}
              </button>
              {listing && (
                <button
                  onClick={handleAddToCart}
                  disabled={isInCart}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isInCart
                      ? 'bg-os-green/10 text-os-green border border-os-green/30'
                      : 'bg-os-primary hover:bg-os-primary-hover text-white'
                  }`}
                >
                  {isInCart ? 'In Cart' : 'Add to Cart'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Grid View ───────────────────────────────
  return (
    <div
      onClick={handleClick}
      className="card-base group overflow-hidden cursor-pointer hover:-translate-y-1.5"
    >
      {/* Image */}
      <div className="aspect-square bg-os-card overflow-hidden relative">
        <SafeImg
          urls={fallbackUrls}
          alt={item.name}
          fallback={collectionName?.[0] || '#'}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
          loading="lazy"
          onAllFailed={onImageFailed}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250" />

        {/* Listed badge */}
        {listing && (
          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-os-green/30 text-os-green backdrop-blur-sm">
            Listed
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          aria-label="Toggle watchlist"
          className="absolute top-2 right-2 card-quick-actions"
        >
          <div className="bg-os-bg/90 backdrop-blur-md rounded-lg p-1.5">
            {isWishlisted ? (
              <HeartFilledIcon size={14} className="text-os-secondary" />
            ) : (
              <HeartIcon size={14} className="text-white" />
            )}
          </div>
        </button>

        {/* Quick Add to Cart overlay */}
        {listing && (
          <div className="absolute bottom-0 left-0 right-0 card-quick-actions">
            <button
              onClick={handleAddToCart}
              disabled={isInCart}
              className={`w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 backdrop-blur-md ${
                isInCart
                  ? 'bg-os-green/80 text-white'
                  : 'bg-os-primary/90 hover:bg-os-primary text-white'
              }`}
            >
              <CartIcon size={12} />
              {isInCart ? 'In Cart' : 'Add to Cart'}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[11px] text-os-primary font-semibold truncate mb-0.5">{collectionName}</p>
        <p className="text-sm font-bold text-white truncate">{item.name}</p>

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1.5 mt-1">
            <StarRating rating={reviewAvg} size={11} />
            <span className="text-[11px] text-os-text-secondary">({reviewCount})</span>
          </div>
        )}

        {/* Price row */}
        <div className="mt-2.5 pt-2.5 border-t border-os-border/40">
          {listing ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ICPTokenIcon size={14} />
                <span className="text-sm font-bold text-white">{listing.price.toFixed(2)}</span>
                <span className="text-[11px] text-os-text-secondary">ICP</span>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-os-text-secondary">Not listed</p>
          )}
          {listing && (
            <p className="text-[11px] text-os-text-secondary mt-1">
              Seller: {truncateAddr(listing.seller)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
