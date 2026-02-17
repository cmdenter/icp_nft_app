import { useMemo, useState } from 'react';
import { useNFTStore } from '../../store/nftStore';
import { formatNumber, formatPrice } from '../../utils/format';
import { getExtImageUrls } from '../../api/ext';
import { SafeImg } from '../SafeImg';
import { ICPTokenIcon } from '../icons';
import type { ExtTransaction } from '../../api/ext-market';
import type { CreatorInfo, CollectionEntry } from '../../types';

interface CreatorAnalyticsProps {
  creatorId: string;
  creator: CreatorInfo;
  collections: CollectionEntry[];
}

interface DayBucket {
  date: string;
  volume: number;
  count: number;
}

interface CollectionBreakdown {
  collection: CollectionEntry;
  volume: number;
  sales: number;
  avgPrice: number;
  floor: number;
}

interface TopItem {
  collectionId: string;
  collectionName: string;
  canisterId: string;
  tokenIndex: number;
  saleCount: number;
  totalVolume: number;
}

function buildDailyVolume(transactions: ExtTransaction[]): DayBucket[] {
  const map = new Map<string, { volume: number; count: number }>();
  for (const tx of transactions) {
    const d = new Date(tx.time);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const existing = map.get(key) || { volume: 0, count: 0 };
    map.set(key, { volume: existing.volume + tx.price, count: existing.count + 1 });
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, volume: data.volume, count: data.count }));
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const CreatorAnalytics = ({ collections }: CreatorAnalyticsProps) => {
  const externalTransactions = useNFTStore((s) => s.externalTransactions);
  const externalListings = useNFTStore((s) => s.externalListings);

  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Aggregate transactions across all creator collections
  const allTransactions = useMemo(() => {
    const txs: ExtTransaction[] = [];
    for (const c of collections) {
      const ctxs = externalTransactions.get(c.id) || [];
      txs.push(...ctxs);
    }
    return txs;
  }, [collections, externalTransactions]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const totalVolume = allTransactions.reduce((sum, tx) => sum + tx.price, 0);
    const totalSales = allTransactions.length;
    const avgPrice = totalSales > 0 ? totalVolume / totalSales : 0;

    // Floor price: min of all collection floor prices from listings
    let floor = Infinity;
    for (const c of collections) {
      const listings = externalListings.get(c.id);
      if (listings) {
        for (const [, listing] of listings) {
          if (listing.price < floor) floor = listing.price;
        }
      }
      if (c.floorPrice !== undefined && c.floorPrice > 0 && c.floorPrice < floor) {
        floor = c.floorPrice;
      }
    }
    if (floor === Infinity) floor = 0;

    const buyers = new Set<string>();
    const sellers = new Set<string>();
    for (const tx of allTransactions) {
      buyers.add(tx.buyer);
      sellers.add(tx.seller);
    }

    return {
      totalVolume,
      totalSales,
      avgPrice,
      floor,
      uniqueBuyers: buyers.size,
      uniqueSellers: sellers.size,
    };
  }, [allTransactions, collections, externalListings]);

  // Daily volume for chart
  const dailyVolume = useMemo(() => buildDailyVolume(allTransactions), [allTransactions]);

  // Chart metrics
  const chartMetrics = useMemo(() => {
    if (dailyVolume.length < 2) return null;
    const maxVol = Math.max(...dailyVolume.map((d) => d.volume));
    return { maxVol: maxVol || 1 };
  }, [dailyVolume]);

  // Collection breakdown
  const collectionBreakdown = useMemo(() => {
    const result: CollectionBreakdown[] = [];
    for (const c of collections) {
      const txs = externalTransactions.get(c.id) || [];
      const volume = txs.reduce((sum, tx) => sum + tx.price, 0);
      const sales = txs.length;
      const avgPrice = sales > 0 ? volume / sales : 0;

      let floor = Infinity;
      const listings = externalListings.get(c.id);
      if (listings) {
        for (const [, listing] of listings) {
          if (listing.price < floor) floor = listing.price;
        }
      }
      if (c.floorPrice !== undefined && c.floorPrice > 0 && c.floorPrice < floor) {
        floor = c.floorPrice;
      }
      if (floor === Infinity) floor = 0;

      result.push({ collection: c, volume, sales, avgPrice, floor });
    }
    return result.sort((a, b) => b.volume - a.volume);
  }, [collections, externalTransactions, externalListings]);

  // Top selling items (by sale count)
  const topItems = useMemo(() => {
    const itemMap = new Map<string, TopItem>();
    for (const c of collections) {
      const txs = externalTransactions.get(c.id) || [];
      for (const tx of txs) {
        const key = `${c.id}-${tx.tokenIndex}`;
        const existing = itemMap.get(key);
        if (existing) {
          existing.saleCount += 1;
          existing.totalVolume += tx.price;
        } else {
          itemMap.set(key, {
            collectionId: c.id,
            collectionName: c.name,
            canisterId: c.canisterId,
            tokenIndex: tx.tokenIndex,
            saleCount: 1,
            totalVolume: tx.price,
          });
        }
      }
    }
    return Array.from(itemMap.values())
      .sort((a, b) => b.saleCount - a.saleCount)
      .slice(0, 5);
  }, [collections, externalTransactions]);

  // SVG chart dimensions
  const viewWidth = 600;
  const viewHeight = 200;
  const chartPadding = { top: 16, right: 16, bottom: 32, left: 56 };
  const plotWidth = viewWidth - chartPadding.left - chartPadding.right;
  const plotHeight = viewHeight - chartPadding.top - chartPadding.bottom;

  const statCards = [
    { label: 'Total Volume', value: `${formatPrice(summaryStats.totalVolume)} ICP` },
    { label: 'Total Sales', value: formatNumber(summaryStats.totalSales) },
    { label: 'Avg Price', value: `${formatPrice(summaryStats.avgPrice)} ICP` },
    { label: 'Floor Price', value: summaryStats.floor > 0 ? `${formatPrice(summaryStats.floor)} ICP` : '--' },
    { label: 'Unique Buyers', value: formatNumber(summaryStats.uniqueBuyers) },
    { label: 'Unique Sellers', value: formatNumber(summaryStats.uniqueSellers) },
  ];

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-os-surface border border-os-border p-4"
          >
            <div className="text-[11px] uppercase font-bold text-os-text-secondary tracking-wider mb-1">
              {card.label}
            </div>
            <div className="text-xl font-bold text-white">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Sales Over Time */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3">Sales Over Time</h3>
        <div className="rounded-xl bg-os-surface border border-os-border p-4">
          {dailyVolume.length < 2 ? (
            <p className="text-center text-os-text-secondary py-8">
              Not enough data for volume chart
            </p>
          ) : chartMetrics ? (
            <div className="w-full relative" style={{ aspectRatio: '3/1' }}>
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${viewWidth} ${viewHeight}`}
                preserveAspectRatio="xMidYMid meet"
                className="overflow-visible"
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Grid lines + Y labels */}
                {Array.from({ length: 4 }).map((_, i) => {
                  const val = (chartMetrics.maxVol / 4) * (i + 1);
                  const y = chartPadding.top + plotHeight - (val / chartMetrics.maxVol) * plotHeight;
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

                {/* X-axis labels */}
                {[0, Math.floor(dailyVolume.length / 2), dailyVolume.length - 1]
                  .filter((idx, pos, arr) => arr.indexOf(idx) === pos)
                  .map((idx) => {
                    const totalBarSpace = plotWidth / dailyVolume.length;
                    const barWidth = Math.max(1, totalBarSpace - 2);
                    const x = chartPadding.left + idx * totalBarSpace + 1 + barWidth / 2;
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
                  const cx = chartPadding.left + hoveredBar * totalBarSpace + 1 + barWidth / 2;

                  const tooltipWidth = 140;
                  const tooltipHeight = 50;
                  let tooltipX = cx - tooltipWidth / 2;
                  if (tooltipX < 4) tooltipX = 4;
                  if (tooltipX + tooltipWidth > viewWidth - 4)
                    tooltipX = viewWidth - tooltipWidth - 4;
                  const barTopY = chartPadding.top + plotHeight - (day.volume / chartMetrics.maxVol) * plotHeight;
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
                        y={tooltipY + 30}
                        textAnchor="middle"
                        fill="#8A939B"
                        fontSize={10}
                      >
                        {day.count} sale{day.count !== 1 ? 's' : ''}
                      </text>
                      <text
                        x={tooltipX + tooltipWidth / 2}
                        y={tooltipY + 44}
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
      </div>

      {/* Collection Breakdown */}
      {collectionBreakdown.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Collection Breakdown</h3>
          <div className="rounded-xl bg-os-surface border border-os-border overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-5 gap-2 px-4 py-2.5 border-b border-os-border text-[11px] uppercase font-bold text-os-text-secondary tracking-wider">
              <div className="col-span-1">Collection</div>
              <div className="text-right">Volume</div>
              <div className="text-right">Sales</div>
              <div className="text-right">Avg Price</div>
              <div className="text-right">Floor</div>
            </div>
            {/* Rows */}
            {collectionBreakdown.map((row) => (
              <div
                key={row.collection.id}
                className="grid grid-cols-5 gap-2 px-4 py-3 border-b border-os-border/50 last:border-b-0 hover:bg-os-card/30 transition-colors"
              >
                <div className="col-span-1 text-sm font-semibold text-white truncate">
                  {row.collection.name}
                </div>
                <div className="text-sm text-white text-right flex items-center justify-end gap-1">
                  <ICPTokenIcon size={12} />
                  {formatPrice(row.volume)}
                </div>
                <div className="text-sm text-os-text-secondary text-right">
                  {formatNumber(row.sales)}
                </div>
                <div className="text-sm text-os-text-secondary text-right">
                  {row.avgPrice > 0 ? `${formatPrice(row.avgPrice)}` : '--'}
                </div>
                <div className="text-sm text-os-text-secondary text-right">
                  {row.floor > 0 ? `${formatPrice(row.floor)}` : '--'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Selling Items */}
      {topItems.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Top Selling Items</h3>
          <div className="rounded-xl bg-os-surface border border-os-border overflow-hidden divide-y divide-os-border/50">
            {topItems.map((item, rank) => (
              <TopItemRow key={`${item.collectionId}-${item.tokenIndex}`} item={item} rank={rank + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function TopItemRow({ item, rank }: { item: TopItem; rank: number }) {
  const imgUrls = useMemo(
    () => getExtImageUrls(item.canisterId, item.tokenIndex),
    [item.canisterId, item.tokenIndex]
  );

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-os-card/30 transition-colors">
      <span className="text-sm font-bold text-os-text-secondary w-6 text-center shrink-0">
        {rank}
      </span>
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-os-card shrink-0">
        <SafeImg
          urls={imgUrls}
          alt={`${item.collectionName} #${item.tokenIndex}`}
          fallback={`#${item.tokenIndex}`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">
          {item.collectionName} #{item.tokenIndex}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-white">{item.saleCount} sale{item.saleCount !== 1 ? 's' : ''}</p>
        <p className="text-xs text-os-text-secondary flex items-center justify-end gap-1">
          <ICPTokenIcon size={10} />
          {formatPrice(item.totalVolume)}
        </p>
      </div>
    </div>
  );
}
