import React, { useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNFTStore } from '../store/nftStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { useNotificationStore } from '../store/notificationStore';
import { useReviewStore } from '../store/reviewStore';
import { getCollection } from '../api/collections';
import { HeartIcon, HeartFilledIcon, ShoppingBagIcon, CartIcon, VerifiedIcon, StarFilledIcon, ICPTokenIcon } from './icons';
import type { GalleryItem } from '../types';

interface Props {
  item: GalleryItem;
  listing?: { price: number; seller: string };
}

function SafeImg({ src, alt = '', fallback, className = '', ...rest }:
  React.ImgHTMLAttributes<HTMLImageElement> & { fallback: string }) {
  const [ok, setOk] = React.useState(true);
  if (!ok || !src) {
    return (
      <div
        className={className}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #15253B 0%, #1C3150 50%, rgba(32,129,226,0.12) 100%)',
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 700, fontSize: '1.1rem', userSelect: 'none' }}>
          {fallback}
        </span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setOk(false)} {...rest} />;
}

const NFTCardInner: React.FC<Props> = ({ item, listing }) => {
  const navigate = useNavigate();
  const loadTokenDetail = useNFTStore((s) => s.loadTokenDetail);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Wishlist
  const collectionId = item.collectionId || 'local';
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(collectionId, item.id));
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

  // Cart
  const isInCart = useCartStore((s) => s.isInCart(collectionId, item.id));
  const addToCart = useCartStore((s) => s.addItem);
  const showToast = useNotificationStore((s) => s.showToast);

  // Reviews
  const allReviews = useReviewStore((s) => s.reviews);
  const { avg: reviewAvg, count: reviewCount } = useMemo(() => {
    const filtered = allReviews.filter((r) => r.collectionId === collectionId && r.tokenIndex === item.id);
    if (!filtered.length) return { avg: 0, count: 0 };
    const sum = filtered.reduce((s, r) => s + r.rating, 0);
    return { avg: sum / filtered.length, count: filtered.length };
  }, [allReviews, collectionId, item.id]);

  const handleMouseEnter = useCallback(() => {
    if (item.id < 0) return;
    hoverTimer.current = setTimeout(() => {
      loadTokenDetail(item.id);
    }, 200);
  }, [item.id, loadTokenDetail]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  }, []);

  const collectionName = item.collectionId
    ? (getCollection(item.collectionId)?.name || 'Unknown Collection')
    : 'ICP Speed NFTs';

  const handleClick = useCallback(() => {
    if (item.id < 0) return;
    if (item.collectionId && item.collectionId !== 'local') {
      navigate(`/collection/${item.collectionId}/nft/${item.id}`);
      return;
    }
    navigate(`/nft/${item.id}`);
  }, [item.id, item.collectionId, navigate]);

  const displayPrice = listing?.price ?? (0.1 + item.id * 0.05);

  const handleToggleWishlist = (e: React.MouseEvent) => {
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

  const rarity = item.traits?.find((t) => t.category === 'Rarity')?.value;
  const rarityRank = item.id + 1;

  const rarityColor =
    rarity === 'Legendary'
      ? 'text-os-rarity-legendary bg-os-rarity-legendary/10'
      : rarity === 'Rare'
        ? 'text-os-rarity-rare bg-os-rarity-rare/10'
        : rarity === 'Uncommon'
          ? 'text-os-rarity-uncommon bg-os-rarity-uncommon/10'
          : 'text-os-text-secondary bg-os-surface';

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="card-base group overflow-hidden cursor-pointer hover:-translate-y-1.5"
    >
      {/* Image */}
      <div className="aspect-square bg-os-card overflow-hidden relative" onClick={handleClick}>
        <SafeImg
          src={item.image}
          alt={item.name}
          loading="lazy"
          decoding="async"
          fallback={item.name?.[0] || '#'}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250" />

        {/* Rarity rank badge */}
        {rarity && (
          <div className={`absolute top-2 left-2 px-2.5 py-1 rounded-lg text-[11px] font-bold ${rarityColor}`}>
            #{rarityRank}
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={handleToggleWishlist}
          aria-label="Toggle watchlist"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="bg-os-bg/90 backdrop-blur-md rounded-lg p-1.5">
            {isWishlisted ? (
              <HeartFilledIcon size={16} className="text-os-secondary" />
            ) : (
              <HeartIcon size={16} className="text-white" />
            )}
          </div>
        </button>

        {/* Hover overlay - Buy Now + Add to Cart */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-250 ease-out">
          <div className="flex">
            <button
              onClick={(e) => { e.stopPropagation(); handleClick(); }}
              className="flex-1 bg-os-primary/90 hover:bg-os-primary-hover text-white text-sm font-bold py-3 backdrop-blur-md flex items-center justify-center gap-2 btn-press"
            >
              <ShoppingBagIcon size={14} />
              Buy now
            </button>
            {listing && (
              <button
                onClick={handleAddToCart}
                disabled={isInCart}
                className={`px-4 backdrop-blur-md flex items-center justify-center border-l border-white/10 ${isInCart ? 'bg-os-green/80 text-white' : 'bg-os-card/90 hover:bg-os-card text-white'}`}
              >
                <CartIcon size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4" onClick={handleClick}>
        {/* Collection name */}
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[11px] text-os-text-secondary font-medium truncate">{collectionName}</span>
          <VerifiedIcon size={12} />
        </div>

        {/* NFT Name */}
        <p className="font-semibold text-white truncate text-sm">{item.name}</p>

        {/* Star rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <StarFilledIcon size={11} className="text-os-yellow" />
            <span className="text-[11px] text-os-yellow font-semibold">{reviewAvg.toFixed(1)}</span>
            <span className="text-[11px] text-os-text-secondary">({reviewCount})</span>
          </div>
        )}

        {/* Price row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-os-border/40">
          <div>
            <p className="text-[11px] text-os-text-secondary uppercase tracking-wider">Price</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ICPTokenIcon size={14} />
              <span className="text-sm font-bold text-white">
                {displayPrice.toFixed(2)}
              </span>
              <span className="text-[11px] text-os-text-secondary">ICP</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-os-text-secondary uppercase tracking-wider">Last sale</p>
            <p className="text-xs text-os-text-secondary">
              {(listing ? listing.price * 0.85 : 0.08 + item.id * 0.03).toFixed(2)} ICP
            </p>
          </div>
        </div>

        {/* Rarity + Favorites */}
        <div className="flex items-center justify-between mt-2.5">
          {rarity && (
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg ${rarityColor}`}>
              {rarity}
            </span>
          )}
          <div className="flex items-center gap-1 ml-auto">
            {isWishlisted ? (
              <HeartFilledIcon size={12} className="text-os-secondary" />
            ) : (
              <HeartIcon size={12} className="text-os-text-secondary" />
            )}
            <span className="text-[11px] text-os-text-secondary">{isWishlisted ? 1 : 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NFTCard = React.memo(NFTCardInner);
