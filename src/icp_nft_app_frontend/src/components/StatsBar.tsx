import React from 'react';

interface StatsBarProps {
  stats: { label: string; value: string; color?: string }[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  return (
    <div className="rounded-xl bg-os-surface/60 border border-os-border/30 px-1 py-2">
      <div className="flex items-center overflow-x-auto hide-scrollbar">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`shrink-0 px-4 py-1 flex flex-col${
              i < stats.length - 1 ? ' border-r border-os-border/30' : ''
            }`}
          >
            <span className="text-[10px] text-os-text-secondary uppercase tracking-wider font-semibold">
              {stat.label}
            </span>
            <span className={`text-sm font-bold ${stat.color ?? 'text-white'}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
