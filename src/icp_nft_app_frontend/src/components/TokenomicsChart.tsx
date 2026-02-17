import React from 'react';

interface TokenomicsChartProps {
  totalSupply?: number;
  circulatingSupply?: number;
  maxSupply?: number;
  description?: string;
}

function formatSupply(n: number | undefined | null): string {
  if (n == null) return '--';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export const TokenomicsChart: React.FC<TokenomicsChartProps> = ({
  totalSupply,
  circulatingSupply,
  maxSupply,
  description,
}) => {
  const circulating = circulatingSupply ?? 0;
  const total = totalSupply ?? 1;
  const pct = total > 0 ? Math.min((circulating / total) * 100, 100) : 0;

  // SVG donut ring calculations
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const circulatingArc = (pct / 100) * circumference;
  const remainingArc = circumference - circulatingArc;

  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-4">Tokenomics</h3>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Chart */}
        <div className="flex items-center justify-center shrink-0">
          <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
            {/* Background circle (remaining) */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="20"
            />
            {/* Circulating arc */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#2081E2"
              strokeWidth="20"
              strokeDasharray={`${circulatingArc} ${remainingArc}`}
              strokeDashoffset="0"
              strokeLinecap="round"
              className="transition-all duration-700"
            />
            {/* Center text (rotated back to normal) */}
            <text
              x="100"
              y="95"
              textAnchor="middle"
              fill="white"
              fontSize="28"
              fontWeight="bold"
              transform="rotate(90, 100, 100)"
            >
              {pct.toFixed(1)}%
            </text>
            <text
              x="100"
              y="118"
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize="12"
              transform="rotate(90, 100, 100)"
            >
              Circulating
            </text>
          </svg>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-4">
          {/* Circulating Supply */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-os-text-secondary">Circulating Supply</span>
              <span className="text-white font-medium">{formatSupply(circulatingSupply)}</span>
            </div>
            <div className="h-2 rounded-full bg-os-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-os-primary transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Total Supply */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-os-text-secondary">Total Supply</span>
              <span className="text-white font-medium">{formatSupply(totalSupply)}</span>
            </div>
            <div className="h-2 rounded-full bg-os-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-white/20 transition-all duration-500"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Max Supply */}
          {maxSupply != null && (
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-os-text-secondary">Max Supply</span>
                <span className="text-white font-medium">{formatSupply(maxSupply)}</span>
              </div>
              <div className="h-2 rounded-full bg-os-surface overflow-hidden">
                <div
                  className="h-full rounded-full bg-os-text-secondary/30 transition-all duration-500"
                  style={{ width: total > 0 ? `${Math.min((total / maxSupply) * 100, 100)}%` : '0%' }}
                />
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-os-primary" />
              <span className="text-xs text-os-text-secondary">Circulating</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <span className="text-xs text-os-text-secondary">Total</span>
            </div>
            {maxSupply != null && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-os-text-secondary/30" />
                <span className="text-xs text-os-text-secondary">Max</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-os-text-secondary mt-4 leading-relaxed">{description}</p>
      )}
    </div>
  );
};
