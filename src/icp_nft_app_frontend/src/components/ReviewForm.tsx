import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { useReviewStore } from '../store/reviewStore';
import { useNFTStore } from '../store/nftStore';
import { useNotificationStore } from '../store/notificationStore';

interface ReviewFormProps {
  collectionId: string;
  tokenIndex: number;
}

const MAX_CHARS = 500;

export const ReviewForm: React.FC<ReviewFormProps> = ({ collectionId, tokenIndex }) => {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const addReview = useReviewStore((s) => s.addReview);
  const principal = useNFTStore((s) => s.plugPrincipal || s.principal);
  const showToast = useNotificationStore((s) => s.showToast);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) return;

    setSubmitting(true);

    try {
      addReview({
        collectionId,
        tokenIndex,
        rating,
        text: text.trim(),
        author: principal || 'Anonymous',
      });

      showToast({ type: 'success', title: 'Review submitted' });
      setRating(0);
      setText('');
    } catch {
      showToast({ type: 'error', title: 'Failed to submit review' });
    } finally {
      setSubmitting(false);
    }
  };

  const charsRemaining = MAX_CHARS - text.length;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-os-card border border-os-border rounded-xl p-5 space-y-4"
    >
      <h3 className="text-white font-semibold text-base">Write a Review</h3>

      {/* Star rating selection */}
      <div className="space-y-1.5">
        <label className="text-sm text-os-text-secondary block">
          Your rating <span className="text-red-400">*</span>
        </label>
        <StarRating
          rating={rating}
          size={24}
          interactive
          onChange={setRating}
        />
        {rating === 0 && (
          <p className="text-xs text-os-text-secondary">Click a star to rate</p>
        )}
      </div>

      {/* Review text */}
      <div className="space-y-1.5">
        <label htmlFor="review-text" className="text-sm text-os-text-secondary block">
          Review (optional)
        </label>
        <textarea
          id="review-text"
          value={text}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              setText(e.target.value);
            }
          }}
          placeholder="Share your thoughts about this NFT..."
          rows={4}
          maxLength={MAX_CHARS}
          className="w-full bg-os-surface border border-os-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-os-primary transition-colors"
        />
        <div className="flex justify-end">
          <span
            className={`text-xs ${
              charsRemaining < 50 ? 'text-os-yellow' : 'text-os-text-secondary'
            } ${charsRemaining < 10 ? 'text-red-400' : ''}`}
          >
            {charsRemaining}/{MAX_CHARS}
          </span>
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={rating === 0 || submitting}
        className="w-full py-2.5 px-4 rounded-lg bg-os-primary text-white font-semibold text-sm hover:bg-os-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};
