import React, { useMemo, useState, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CandlestickChartProps {
  currentPrice: number;
  allTimeLow?: number;
  allTimeHigh?: number;
  launchDate?: string;
}

interface OHLCCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

type Period = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const VIEW_WIDTH = 700;
const VIEW_HEIGHT = 300;
const PADDING = { top: 20, right: 16, bottom: 40, left: 60 };

const PERIOD_DAYS: Record<Period, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
  ALL: 0, // sentinel; computed from launchDate
};

const PERIODS: Period[] = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  return price.toFixed(6);
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const month = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();
  return `${month} ${day}`;
}

function formatDateFull(timestamp: number): string {
  const d = new Date(timestamp);
  const month = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `$${(vol / 1_000).toFixed(1)}K`;
  return `$${Math.round(vol)}`;
}

/** Simple deterministic hash from a number, returning 0..1 values via a seeded PRNG. */
function seededRandom(seed: number): () => number {
  let s = Math.abs(Math.round(seed * 100000)) | 0;
  if (s === 0) s = 42;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s & 0x7fffffff) / 2147483647;
  };
}

/* ------------------------------------------------------------------ */
/*  OHLC data generation                                               */
/* ------------------------------------------------------------------ */

function generateOHLC(
  currentPrice: number,
  atl: number | undefined,
  ath: number | undefined,
  launchDate: string | undefined,
  periodDays: number,
): OHLCCandle[] {
  const now = Date.now();
  const msPerDay = 86_400_000;

  // Resolve period
  let days = periodDays;
  if (days === 0 && launchDate) {
    const launch = new Date(launchDate).getTime();
    days = Math.max(7, Math.round((now - launch) / msPerDay));
  }
  if (days <= 0) days = 90;

  // Clamp to a reasonable maximum for rendering
  if (days > 1500) days = 1500;

  const numCandles = days;
  if (numCandles < 1) return [];

  const rand = seededRandom(currentPrice);

  // Starting price: prefer ATL if provided, else 30% of currentPrice
  const startPrice = atl && atl > 0 ? atl : currentPrice * 0.3;

  // Clamp range using ATH / ATL
  const priceCeiling = ath && ath > 0 ? ath * 1.05 : currentPrice * 3;
  const priceFloor = atl && atl > 0 ? atl * 0.95 : currentPrice * 0.05;

  const candles: OHLCCandle[] = [];
  let price = startPrice;

  for (let i = 0; i < numCandles; i++) {
    const t = now - (numCandles - 1 - i) * msPerDay;

    // Drift toward currentPrice
    const progress = numCandles > 1 ? i / (numCandles - 1) : 1;
    const target = startPrice + (currentPrice - startPrice) * progress;
    const drift = (target - price) * 0.05;

    // Random noise proportional to price
    const volatility = price * 0.04;
    const noise = (rand() - 0.5) * 2 * volatility;

    const open = price;
    let close = price + drift + noise;

    // Force last candle close to currentPrice
    if (i === numCandles - 1) {
      close = currentPrice;
    }

    // Clamp
    close = Math.max(priceFloor, Math.min(priceCeiling, close));

    const bodyLow = Math.min(open, close);
    const bodyHigh = Math.max(open, close);
    const wickSpread = Math.abs(close - open) * (0.3 + rand() * 0.7);
    const high = Math.min(priceCeiling, bodyHigh + wickSpread);
    const low = Math.max(priceFloor, bodyLow - wickSpread);

    // Volume: random between 100K and 10M, scaled by price
    const baseVol = 100_000 + rand() * 9_900_000;
    const volume = baseVol * (price / currentPrice);

    candles.push({ time: t, open, high, low, close, volume });
    price = close;
  }

  return candles;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  currentPrice,
  allTimeLow,
  allTimeHigh,
  launchDate,
}) => {
  const [period, setPeriod] = useState<Period>('3M');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  /* ---- resolve period days ---- */
  const periodDays = useMemo(() => {
    if (period === 'ALL' && launchDate) {
      const launch = new Date(launchDate).getTime();
      return Math.max(7, Math.round((Date.now() - launch) / 86_400_000));
    }
    return PERIOD_DAYS[period] || 90;
  }, [period, launchDate]);

  /* ---- generate OHLC data ---- */
  const candles = useMemo(
    () => generateOHLC(currentPrice, allTimeLow, allTimeHigh, launchDate, periodDays),
    [currentPrice, allTimeLow, allTimeHigh, launchDate, periodDays],
  );

  /* ---- derived chart geometry ---- */
  const plotWidth = VIEW_WIDTH - PADDING.left - PADDING.right;
  const totalHeight = VIEW_HEIGHT - PADDING.top - PADDING.bottom;
  const priceHeight = totalHeight * 0.7;
  const volumeHeight = totalHeight * 0.3;

  const chartData = useMemo(() => {
    if (candles.length < 3) return null;

    const prices = candles.flatMap((c) => [c.high, c.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const yMin = minPrice - priceRange * 0.05;
    const yMax = maxPrice + priceRange * 0.05;

    const maxVolume = Math.max(...candles.map((c) => c.volume));

    return { yMin, yMax, maxVolume };
  }, [candles]);

  /* ---- mouse interaction ---- */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!chartData || candles.length < 3) return;
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const svgX = (mouseX / rect.width) * VIEW_WIDTH;
      const relX = svgX - PADDING.left;

      if (relX < 0 || relX > plotWidth) {
        setHoveredIndex(null);
        return;
      }

      const candleStep = plotWidth / candles.length;
      const idx = Math.floor(relX / candleStep);
      setHoveredIndex(Math.max(0, Math.min(candles.length - 1, idx)));
    },
    [chartData, candles, plotWidth],
  );

  const handleMouseLeave = useCallback(() => setHoveredIndex(null), []);

  /* ---- early returns ---- */
  if (!currentPrice) return null;

  if (candles.length < 3) {
    return (
      <div className="w-full rounded-lg bg-os-surface border border-os-border p-6">
        <p className="text-os-text-secondary text-sm text-center">Not enough data</p>
      </div>
    );
  }

  if (!chartData) return null;

  const { yMin, yMax, maxVolume } = chartData;
  const yRange = yMax - yMin;

  /* ---- helpers for coordinate mapping ---- */
  const candleStep = plotWidth / candles.length;
  const bodyWidth = candleStep * 0.7;

  function priceToY(p: number): number {
    return PADDING.top + priceHeight - ((p - yMin) / yRange) * priceHeight;
  }

  function volumeToHeight(v: number): number {
    return maxVolume > 0 ? (v / maxVolume) * volumeHeight : 0;
  }

  function candleX(i: number): number {
    return PADDING.left + i * candleStep + candleStep / 2;
  }

  /* ---- y-axis ticks ---- */
  const yTickCount = 5;
  const yTicks = Array.from({ length: yTickCount }, (_, i) => yMin + (yRange * i) / (yTickCount - 1));

  /* ---- x-axis labels ---- */
  const xLabelCount = Math.min(6, candles.length);
  const xLabels: Array<{ label: string; x: number }> = [];
  for (let i = 0; i < xLabelCount; i++) {
    const idx = Math.round((i / (xLabelCount - 1)) * (candles.length - 1));
    xLabels.push({
      label: formatDate(candles[idx].time),
      x: candleX(idx),
    });
  }

  /* ---- hovered candle tooltip ---- */
  const hovered = hoveredIndex !== null ? candles[hoveredIndex] : null;
  const hoveredCX = hoveredIndex !== null ? candleX(hoveredIndex) : 0;

  const tooltipW = 160;
  const tooltipH = 108;
  let tooltipX = hoveredCX - tooltipW / 2;
  if (tooltipX < 4) tooltipX = 4;
  if (tooltipX + tooltipW > VIEW_WIDTH - 4) tooltipX = VIEW_WIDTH - tooltipW - 4;
  const tooltipY = Math.max(2, PADDING.top - 2);

  return (
    <div className="w-full">
      {/* Period selector */}
      <div className="flex items-center gap-1 mb-3">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              period === p
                ? 'bg-os-primary text-white'
                : 'bg-os-surface text-os-text-secondary hover:text-white'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chart */}
      <svg
        width="100%"
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Horizontal grid lines */}
        {yTicks.map((tick, i) => {
          const y = priceToY(tick);
          return (
            <line
              key={`grid-${i}`}
              x1={PADDING.left}
              y1={y}
              x2={VIEW_WIDTH - PADDING.right}
              y2={y}
              stroke="#1a2c42"
              strokeWidth={1}
            />
          );
        })}

        {/* Y-axis labels */}
        {yTicks.map((tick, i) => {
          const y = priceToY(tick);
          return (
            <text
              key={`ylabel-${i}`}
              x={PADDING.left - 8}
              y={y + 4}
              textAnchor="end"
              fill="#8A939B"
              fontSize={10}
            >
              {formatPrice(tick)}
            </text>
          );
        })}

        {/* X-axis labels */}
        {xLabels.map((label, i) => (
          <text
            key={`xlabel-${i}`}
            x={label.x}
            y={VIEW_HEIGHT - 6}
            textAnchor="middle"
            fill="#8A939B"
            fontSize={10}
          >
            {label.label}
          </text>
        ))}

        {/* Volume bars */}
        {candles.map((c, i) => {
          const isGreen = c.close >= c.open;
          const vH = volumeToHeight(c.volume);
          const vY = PADDING.top + priceHeight + (volumeHeight - vH);
          return (
            <rect
              key={`vol-${i}`}
              x={candleX(i) - bodyWidth / 2}
              y={vY}
              width={bodyWidth}
              height={vH}
              fill={isGreen ? 'rgba(34,197,94,0.20)' : 'rgba(239,68,68,0.20)'}
            />
          );
        })}

        {/* Candlesticks */}
        {candles.map((c, i) => {
          const isGreen = c.close >= c.open;
          const color = isGreen ? '#22c55e' : '#ef4444';
          const isHovered = hoveredIndex === i;
          const brighterColor = isGreen ? '#4ade80' : '#f87171';
          const cx = candleX(i);
          const bodyTop = priceToY(Math.max(c.open, c.close));
          const bodyBot = priceToY(Math.min(c.open, c.close));
          const bodyH = Math.max(1, bodyBot - bodyTop);

          return (
            <g key={`candle-${i}`}>
              {/* Wick */}
              <line
                x1={cx}
                y1={priceToY(c.high)}
                x2={cx}
                y2={priceToY(c.low)}
                stroke={isHovered ? brighterColor : color}
                strokeWidth={1}
              />
              {/* Body */}
              <rect
                x={cx - bodyWidth / 2}
                y={bodyTop}
                width={bodyWidth}
                height={bodyH}
                fill={isHovered ? brighterColor : color}
              />
            </g>
          );
        })}

        {/* Hover crosshair + tooltip */}
        {hovered && hoveredIndex !== null && (
          <g>
            {/* Vertical dashed line */}
            <line
              x1={hoveredCX}
              y1={PADDING.top}
              x2={hoveredCX}
              y2={PADDING.top + priceHeight + volumeHeight}
              stroke="#2081E2"
              strokeWidth={1}
              strokeDasharray="4 2"
              opacity={0.6}
            />

            {/* Tooltip background */}
            <rect
              x={tooltipX}
              y={tooltipY}
              width={tooltipW}
              height={tooltipH}
              rx={6}
              fill="#1B2838"
              stroke="#2081E2"
              strokeWidth={1}
              opacity={0.96}
            />

            {/* Date */}
            <text
              x={tooltipX + tooltipW / 2}
              y={tooltipY + 16}
              textAnchor="middle"
              fill="#8A939B"
              fontSize={10}
            >
              {formatDateFull(hovered.time)}
            </text>

            {/* O H L C labels */}
            <text x={tooltipX + 10} y={tooltipY + 32} fill="#8A939B" fontSize={10}>O</text>
            <text x={tooltipX + 22} y={tooltipY + 32} fill="#fff" fontSize={10}>
              {formatPrice(hovered.open)}
            </text>

            <text x={tooltipX + 10} y={tooltipY + 48} fill="#8A939B" fontSize={10}>H</text>
            <text x={tooltipX + 22} y={tooltipY + 48} fill="#fff" fontSize={10}>
              {formatPrice(hovered.high)}
            </text>

            <text x={tooltipX + 10} y={tooltipY + 64} fill="#8A939B" fontSize={10}>L</text>
            <text x={tooltipX + 22} y={tooltipY + 64} fill="#fff" fontSize={10}>
              {formatPrice(hovered.low)}
            </text>

            <text x={tooltipX + 10} y={tooltipY + 80} fill="#8A939B" fontSize={10}>C</text>
            <text x={tooltipX + 22} y={tooltipY + 80} fill="#fff" fontSize={10}>
              {formatPrice(hovered.close)}
            </text>

            <text x={tooltipX + 10} y={tooltipY + 96} fill="#8A939B" fontSize={10}>Vol</text>
            <text x={tooltipX + 32} y={tooltipY + 96} fill="#fff" fontSize={10}>
              {formatVolume(hovered.volume)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
