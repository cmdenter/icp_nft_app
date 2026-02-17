import React, { useMemo, useState } from 'react';
import { PriceHistory } from './PriceHistory';
import { StatsBar } from './StatsBar';
import { formatPrice, formatNumber } from '../utils/format';
import type { ExtCollectionStats } from '../types';
import type { ExtTransaction } from '../api/ext-market';

interface CollectionAnalyticsProps {
  transactions: ExtTransaction[];
  stats: ExtCollectionStats | null;
  collectionName: string;
}

interface DayBucket {
  date: string;
  volume: number;
}

function buildDailyVolume(transactions: ExtTransaction[]): DayBucket[] {
  const map = new Map<string, number>();
  for (const tx of transactions) {
    const d = new Date(tx.time);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    map.set(key, (map.get(key) ?? 0) + tx.price);
  }
  const entries = Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, volume]) => ({ date, volume }));
  return entries;
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const CollectionAnalytics: React.FC<CollectionAnalyticsProps> = ({
  transactions,
  stats,
  collectionName: _collectionName,
}) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const dailyVolume = useMemo(() => buildDailyVolume(transactions), [transactions]);

  // --- Stats cards ---
  const statCards = useMemo(() => {
    if (!stats) return null;
    return [
      { label: 'Total Volume', value: `${stats.totalVolume.toFixed(2)} ICP` },
      { label: 'Total Sales', value: formatNumber(stats.salesCount) },
      { label: 'Avg Price', value: `${stats.averagePrice.toFixed(2)} ICP` },
      { label: 'Highest Sale', value: `${stats.highestSale.toFixed(2)} ICP` },
      { label: 'Unique Buyers', value: formatNumber(stats.uniqueBuyers) },
      { label: 'Unique Sellers', value: formatNumber(stats.uniqueSellers) },
    ];
  }, [stats]);

  // --- Volume chart computation ---
  const chartMetrics = useMemo(() => {
    if (dailyVolume.length < 2) return null;

    const maxVol = Math.max(...dailyVolume.map((d) => d.volume));
    const safeMax = maxVol || 1;

    return { maxVol: safeMax };
  }, [dailyVolume]);

  const viewWidth = 600;
  const viewHeight = 200;
  const chartPadding = { top: 16, right: 16, bottom: 32, left: 56 };
  const plotWidth = viewWidth - chartPadding.left - chartPadding.right;
  const plotHeight = viewHeight - chartPadding.top - chartPadding.bottom;

  // Price change arrow/color
  const priceChangeDisplay = useMemo(() => {
    if (!stats) return null;
    const pct = stats.priceChange24h;
    const isPositive = pct >= 0;
    const arrow = isPositive ? '\u25B2' : '\u25BC';
    const color = isPositive ? 'text-green-400' : 'text-red-400';
    return { pct, arrow, color, label: `${arrow} ${Math.abs(pct).toFixed(1)}%` };
  }, [stats]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      {/* StatsBar */}
      {stats && (
        <div className="mb-6">
          <StatsBar stats={[
            { label: 'Total Volume', value: `${stats.totalVolume.toFixed(2)} ICP` },
            { label: 'Total Sales', value: formatNumber(stats.salesCount) },
            { label: 'Avg Price', value: `${stats.averagePrice.toFixed(4)} ICP` },
            { label: 'Highest Sale', value: `${stats.highestSale.toFixed(4)} ICP`, color: 'text-os-green' },
            { label: 'Unique Buyers', value: formatNumber(stats.uniqueBuyers) },
            { label: 'Unique Sellers', value: formatNumber(stats.uniqueSellers) },
          ]} />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {statCards
          ? statCards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-os-border/40 bg-os-surface p-4"
              >
                <div className="text-[11px] uppercase font-bold text-os-text-secondary tracking-wider mb-1">
                  {card.label}
                </div>
                <div className="text-xl font-bold text-white">{card.value}</div>
              </div>
            ))
          : Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-os-border/40 bg-os-surface p-4"
              >
                <div className="text-[11px] uppercase font-bold text-os-text-secondary tracking-wider mb-1">
                  &nbsp;
                </div>
                <div className="skeleton h-7 w-24 rounded" />
              </div>
            ))}
      </div>

      {/* 24h Metrics Row */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="px-4 py-2.5 rounded-xl border border-os-border/30 bg-os-card/50">
          <span className="text-[11px] uppercase font-bold text-os-text-secondary tracking-wider mr-2">
            24h Volume
          </span>
          <span className="text-sm font-bold text-white">
            {stats ? `${formatPrice(stats.last24hVolume)} ICP` : '--'}
          </span>
        </div>
        <div className="px-4 py-2.5 rounded-xl border border-os-border/30 bg-os-card/50">
          <span className="text-[11px] uppercase font-bold text-os-text-secondary tracking-wider mr-2">
            24h Sales
          </span>
          <span className="text-sm font-bold text-white">
            {stats ? formatNumber(stats.last24hSales) : '--'}
          </span>
        </div>
        <div className="px-4 py-2.5 rounded-xl border border-os-border/30 bg-os-card/50">
          <span className="text-[11px] uppercase font-bold text-os-text-secondary tracking-wider mr-2">
            Price Change
          </span>
          {priceChangeDisplay ? (
            <span className={`text-sm font-bold ${priceChangeDisplay.color}`}>
              {priceChangeDisplay.label}
            </span>
          ) : (
            <span className="text-sm font-bold text-white">--</span>
          )}
        </div>
      </div>

      {/* Price History Section */}
      <h3 className="text-lg font-bold text-white mb-3">Price History</h3>
      <div className="rounded-xl border border-os-border/40 bg-os-surface p-4 mb-8">
        <PriceHistory transactions={transactions} />
      </div>

      {/* Volume Chart Section */}
      <h3 className="text-lg font-bold text-white mb-3 mt-8">Daily Volume</h3>
      <div className="rounded-xl border border-os-border/40 bg-os-surface p-4">
        {dailyVolume.length < 2 ? (
          <p className="text-center text-os-text-secondary py-8">
            Not enough data for volume chart
          </p>
        ) : chartMetrics ? (
          <div className="w-full relative">
            <svg
              width="100%"
              height={viewHeight}
              viewBox={`0 0 ${viewWidth} ${viewHeight}`}
              preserveAspectRatio="xMidYMid meet"
              className="overflow-visible"
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Horizontal grid lines + Y labels */}
              {Array.from({ length: 4 }).map((_, i) => {
                const val = (chartMetrics.maxVol / 4) * (i + 1);
                const y =
                  chartPadding.top +
                  plotHeight -
                  (val / chartMetrics.maxVol) * plotHeight;
                return (
                  <g key={`grid-${i}`}>
                    <line
                      x1={chartPadding.left}
                      y1={y}
                      x2={viewWidth - chartPadding.right}
                      y2={y}
                      stroke="#1a2c42"
                      strokeWidth={1}
                    />
                    <text
                      x={chartPadding.left - 8}
                      y={y + 4}
                      textAnchor="end"
                      fill="#8A939B"
                      fontSize={10}
                    >
                      {formatPrice(val)}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {dailyVolume.map((day, i) => {
                const barGap = 2;
                const totalBarSpace = plotWidth / dailyVolume.length;
                const barWidth = Math.max(1, totalBarSpace - barGap);
                const barHeight = (day.volume / chartMetrics.maxVol) * plotHeight;
                const x = chartPadding.left + i * totalBarSpace + barGap / 2;
                const y = chartPadding.top + plotHeight - barHeight;
                const isHovered = hoveredBar === i;

                return (
                  <rect
                    key={day.date}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(0, barHeight)}
                    rx={Math.min(3, barWidth / 2)}
                    fill={isHovered ? '#1868B7' : '#2081E2'}
                    className="transition-colors duration-100"
                    onMouseEnter={() => setHoveredBar(i)}
                  />
                );
              })}

              {/* X-axis labels: first, middle, last */}
              {[0, Math.floor(dailyVolume.length / 2), dailyVolume.length - 1]
                .filter((idx, pos, arr) => arr.indexOf(idx) === pos)
                .map((idx) => {
                  const totalBarSpace = plotWidth / dailyVolume.length;
                  const barWidth = Math.max(1, totalBarSpace - 2);
                  const x =
                    chartPadding.left + idx * totalBarSpace + 1 + barWidth / 2;
                  return (
                    <text
                      key={`xlabel-${idx}`}
                      x={x}
                      y={viewHeight - 4}
                      textAnchor="middle"
                      fill="#8A939B"
                      fontSize={10}
                    >
                      {formatShortDate(dailyVolume[idx].date)}
                    </text>
                  );
                })}

              {/* Hover tooltip */}
              {hoveredBar !== null && dailyVolume[hoveredBar] && (() => {
                const day = dailyVolume[hoveredBar];
                const totalBarSpace = plotWidth / dailyVolume.length;
                const barWidth = Math.max(1, totalBarSpace - 2);
                const cx =
                  chartPadding.left +
                  hoveredBar * totalBarSpace +
                  1 +
                  barWidth / 2;

                const tooltipWidth = 130;
                const tooltipHeight = 40;
                let tooltipX = cx - tooltipWidth / 2;
                if (tooltipX < 4) tooltipX = 4;
                if (tooltipX + tooltipWidth > viewWidth - 4)
                  tooltipX = viewWidth - tooltipWidth - 4;
                const barTopY =
                  chartPadding.top +
                  plotHeight -
                  (day.volume / chartMetrics.maxVol) * plotHeight;
                const tooltipY = Math.max(2, barTopY - tooltipHeight - 8);

                return (
                  <g>
                    <rect
                      x={tooltipX}
                      y={tooltipY}
                      width={tooltipWidth}
                      height={tooltipHeight}
                      rx={8}
                      fill="#1B2838"
                      stroke="#2081E2"
                      strokeWidth={1}
                      opacity={0.95}
                    />
                    <text
                      x={tooltipX + tooltipWidth / 2}
                      y={tooltipY + 16}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={11}
                      fontWeight="bold"
                    >
                      {formatPrice(day.volume)} ICP
                    </text>
                    <text
                      x={tooltipX + tooltipWidth / 2}
                      y={tooltipY + 32}
                      textAnchor="middle"
                      fill="#8A939B"
                      fontSize={10}
                    >
                      {formatShortDate(day.date)}
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>
        ) : null}
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-os-text-secondary/50 mt-6 text-center">
        Analytics based on the most recent 500 transactions
      </p>
    </div>
  );
};
