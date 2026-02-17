import React, { useState } from 'react';
import { StarIcon, StarFilledIcon } from './icons';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 16,
  interactive = false,
  onChange,
}) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const displayRating = hovered !== null ? hovered : rating;

  const handleClick = (star: number) => {
    if (interactive && onChange) {
      onChange(star);
    }
  };

  const handleMouseEnter = (star: number) => {
    if (interactive) {
      setHovered(star);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHovered(null);
    }
  };

  return (
    <div
      className="inline-flex items-center gap-0.5"
      onMouseLeave={handleMouseLeave}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`Rating: ${rating} out of ${maxStars}`}
    >
      {Array.from({ length: maxStars }, (_, i) => {
        const starIndex = i + 1;
        const fillAmount = Math.min(1, Math.max(0, displayRating - i));

        return (
          <button
            key={i}
            type="button"
            className={`relative inline-flex items-center justify-center ${
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
            }`}
            style={{ width: size, height: size }}
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            disabled={!interactive}
            tabIndex={interactive ? 0 : -1}
            aria-label={`${starIndex} star${starIndex !== 1 ? 's' : ''}`}
          >
            {/* Empty star base */}
            <StarIcon
              size={size}
              className="absolute inset-0 text-gray-600"
            />
            {/* Filled star with clip for partial fills */}
            {fillAmount > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillAmount * 100}%` }}
              >
                <StarFilledIcon
                  size={size}
                  className="text-os-yellow"
                  style={{ minWidth: size }}
                />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
