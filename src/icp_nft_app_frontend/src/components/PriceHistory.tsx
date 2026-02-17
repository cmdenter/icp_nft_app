import React, { useMemo, useState, useCallback } from 'react';

interface Transaction {
  price: number;
  time: number;
  buyer: string;
  seller: string;
}

interface PriceHistoryProps {
  transactions: Transaction[];
}

const CHART_HEIGHT = 200;
const PADDING = { top: 20, right: 16, bottom: 32, left: 56 };

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const month = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();
  return `${month} ${day}`;
}

function formatDateFull(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(price: number): string {
  if (price >= 1000) return price.toFixed(0);
  if (price >= 10) return price.toFixed(1);
  if (price >= 1) return price.toFixed(2);
  return price.toFixed(4);
}

export const PriceHistory: React.FC<PriceHistoryProps> = ({ transactions }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const sorted = useMemo(() => {
    if (transactions.length === 0) return [];
    return [...transactions].sort((a, b) => a.time - b.time);
  }, [transactions]);

  const chartData = useMemo(() => {
    if (sorted.length === 0) return null;

    const prices = sorted.map((t) => t.price);
    const times = sorted.map((t) => t.time);

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    // Add some padding to price range
    const priceRange = maxPrice - minPrice || 1;
    const yMin = minPrice - priceRange * 0.1;
    const yMax = maxPrice + priceRange * 0.1;
    const timeRange = maxTime - minTime || 1;

    return { prices, times, yMin, yMax, minTime, timeRange, minPrice, maxPrice };
  }, [sorted]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!chartData || sorted.length <= 1) return;

      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const svgWidth = rect.width;
      const mouseX = e.clientX - rect.left;

      const plotWidth = svgWidth - PADDING.left - PADDING.right;
      const relX = (mouseX - PADDING.left) / plotWidth;

      if (relX < 0 || relX > 1) {
        setHoveredIndex(null);
        return;
      }

      // Find nearest point
      let closest = 0;
      let closestDist = Infinity;
      for (let i = 0; i < sorted.length; i++) {
        const normalizedX = (sorted[i].time - chartData.minTime) / chartData.timeRange;
        const dist = Math.abs(normalizedX - relX);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      }
      setHoveredIndex(closest);
    },
    [chartData, sorted],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  // Edge case: no transactions
  if (transactions.length === 0) return null;

  // Edge case: single transaction
  if (sorted.length === 1) {
    const tx = sorted[0];
    return (
      <div className="w-full" style={{ height: CHART_HEIGHT }}>
        <svg
          width="100%"
          height={CHART_HEIGHT}
          viewBox={`0 0 400 ${CHART_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          className="overflow-visible"
        >
          <circle cx={200} cy={CHART_HEIGHT / 2} r={5} fill="#2081E2" />
          <text
            x={200}
            y={CHART_HEIGHT / 2 - 14}
            textAnchor="middle"
            fill="#8A939B"
            fontSize={12}
          >
            {formatPrice(tx.price)} ICP
          </text>
          <text
            x={200}
            y={CHART_HEIGHT / 2 + 24}
            textAnchor="middle"
            fill="#8A939B"
            fontSize={11}
          >
            {formatDate(tx.time)}
          </text>
        </svg>
      </div>
    );
  }

  if (!chartData) return null;

  const { yMin, yMax, minTime, timeRange } = chartData;
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  // We use viewBox="0 0 600 200" for responsive scaling
  const viewWidth = 600;

  const plotWidth = viewWidth - PADDING.left - PADDING.right;

  // Map data to SVG coordinates
  const points = sorted.map((tx, i) => {
    const x = PADDING.left + ((tx.time - minTime) / timeRange) * plotWidth;
    const y = PADDING.top + plotHeight - ((tx.price - yMin) / (yMax - yMin)) * plotHeight;
    return { x, y, tx, index: i };
  });

  // Build path string
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  // Build gradient fill path (close under the line)
  const fillPath =
    linePath +
    ` L${points[points.length - 1].x},${PADDING.top + plotHeight}` +
    ` L${points[0].x},${PADDING.top + plotHeight} Z`;

  // Y-axis tick values (4-5 ticks)
  const yRange = yMax - yMin;
  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => yMin + (yRange * i) / tickCount);

  // X-axis labels (up to 5 evenly spaced)
  const xLabelCount = Math.min(5, sorted.length);
  const xLabels: Array<{ time: number; x: number }> = [];
  for (let i = 0; i < xLabelCount; i++) {
    const dataIndex = Math.round((i / (xLabelCount - 1)) * (sorted.length - 1));
    const tx = sorted[dataIndex];
    const x = PADDING.left + ((tx.time - minTime) / timeRange) * plotWidth;
    xLabels.push({ time: tx.time, x });
  }

  const gradientId = 'price-gradient-fill';

  return (
    <div className="w-full" style={{ height: CHART_HEIGHT }}>
      <svg
        width="100%"
        height={CHART_HEIGHT}
        viewBox={`0 0 ${viewWidth} ${CHART_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2081E2" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#2081E2" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {yTicks.map((tick, i) => {
          const y = PADDING.top + plotHeight - ((tick - yMin) / yRange) * plotHeight;
          return (
            <line
              key={`grid-${i}`}
              x1={PADDING.left}
              y1={y}
              x2={viewWidth - PADDING.right}
              y2={y}
              stroke="#1a2c42"
              strokeWidth={1}
            />
          );
        })}

        {/* Y-axis labels */}
        {yTicks.map((tick, i) => {
          const y = PADDING.top + plotHeight - ((tick - yMin) / yRange) * plotHeight;
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
            y={CHART_HEIGHT - 4}
            textAnchor="middle"
            fill="#8A939B"
            fontSize={10}
          >
            {formatDate(label.time)}
          </text>
        ))}

        {/* Gradient fill under line */}
        <path d={fillPath} fill={`url(#${gradientId})`} />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#2081E2" strokeWidth={2} />

        {/* Data points */}
        {points.map((p) => (
          <circle
            key={p.index}
            cx={p.x}
            cy={p.y}
            r={hoveredIndex === p.index ? 5 : 3}
            fill="#2081E2"
            stroke={hoveredIndex === p.index ? '#fff' : 'none'}
            strokeWidth={hoveredIndex === p.index ? 2 : 0}
            className="transition-all duration-100"
          />
        ))}

        {/* Tooltip on hover */}
        {hoveredIndex !== null && points[hoveredIndex] && (() => {
          const p = points[hoveredIndex];
          const tooltipWidth = 140;
          const tooltipHeight = 44;
          // Keep tooltip inside viewBox
          let tooltipX = p.x - tooltipWidth / 2;
          if (tooltipX < 4) tooltipX = 4;
          if (tooltipX + tooltipWidth > viewWidth - 4) tooltipX = viewWidth - tooltipWidth - 4;
          const tooltipY = p.y - tooltipHeight - 12;
          const clampedY = Math.max(2, tooltipY);

          return (
            <g>
              {/* Vertical line */}
              <line
                x1={p.x}
                y1={PADDING.top}
                x2={p.x}
                y2={PADDING.top + plotHeight}
                stroke="#2081E2"
                strokeWidth={1}
                strokeDasharray="4 2"
                opacity={0.5}
              />
              {/* Tooltip background */}
              <rect
                x={tooltipX}
                y={clampedY}
                width={tooltipWidth}
                height={tooltipHeight}
                rx={8}
                fill="#1B2838"
                stroke="#2081E2"
                strokeWidth={1}
                opacity={0.95}
              />
              {/* Price text */}
              <text
                x={tooltipX + tooltipWidth / 2}
                y={clampedY + 18}
                textAnchor="middle"
                fill="#fff"
                fontSize={12}
                fontWeight="bold"
              >
                {formatPrice(p.tx.price)} ICP
              </text>
              {/* Date text */}
              <text
                x={tooltipX + tooltipWidth / 2}
                y={clampedY + 34}
                textAnchor="middle"
                fill="#8A939B"
                fontSize={10}
              >
                {formatDateFull(p.tx.time)}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
};
