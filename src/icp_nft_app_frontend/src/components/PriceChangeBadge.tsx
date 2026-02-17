import React from 'react';

interface PriceChangeBadgeProps {
  change: number | undefined | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'text-[11px] px-1.5 py-0.5 gap-0.5',
  md: 'text-xs px-2 py-1 gap-1',
  lg: 'text-sm px-2.5 py-1 gap-1',
};

const arrowSize = { sm: 10, md: 12, lg: 14 };

export const PriceChangeBadge: React.FC<PriceChangeBadgeProps> = ({ change, size = 'md' }) => {
  if (change == null) return null;
  const isPositive = change >= 0;

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-lg ${sizeClasses[size]} ${
        isPositive
          ? 'bg-os-green/10 text-os-green'
          : 'bg-os-secondary/10 text-os-secondary'
      }`}
    >
      <svg
        width={arrowSize[size]}
        height={arrowSize[size]}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transform: isPositive ? undefined : 'rotate(180deg)' }}
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
      {Math.abs(change).toFixed(2)}%
    </span>
  );
};
