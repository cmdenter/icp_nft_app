import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNFTStore } from '../store/nftStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { useNotificationStore } from '../store/notificationStore';
import { useReviewStore } from '../store/reviewStore';
import { getCollection } from '../api/collections';
import { getExtImageUrls } from '../api/ext';
import { getTokenTransactions } from '../api/ext-market';
import { getBuyCostBreakdown } from '../api/ext-buy';
import { fetchOwnedTokens, listExtNFT, delistExtNFT } from '../api/ext-list';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { TraitBadge } from '../components/TraitBadge';
import { CollectionCarousel } from '../components/CollectionCarousel';
import { RecentlyViewed } from '../components/RecentlyViewed';
import { ReviewList } from '../components/ReviewList';
import { ReviewForm } from '../components/ReviewForm';
import { PriceHistory } from '../components/PriceHistory';
import { Recommendations } from '../components/Recommendations';
import { StarRating } from '../components/StarRating';
import { StatsBar } from '../components/StatsBar';
import { ShareChat } from '../components/ShareChat';
import { ImageGallery } from '../components/ImageGallery';
import { ProductBulletPoints } from '../components/ProductBulletPoints';
import { FrequentlyBoughtTogether } from '../components/FrequentlyBoughtTogether';
import { ComparisonTable } from '../components/ComparisonTable';
import {
  TagIcon,
  CopyIcon,
  HeartIcon,
  HeartFilledIcon,
  VerifiedIcon,
  ExternalLink,
  StarFilledIcon,
  ICPTokenIcon,
} from '../components/icons';

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function truncateAddr(addr: string): string {
  if (addr.length <= 16) return addr;
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

const ExternalNFTDetail: React.FC = () => {
  const { collectionId, tokenId } = useParams<{ collectionId: string; tokenId: string }>();
  const navigate = useNavigate();
  const tokenIndex = Number(tokenId);

  const collection = collectionId ? getCollection(collectionId) : undefined;
  const externalItems = useNFTStore((s) => s.externalItems);
  const externalListings = useNFTStore((s) => s.externalListings);
  const externalTransactions = useNFTStore((s) => s.externalTransactions);
  const externalMarketLoading = useNFTStore((s) => s.externalMarketLoading);
  const loadExternalMarketData = useNFTStore((s) => s.loadExternalMarketData);
  const plugConnected = useNFTStore((s) => s.plugConnected);
  const connectPlugWallet = useNFTStore((s) => s.connectPlugWallet);
  const buyNFT = useNFTStore((s) => s.buyNFT);
  const buyingNFT = useNFTStore((s) => s.buyingNFT);
  const addRecentlyViewed = useNFTStore((s) => s.addRecentlyViewed);

  const items = collectionId ? externalItems.get(collectionId) || [] : [];
  const token = items.find((i) => i.id === tokenIndex);

  const listings = collectionId ? externalListings.get(collectionId) : undefined;
  const listing = listings?.get(tokenIndex);
  const allTx = collectionId ? externalTransactions.get(collectionId) || [] : [];
  const tokenTx = getTokenTransactions(allTx, tokenIndex);
  const marketLoading = collectionId ? (externalMarketLoading.get(collectionId) || false) : false;

  const fallbackUrls = useMemo(
    () => collection ? getExtImageUrls(collection.canisterId, tokenIndex) : (token ? [token.image] : []),
    [collection, tokenIndex, token]
  );

  // Reviews
  const allReviews = useReviewStore((s) => s.reviews);
  const { avg: reviewAvg, count: reviewCount } = useMemo(() => {
    const cid = collectionId || '';
    const filtered = allReviews.filter((r) => r.collectionId === cid && r.tokenIndex === tokenIndex);
    if (!filtered.length) return { avg: 0, count: 0 };
    const sum = filtered.reduce((s, r) => s + r.rating, 0);
    return { avg: sum / filtered.length, count: filtered.length };
  }, [allReviews, collectionId, tokenIndex]);

  // Wishlist + Cart
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(collectionId || '', tokenIndex));
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isInCart = useCartStore((s) => s.isInCart(collectionId || '', tokenIndex));
  const addToCart = useCartStore((s) => s.addItem);
  const showToast = useNotificationStore((s) => s.showToast);

  const [copied, setCopied] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [buySuccess, setBuySuccess] = useState(false);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [showStickyBuy, setShowStickyBuy] = useState(false);
  const buyBoxRef = useRef<HTMLDivElement>(null);

  const isBuying = collectionId ? (buyingNFT.get(`${collectionId}-${tokenIndex}`) || false) : false;
  const costBreakdown = listing ? getBuyCostBreakdown(listing.price) : null;

  // Claim & List state
  const plugAccountId = useNFTStore((s) => s.plugAccountId);
  const [isOwner, setIsOwner] = useState(false);
  const [ownerChecked, setOwnerChecked] = useState(false);
  const [listPrice, setListPrice] = useState('');
  const [listBusy, setListBusy] = useState(false);
  const [listError, setListError] = useState('');
  const [listSuccess, setListSuccess] = useState('');
  const [showListForm, setShowListForm] = useState(false);

  // Check ownership when wallet connects
  useEffect(() => {
    if (!plugConnected || !plugAccountId || !collection) {
      setIsOwner(false);
      setOwnerChecked(false);
      return;
    }
    let cancelled = false;
    async function check() {
      const owned = await fetchOwnedTokens(collection!, plugAccountId);
      if (!cancelled) {
        setIsOwner(owned.includes(tokenIndex));
        setOwnerChecked(true);
        if (listing) setListPrice(listing.price.toString());
      }
    }
    check();
    return () => { cancelled = true; };
  }, [plugConnected, plugAccountId, collection, tokenIndex, listing]);

  const handleListNFT = async () => {
    const priceNum = parseFloat(listPrice);
    if (!priceNum || priceNum <= 0) { setListError('Enter a valid price'); return; }
    if (!collection) return;
    setListError(''); setListSuccess(''); setListBusy(true);
    const result = await listExtNFT(collection, tokenIndex, priceNum);
    setListBusy(false);
    if (result.success) {
      setListSuccess('Listed successfully!');
      setTimeout(() => setListSuccess(''), 4000);
    } else {
      setListError(result.error || 'Listing failed');
    }
  };

  const handleDelistNFT = async () => {
    if (!collection) return;
    setListError(''); setListSuccess(''); setListBusy(true);
    const result = await delistExtNFT(collection, tokenIndex);
    setListBusy(false);
    if (result.success) {
      setListSuccess('Removed from sale');
      setListPrice('');
      setTimeout(() => setListSuccess(''), 4000);
    } else {
      setListError(result.error || 'Delisting failed');
    }
  };

  // Load market data if not already loaded
  useEffect(() => {
    if (collectionId && collection?.standard === 'ext') {
      loadExternalMarketData(collectionId);
    }
  }, [collectionId, collection?.standard, loadExternalMarketData]);

  // Track recently viewed
  useEffect(() => {
    if (collection && collectionId) {
      const imageUrl = fallbackUrls.length > 0 ? fallbackUrls[0] : (token?.image || '');
      addRecentlyViewed({
        id: tokenIndex,
        name: token?.name || `${collection.name} #${tokenIndex}`,
        image: imageUrl,
        collectionId: collectionId,
        collectionName: collection.name,
        viewedAt: Date.now(),
      });
    }
  }, [token?.id, collectionId, collection?.name]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mobile sticky buy bar — show when buy box scrolls out of view
  useEffect(() => {
    const el = buyBoxRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBuy(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // More from this collection: filter out the current token, max 10
  const moreFromCollection = useMemo(() => {
    if (!collectionId) return [];
    const allItems = externalItems.get(collectionId) || [];
    return allItems.filter((i) => i.id !== tokenIndex).slice(0, 10);
  }, [externalItems, collectionId, tokenIndex]);

  if (!collection) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Not Found' },
          ]}
        />
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-os-text-secondary text-lg">Collection not found</p>
          <button onClick={() => navigate('/')} className="btn btn-md btn-primary">
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  // Show loading skeleton while market data is loading and token isn't available yet
  if (!token && marketLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-4 sm:py-6">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: collection.name, to: `/collection/${collectionId}` },
            { label: `#${tokenIndex}` },
          ]}
        />
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 lg:gap-8 mt-2">
          {/* Image skeleton */}
          <div className="aspect-square rounded-2xl bg-os-surface border border-os-border animate-pulse overflow-hidden">
            {fallbackUrls.length > 0 ? (
              <img src={fallbackUrls[0]} alt={`${collection.name} #${tokenIndex}`} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full bg-os-card" />
            )}
          </div>
          {/* Info skeleton */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-os-card animate-pulse" />
              <div className="h-9 w-64 rounded bg-os-card animate-pulse" />
            </div>
            <div className="h-4 w-48 rounded bg-os-card animate-pulse" />
            <div className="rounded-2xl border border-os-border bg-os-surface p-6 space-y-4">
              <div className="h-4 w-24 rounded bg-os-card animate-pulse" />
              <div className="h-10 w-40 rounded bg-os-card animate-pulse" />
              <div className="h-12 w-full rounded-xl bg-os-card animate-pulse" />
              <div className="h-12 w-full rounded-xl bg-os-card animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Build display data — use token if available, otherwise fallback
  const displayName = token?.name || `${collection.name} #${tokenIndex}`;
  const displayOwner = token?.owner || null;
  const displayDescription = token?.description || null;
  const displayTraits = token?.traits || [];

  const truncatedOwner = displayOwner
    ? displayOwner.length > 20
      ? displayOwner.slice(0, 8) + '...' + displayOwner.slice(-6)
      : displayOwner
    : null;

  const truncatedSeller = listing
    ? truncateAddr(listing.seller)
    : null;

  const canisterUrl = `https://dashboard.internetcomputer.org/canister/${collection.canisterId}`;

  // Find last sale from transaction history
  const lastSale = tokenTx.length > 0 ? tokenTx[tokenTx.length - 1] : null;

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-4 sm:py-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: collection.name, to: `/collection/${collectionId}` },
          { label: displayName },
        ]}
      />

      {/* ===== ABOVE THE FOLD: 2-column grid ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 lg:gap-8 mt-2">
        {/* Left: Image Gallery */}
        <div>
          <ImageGallery
            urls={fallbackUrls}
            alt={displayName}
            fallback={displayName?.[0] || '#'}
            collectionImage={collection.image}
            standard={collection.standard}
          />

          {/* Wishlist + External link bar */}
          <div className="flex items-center justify-between mt-3 px-1">
            <button
              onClick={() => {
                toggleWishlist({
                  collectionId: collectionId || '',
                  tokenIndex,
                  name: displayName,
                  image: fallbackUrls[0] || '',
                  collectionName: collection?.name || '',
                  price: listing?.price,
                  addedAt: Date.now(),
                });
                showToast({ type: isWishlisted ? 'info' : 'success', title: isWishlisted ? 'Removed from watchlist' : 'Added to watchlist' });
              }}
              className="flex items-center gap-1.5 text-sm text-os-text-secondary hover:text-white transition-colors"
            >
              {isWishlisted ? (
                <HeartFilledIcon size={16} className="text-os-secondary" />
              ) : (
                <HeartIcon size={16} />
              )}
              <span>{isWishlisted ? 'Watchlisted' : 'Add to Watchlist'}</span>
            </button>
            <a
              href={canisterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-os-text-secondary hover:text-white transition-colors"
            >
              <ExternalLink size={14} />
              <span>View on IC</span>
            </a>
          </div>
        </div>

        {/* Right: Buy Box (sticky) */}
        <div className="lg:sticky lg:top-[88px] lg:self-start space-y-4">
          {/* Collection + Title */}
          <div>
            <button
              onClick={() => navigate(`/collection/${collectionId}`)}
              className="flex items-center gap-1.5 mb-1 hover:opacity-80 transition-opacity"
            >
              <span className="text-os-primary text-[15px] font-semibold">{collection.name}</span>
              {collection.verified && <VerifiedIcon size={16} />}
            </button>
            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tighter">{displayName}</h1>

            {/* Star rating summary */}
            {reviewCount > 0 && (
              <button
                onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 mt-1"
              >
                <StarRating rating={reviewAvg} size={16} />
                <span className="text-sm text-os-primary hover:underline">
                  {reviewCount} rating{reviewCount !== 1 ? 's' : ''}
                </span>
              </button>
            )}
          </div>

          {/* Owner */}
          {truncatedOwner && (
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-os-text-secondary">Owned by</span>
              <button
                onClick={() => handleCopy(displayOwner!)}
                className="flex items-center gap-1.5 text-sm text-os-primary hover:text-os-primary-hover transition-colors bg-os-primary/[0.08] px-2.5 py-1 rounded-lg"
              >
                <span className="font-mono">{truncatedOwner}</span>
                <CopyIcon size={12} />
              </button>
              {copied && <span className="text-xs text-os-green ml-1 font-medium">Copied!</span>}
            </div>
          )}

          {/* Description inline */}
          {displayDescription && (
            <p className="text-sm text-os-text-secondary leading-relaxed">{displayDescription}</p>
          )}

          {/* Product Bullet Points */}
          {token && (
            <div className="border-t border-os-border/30 pt-3">
              <ProductBulletPoints
                collection={collection}
                token={token}
                listing={listing}
                isOwner={isOwner}
              />
            </div>
          )}

          {/* Price / Buy card */}
          <div ref={buyBoxRef} className="rounded-2xl border border-os-border bg-os-surface overflow-hidden">
            {listing ? (
              <>
                <div className="px-4 py-3 border-b border-os-border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-lg bg-os-green/15 text-os-green tracking-wide">
                      For Sale
                    </span>
                    {listing.locked && (
                      <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-lg bg-os-yellow/15 text-os-yellow tracking-wide">
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-os-text-secondary mt-2">Current price</p>
                  <div className="flex items-center gap-2 mt-1">
                    <ICPTokenIcon size={20} />
                    <span className="text-4xl font-bold text-white tracking-tight">
                      {listing.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-os-text-secondary mt-1.5">ICP</span>
                  </div>
                  {truncatedSeller && (
                    <p className="text-xs text-os-text-secondary mt-2">
                      Seller: <span className="font-mono text-os-primary">{truncatedSeller}</span>
                    </p>
                  )}

                  {/* Cost breakdown */}
                  {costBreakdown && (
                    <div className="mt-3 pt-3 border-t border-os-border/30 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-os-text-secondary">Price</span>
                        <span className="text-white">{costBreakdown.price.toFixed(4)} ICP</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-os-text-secondary">Service fee (1%)</span>
                        <span className="text-white">{costBreakdown.commission.toFixed(4)} ICP</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-os-text-secondary">Network fees</span>
                        <span className="text-white">{costBreakdown.fees.toFixed(4)} ICP</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold pt-2 border-t border-os-border/20">
                        <span className="text-os-text-secondary">Total</span>
                        <span className="text-white">{costBreakdown.total.toFixed(4)} ICP</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Buy actions */}
                <div className="p-4 space-y-3">
                  {buySuccess ? (
                    <div className="bg-os-green/10 border border-os-green/30 rounded-xl p-4 text-center">
                      <p className="text-os-green font-bold text-sm">Purchase successful!</p>
                      <p className="text-os-text-secondary text-xs mt-1">This NFT is now yours.</p>
                    </div>
                  ) : plugConnected ? (
                    <button
                      onClick={async () => {
                        setBuyError('');
                        if (!collectionId) return;
                        const result = await buyNFT(collectionId, tokenIndex);
                        if (result.success) {
                          setBuySuccess(true);
                        } else {
                          setBuyError(result.error || 'Purchase failed');
                        }
                      }}
                      disabled={isBuying || listing.locked}
                      className="btn btn-lg btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {isBuying ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : listing.locked ? (
                        'Currently Locked'
                      ) : (
                        `Buy Now for ${costBreakdown?.total.toFixed(4) || listing.price.toFixed(2)} ICP`
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        setWalletConnecting(true);
                        try { await connectPlugWallet(); } catch { /* */ }
                        setWalletConnecting(false);
                      }}
                      disabled={walletConnecting}
                      className="btn btn-lg btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {walletConnecting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        'Connect Wallet to Buy'
                      )}
                    </button>
                  )}

                  {buyError && (
                    <div className="bg-os-secondary/10 border border-os-secondary/30 rounded-xl p-3 text-center">
                      <p className="text-os-secondary text-xs">{buyError}</p>
                    </div>
                  )}

                  {/* Add to Cart */}
                  <button
                    onClick={() => {
                      if (isInCart || !listing || !collectionId) return;
                      addToCart({
                        collectionId,
                        tokenIndex,
                        name: displayName,
                        image: fallbackUrls[0] || '',
                        collectionName: collection?.name || '',
                        price: listing.price,
                        seller: listing.seller,
                        addedAt: Date.now(),
                      });
                      showToast({ type: 'success', title: 'Added to cart', message: displayName });
                    }}
                    disabled={isInCart}
                    className={`btn btn-lg w-full ${isInCart ? 'bg-os-green/10 border border-os-green/30 text-os-green' : 'btn-secondary'}`}
                  >
                    {isInCart ? 'In Cart' : 'Add to Cart'}
                  </button>

                  {/* Make Offer */}
                  <button
                    disabled
                    className="btn btn-lg w-full btn-ghost border border-os-border/30 opacity-60"
                    title="Offers coming soon"
                  >
                    Make Offer
                  </button>

                  {/* Amazon-style delivery info */}
                  <div className="space-y-1 pt-2 border-t border-os-border/30">
                    <p className="text-xs text-os-text-secondary">
                      <span className="text-os-green font-medium">Blockchain confirmation:</span> ~2 seconds
                    </p>
                    <p className="text-xs text-os-text-secondary">
                      <span className="text-white font-medium">1 of 1</span> digital asset
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-os-border">
                  <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-lg bg-os-card text-os-text-secondary tracking-wide">
                    Not Listed
                  </span>
                  {lastSale && (
                    <div className="mt-3">
                      <p className="text-xs text-os-text-secondary">Last sale</p>
                      <div className="flex items-center gap-2 mt-1">
                        <ICPTokenIcon size={14} />
                        <span className="text-xl font-bold text-white">{lastSale.price.toFixed(2)}</span>
                        <span className="text-xs text-os-text-secondary">ICP</span>
                        <span className="text-xs text-os-text-secondary ml-1">{timeAgo(lastSale.time)}</span>
                      </div>
                    </div>
                  )}
                  {collection.floorPrice != null && !lastSale && (
                    <div className="mt-3">
                      <p className="text-xs text-os-text-secondary">Collection floor</p>
                      <div className="flex items-center gap-2 mt-1">
                        <ICPTokenIcon size={14} />
                        <span className="text-xl font-bold text-white">{collection.floorPrice}</span>
                        <span className="text-xs text-os-text-secondary">ICP</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  {/* Make Offer */}
                  <button
                    disabled
                    className="btn btn-lg w-full btn-ghost border border-os-border/30 opacity-60"
                    title="Offers coming soon"
                  >
                    Make Offer
                  </button>
                  <a
                    href={canisterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-os-surface border border-os-border/40 hover:bg-os-card hover:border-os-border text-white font-bold py-3.5 rounded-xl transition-all text-sm text-center"
                  >
                    View on IC Dashboard
                  </a>

                  {/* Amazon-style info */}
                  <div className="space-y-1 pt-2 border-t border-os-border/30">
                    <p className="text-xs text-os-text-secondary">
                      <span className="text-os-green font-medium">Blockchain confirmation:</span> ~2 seconds
                    </p>
                    <p className="text-xs text-os-text-secondary">
                      <span className="text-white font-medium">1 of 1</span> digital asset
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Listed / Not Listed badge */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {listing ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-os-green/10 border border-os-green/20">
                <div className="w-1.5 h-1.5 rounded-full bg-os-green animate-pulse" />
                <span className="text-[13px] font-semibold text-os-green">
                  Listed {listing.price.toFixed(2)} ICP
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-os-surface border border-os-border/40">
                <div className="w-1.5 h-1.5 rounded-full bg-os-text-secondary/50" />
                <span className="text-[13px] text-os-text-secondary">Not listed</span>
              </div>
            )}
            {lastSale && (
              <div className="px-3 py-1.5 rounded-lg bg-os-surface border border-os-border/40">
                <span className="text-[13px] text-os-text-secondary">
                  Last <span className="text-white font-medium">{lastSale.price.toFixed(2)} ICP</span>
                </span>
              </div>
            )}
          </div>

          {/* Own? List here card */}
          <div className="rounded-2xl border border-os-border/40 bg-os-surface overflow-hidden">
            {/* Header row */}
            <button
              onClick={() => setShowListForm(!showListForm)}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-os-card/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-os-primary/10 flex items-center justify-center">
                  <TagIcon size={16} className="text-os-primary" />
                </div>
                {plugConnected && ownerChecked && isOwner ? (
                  <div>
                    <p className="text-sm font-semibold text-white text-left">This is yours</p>
                    <p className="text-xs text-os-text-secondary text-left">
                      {listing ? `Listed at ${listing.price.toFixed(2)} ICP` : 'Set a price to list for sale'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-white text-left">Own this NFT?</p>
                    <p className="text-xs text-os-text-secondary text-left">List it for sale on this marketplace</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {plugConnected && ownerChecked && isOwner && (
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-os-green/15 text-os-green">Owner</span>
                )}
                <span className={`text-os-primary text-sm font-semibold ${showListForm ? 'rotate-180' : ''} transition-transform`}>
                  {showListForm ? '\u2212' : '+'}
                </span>
              </div>
            </button>

            {/* Expanded content */}
            {showListForm && (
              <div className="px-5 pb-4 pt-1 border-t border-os-border/30 animate-float-in">
                {!plugConnected ? (
                  <div className="flex items-center gap-3 py-3">
                    <p className="text-sm text-os-text-secondary flex-1">Connect wallet to verify ownership</p>
                    <button
                      onClick={async () => {
                        setWalletConnecting(true);
                        try { await connectPlugWallet(); } catch { /* */ }
                        setWalletConnecting(false);
                      }}
                      disabled={walletConnecting}
                      className="shrink-0 bg-os-primary hover:bg-os-primary-hover disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-xl transition-all text-sm flex items-center gap-2 btn-press"
                    >
                      {walletConnecting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      {walletConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                  </div>
                ) : !ownerChecked ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-os-text-secondary">
                    <div className="w-4 h-4 border-2 border-os-primary/40 border-t-os-primary rounded-full animate-spin" />
                    Verifying ownership...
                  </div>
                ) : isOwner ? (
                  <div className="pt-3 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={listPrice}
                        onChange={(e) => setListPrice(e.target.value)}
                        placeholder="Price in ICP"
                        className="flex-1 bg-os-card border border-os-border/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-os-text-secondary/50 focus:outline-none focus:border-os-primary transition-all input-glow"
                      />
                      <button
                        onClick={handleListNFT}
                        disabled={listBusy}
                        className="bg-os-primary hover:bg-os-primary-hover disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl transition-all text-sm whitespace-nowrap flex items-center gap-2 shadow-md shadow-os-primary/20 btn-press"
                      >
                        {listBusy ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : listing ? (
                          'Update Price'
                        ) : (
                          'List for Sale'
                        )}
                      </button>
                    </div>
                    {listing && !listBusy && (
                      <button
                        onClick={handleDelistNFT}
                        className="text-xs text-os-text-secondary hover:text-os-secondary transition-colors"
                      >
                        Remove listing
                      </button>
                    )}
                    {listError && <p className="text-os-secondary text-xs">{listError}</p>}
                    {listSuccess && <p className="text-os-green text-xs font-semibold">{listSuccess}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-os-text-secondary py-3">
                    This NFT isn't in your connected wallet.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== BELOW THE FOLD: Full-width sections ===== */}

      {/* 1. Frequently Bought Together */}
      {listings && listings.size > 0 && (
        <section className="mt-12 border-t border-os-border/30 pt-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <StarFilledIcon size={18} className="text-os-yellow" />
            Frequently Bought Together
          </h2>
          <FrequentlyBoughtTogether
            collectionId={collectionId!}
            currentTokenIndex={tokenIndex}
            listings={listings}
            items={items}
          />
        </section>
      )}

      {/* 2. Properties / Traits */}
      {displayTraits.length > 0 && (
        <section className="mt-12 border-t border-os-border/30 pt-8">
          <h2 className="text-xl font-bold text-white mb-4">Properties</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {displayTraits.map((trait, i) => (
              <TraitBadge key={i} trait={trait} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Item Activity / Transaction History */}
      <section className="mt-12 border-t border-os-border/30 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Item Activity</h2>
        {marketLoading ? (
          <div className="flex items-center gap-2 py-8 text-os-text-secondary text-sm justify-center">
            <div className="w-4 h-4 border-2 border-os-text-secondary border-t-transparent rounded-full animate-spin" />
            Loading transaction history...
          </div>
        ) : tokenTx.length > 0 ? (
          <div className="bg-os-surface border border-os-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-os-text-secondary text-xs bg-os-card/50">
                    <th className="text-left pb-3 pt-3 px-4 font-semibold">Event</th>
                    <th className="text-left pb-3 pt-3 px-4 font-semibold">Price</th>
                    <th className="text-left pb-3 pt-3 px-4 font-semibold">From</th>
                    <th className="text-left pb-3 pt-3 px-4 font-semibold">To</th>
                    <th className="text-right pb-3 pt-3 px-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[...tokenTx].reverse().map((tx, i) => (
                    <tr key={i} className="border-t border-os-border/20 hover:bg-os-card/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-os-primary">Sale</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <ICPTokenIcon size={12} />
                          <span className="text-white font-semibold">{tx.price.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-os-primary font-mono text-xs">
                        {truncateAddr(tx.seller)}
                      </td>
                      <td className="py-3 px-4 text-os-primary font-mono text-xs">
                        {truncateAddr(tx.buyer)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-xs text-os-text-secondary" title={formatDate(tx.time)}>
                          {timeAgo(tx.time)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-os-surface border border-os-border rounded-2xl p-8 text-center">
            <p className="text-sm text-os-text-secondary">
              {listings ? 'No transactions found for this token' : 'Loading...'}
            </p>
          </div>
        )}
      </section>

      {/* 4. Product Details */}
      <section className="mt-12 border-t border-os-border/30 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Product Details</h2>
        <div className="bg-os-surface border border-os-border rounded-2xl overflow-hidden">
          <div className="divide-y divide-os-border/30">
            {[
              { label: 'Token ID', value: `#${tokenIndex}`, mono: true, color: 'text-os-primary' },
              { label: 'Blockchain', value: 'Internet Computer' },
              { label: 'Token Standard', value: collection.standard.toUpperCase() },
              {
                label: 'Canister ID',
                value: `${collection.canisterId.slice(0, 8)}...${collection.canisterId.slice(-5)}`,
                mono: true,
                color: 'text-os-primary',
                copyable: collection.canisterId,
              },
              { label: 'Collection', value: collection.name, link: `/collection/${collectionId}` },
              ...(collection.totalSupply ? [{ label: 'Total Supply', value: collection.totalSupply.toLocaleString() }] : []),
              { label: 'Network', value: 'Mainnet', color: 'text-os-green' },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center px-5 py-3 hover:bg-os-card/20 transition-colors">
                <span className="text-sm text-os-text-secondary">{row.label}</span>
                {'link' in row && row.link ? (
                  <button
                    onClick={() => navigate(row.link!)}
                    className="text-sm text-os-primary hover:text-os-primary-hover transition-colors"
                  >
                    {row.value}
                  </button>
                ) : 'copyable' in row && row.copyable ? (
                  <button
                    onClick={() => handleCopy(row.copyable!)}
                    className={`flex items-center gap-1 text-sm ${row.color || 'text-white'} ${row.mono ? 'font-mono' : ''} hover:opacity-80 transition-opacity`}
                  >
                    {row.value}
                    <CopyIcon size={10} />
                  </button>
                ) : (
                  <span className={`text-sm ${row.color || 'text-white'} ${row.mono ? 'font-mono' : ''} font-medium`}>
                    {row.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. About Collection */}
      <section className="mt-12 border-t border-os-border/30 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">About {collection.name}</h2>
        <div className="bg-os-surface border border-os-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-os-surface shrink-0">
              {collection.image ? (
                <img src={collection.image} alt={collection.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-os-primary to-purple-600 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{collection.name[0]}</span>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-white">{collection.name}</span>
                {collection.verified && <VerifiedIcon size={14} />}
              </div>
              {collection.floorPrice != null && (
                <p className="text-xs text-os-text-secondary">Floor: {collection.floorPrice} ICP</p>
              )}
            </div>
          </div>
          <p className="text-sm text-os-text-secondary leading-relaxed">{collection.description}</p>
          <a
            href={canisterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-os-primary hover:text-os-primary-hover transition-colors"
          >
            View canister on IC Dashboard
            <ExternalLink size={12} />
          </a>
        </div>
      </section>

      {/* 6. Price History */}
      {tokenTx.length > 1 && (
        <section className="mt-12 border-t border-os-border/30 pt-8">
          <h2 className="text-xl font-bold text-white mb-4">Price History</h2>
          <div className="bg-os-surface border border-os-border rounded-2xl p-5">
              <div className="mb-4">
                <StatsBar stats={(() => {
                  const prices = tokenTx.map(tx => tx.price).filter(p => p > 0);
                  const lastSale = prices.length > 0 ? prices[prices.length - 1] : null;
                  const highest = prices.length > 0 ? Math.max(...prices) : null;
                  const avg = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
                  return [
                    ...(lastSale != null ? [{ label: 'Last Sale', value: `${lastSale.toFixed(4)} ICP` }] : []),
                    { label: 'Total Sales', value: tokenTx.length.toString() },
                    ...(highest != null ? [{ label: 'Highest Sale', value: `${highest.toFixed(4)} ICP`, color: 'text-os-green' }] : []),
                    ...(avg != null ? [{ label: 'Avg Price', value: `${avg.toFixed(4)} ICP` }] : []),
                  ];
                })()} />
              </div>
            <PriceHistory transactions={tokenTx} />
          </div>
        </section>
      )}

      {/* 7. Share Chat */}
      <section className="mt-12 border-t border-os-border/30 pt-8">
        <ShareChat threadId={`nft-${collectionId}-${tokenIndex}`} />
      </section>

      {/* 8. Compare Similar Items */}
      {token && items.length > 1 && listings && (
        <section className="mt-12 border-t border-os-border/30 pt-8">
          <h2 className="text-xl font-bold text-white mb-4">Compare Similar Items</h2>
          <div className="bg-os-surface border border-os-border rounded-2xl p-5">
            <ComparisonTable
              currentToken={token}
              collectionId={collectionId!}
              items={items}
              listings={listings}
            />
          </div>
        </section>
      )}

      {/* 9. More from Collection */}
      {moreFromCollection.length > 0 && (
        <div className="mt-12 border-t border-os-border/30 pt-8">
          <CollectionCarousel
            title={`More from ${collection.name}`}
            items={moreFromCollection}
            showViewAll
            viewAllLink={`/collection/${collectionId}`}
          />
        </div>
      )}

      {/* 10. Customers Also Bought */}
      <div className="mt-12 border-t border-os-border/30 pt-8">
        <Recommendations
          type="also-bought"
          currentCollectionId={collectionId}
          currentTokenIndex={tokenIndex}
        />
      </div>

      {/* 11. Popular in Category */}
      <div className="mt-12 border-t border-os-border/30 pt-8">
        <Recommendations
          type="popular-in-category"
          currentCollectionId={collectionId}
          category={collection.category}
        />
      </div>

      {/* 12. Recently Viewed */}
      <div className="mt-12 border-t border-os-border/30 pt-8">
        <RecentlyViewed />
      </div>

      {/* 13. Customer Reviews */}
      <section id="reviews-section" className="mt-12 border-t border-os-border/30 pt-8 pb-20 lg:pb-0">
        <h2 className="text-xl font-bold text-white mb-4">Customer Reviews</h2>
        <div className="space-y-6">
          <ReviewList collectionId={collectionId!} tokenIndex={tokenIndex} />
          <ReviewForm collectionId={collectionId!} tokenIndex={tokenIndex} />
        </div>
      </section>

      {/* Mobile Sticky Buy Bar */}
      {listing && showStickyBuy && (
        <div className="mobile-sticky-buy" role="complementary" aria-label="Purchase actions">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <ICPTokenIcon size={18} />
              <span className="text-xl font-bold text-white truncate">{listing.price.toFixed(2)} ICP</span>
            </div>
            {plugConnected ? (
              <button
                onClick={async () => {
                  if (!collectionId) return;
                  setBuyError('');
                  const result = await buyNFT(collectionId, tokenIndex);
                  if (result.success) setBuySuccess(true);
                  else setBuyError(result.error || 'Purchase failed');
                }}
                disabled={isBuying || listing.locked || buySuccess}
                className="btn btn-md btn-primary shrink-0"
              >
                {isBuying ? 'Processing...' : buySuccess ? 'Purchased!' : 'Buy Now'}
              </button>
            ) : (
              <button
                onClick={async () => {
                  setWalletConnecting(true);
                  try { await connectPlugWallet(); } catch { /* */ }
                  setWalletConnecting(false);
                }}
                disabled={walletConnecting}
                className="btn btn-md btn-primary shrink-0"
              >
                {walletConnecting ? 'Connecting...' : 'Connect & Buy'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalNFTDetail;
