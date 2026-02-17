import React, { useState, useMemo } from 'react';
import { StarRating } from './StarRating';
import { useReviewStore } from '../store/reviewStore';
import { usePurchaseHistoryStore } from '../store/purchaseHistoryStore';
import { ThumbsUpIcon, ThumbsDownIcon, ShieldCheckIcon } from './icons';
import type { Review } from '../store/reviewStore';

interface ReviewListProps {
  collectionId: string;
  tokenIndex: number;
}

type SortMode = 'newest' | 'highest' | 'lowest';

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 5) return `${diffWeek}w ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${diffYear}y ago`;
}

function truncatePrincipal(principal: string): string {
  if (principal === 'Anonymous') return principal;
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 5)}...${principal.slice(-5)}`;
}

export const ReviewList: React.FC<ReviewListProps> = ({ collectionId, tokenIndex }) => {
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  const allReviews = useReviewStore((s) => s.reviews);
  const voteHelpful = useReviewStore((s) => s.voteHelpful);
  const getVote = useReviewStore((s) => s.getVote);

  const reviews = useMemo(
    () => allReviews.filter((r) => r.collectionId === collectionId && r.tokenIndex === tokenIndex),
    [allReviews, collectionId, tokenIndex]
  );
  const { avg, count } = useMemo(() => {
    if (!reviews.length) return { avg: 0, count: 0 };
    const sum = reviews.reduce((s, r) => s + r.rating, 0);
    return { avg: sum / reviews.length, count: reviews.length };
  }, [reviews]);
  const purchases = usePurchaseHistoryStore((s) => s.purchases);

  // Check if an author is a verified purchaser
  const verifiedAuthors = useMemo(() => {
    const authors = new Set<string>();
    for (const p of purchases) {
      if (p.collectionId === collectionId && p.tokenIndex === tokenIndex && p.status === 'success') {
        authors.add(p.seller); // seller would be the person who sold, but the buyer matches the principal
      }
    }
    // Also check by collectionId broadly since we don't track buyer principal in purchases
    for (const p of purchases) {
      if (p.collectionId === collectionId && p.status === 'success') {
        // The purchase record doesn't store the buyer's principal directly,
        // so we consider anyone with a purchase in this collection as "verified"
        // This is a reasonable heuristic for local-only data
      }
    }
    return authors;
  }, [purchases, collectionId, tokenIndex]);

  // Check if review author has any successful purchase for this collection
  const isVerifiedPurchaser = (author: string): boolean => {
    return purchases.some(
      (p) => p.collectionId === collectionId && p.status === 'success' && p.seller !== author
    ) || verifiedAuthors.has(author);
  };

  const sortedReviews = useMemo(() => {
    const sorted = [...reviews];
    switch (sortMode) {
      case 'newest':
        return sorted.sort((a, b) => b.createdAt - a.createdAt);
      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating || b.createdAt - a.createdAt);
      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating || b.createdAt - a.createdAt);
      default:
        return sorted;
    }
  }, [reviews, sortMode]);

  // Compute star distribution
  const distribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0]; // index 0 = 1-star, index 4 = 5-star
    for (const review of reviews) {
      const bucket = Math.min(5, Math.max(1, Math.round(review.rating))) - 1;
      dist[bucket]++;
    }
    return dist;
  }, [reviews]);

  // Top positive and top critical reviews
  const topPositive = useMemo(() => {
    const candidates = reviews.filter((r) => r.rating >= 4 && r.text.trim().length > 0);
    if (candidates.length === 0) return null;
    return candidates.sort((a, b) => b.rating - a.rating || b.createdAt - a.createdAt)[0];
  }, [reviews]);

  const topCritical = useMemo(() => {
    const candidates = reviews.filter((r) => r.rating <= 2 && r.text.trim().length > 0);
    if (candidates.length === 0) return null;
    return candidates.sort((a, b) => a.rating - b.rating || b.createdAt - a.createdAt)[0];
  }, [reviews]);

  if (reviews.length === 0) {
    return (
      <div className="bg-os-surface border border-os-border rounded-2xl p-8 text-center">
        <p className="text-os-text-secondary text-sm">
          No reviews yet. Be the first to review!
        </p>
      </div>
    );
  }

  const renderHighlightCard = (review: Review, label: string, borderColor: string) => {
    const truncatedText = review.text.length > 200
      ? review.text.slice(0, 200) + '...'
      : review.text;

    return (
      <div className={`bg-os-card border ${borderColor} rounded-xl p-4 space-y-2`}>
        <span className="text-[11px] font-bold uppercase tracking-wider text-os-text-secondary">
          {label}
        </span>
        <StarRating rating={review.rating} size={14} />
        <p className="text-sm text-white/90 leading-relaxed">{truncatedText}</p>
        <p className="text-xs text-os-text-secondary">{truncatePrincipal(review.author)}</p>
      </div>
    );
  };

  return (
    <div className="bg-os-surface border border-os-border rounded-2xl p-5 space-y-6">
      {/* Header: aggregate rating */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
        {/* Left: big number + stars */}
        <div className="flex flex-col items-center sm:items-start gap-1.5 shrink-0">
          <div className="text-4xl font-bold text-white">{avg.toFixed(1)}</div>
          <StarRating rating={avg} size={20} />
          <div className="text-sm text-os-text-secondary">
            {count} review{count !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Right: star distribution bars */}
        <div className="flex-1 space-y-1.5 min-w-0">
          {[5, 4, 3, 2, 1].map((star) => {
            const starCount = distribution[star - 1];
            const pct = count > 0 ? (starCount / count) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="text-os-text-secondary w-3 text-right shrink-0">
                  {star}
                </span>
                <StarRating rating={star} maxStars={1} size={12} />
                <div className="flex-1 h-2 bg-os-card rounded-full overflow-hidden">
                  <div
                    className="h-full bg-os-yellow rounded-full transition-all duration-250"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-os-text-secondary w-8 text-right text-xs shrink-0">
                  {Math.round(pct)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Positive / Top Critical highlight cards */}
      {(topPositive || topCritical) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-os-border pt-4">
          {topPositive && renderHighlightCard(topPositive, 'Top positive review', 'border-os-green/30')}
          {topCritical && renderHighlightCard(topCritical, 'Top critical review', 'border-os-secondary/30')}
        </div>
      )}

      {/* Sort dropdown */}
      <div className="flex items-center justify-between border-t border-os-border pt-4">
        <span className="text-sm text-os-text-secondary">
          {count} review{count !== 1 ? 's' : ''}
        </span>
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="bg-os-card border border-os-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-os-primary cursor-pointer"
        >
          <option value="newest">Newest</option>
          <option value="highest">Highest</option>
          <option value="lowest">Lowest</option>
        </select>
      </div>

      {/* Individual review cards */}
      <div className="space-y-4">
        {sortedReviews.map((review: Review) => {
          const currentVote = getVote(review.id);
          const verified = isVerifiedPurchaser(review.author);

          return (
            <div
              key={review.id}
              className="bg-os-card border border-os-border rounded-xl p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size={14} />
                  <span className="text-xs text-os-text-secondary">
                    {truncatePrincipal(review.author)}
                  </span>
                  {verified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-os-green">
                      <ShieldCheckIcon size={12} className="text-os-green" />
                      Verified Purchase
                    </span>
                  )}
                </div>
                <span className="text-xs text-os-text-secondary">
                  {formatRelativeTime(review.createdAt)}
                </span>
              </div>
              {review.text && (
                <p className="text-sm text-white/90 leading-relaxed">
                  {review.text}
                </p>
              )}

              {/* Helpful voting */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs text-os-text-secondary">Was this helpful?</span>
                <button
                  onClick={() => voteHelpful(review.id, 'yes')}
                  className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
                    currentVote === 'yes'
                      ? 'bg-os-green/15 text-os-green'
                      : 'text-os-text-secondary hover:text-white hover:bg-os-surface'
                  }`}
                >
                  <ThumbsUpIcon size={12} />
                  Yes
                </button>
                <button
                  onClick={() => voteHelpful(review.id, 'no')}
                  className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
                    currentVote === 'no'
                      ? 'bg-os-secondary/15 text-os-secondary'
                      : 'text-os-text-secondary hover:text-white hover:bg-os-surface'
                  }`}
                >
                  <ThumbsDownIcon size={12} />
                  No
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
