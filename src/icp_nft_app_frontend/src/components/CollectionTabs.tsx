import React from 'react';
import type { ExtCollectionTab } from '../types';

interface CollectionTabsProps {
  activeTab: ExtCollectionTab;
  setActiveTab: (tab: ExtCollectionTab) => void;
  txCount: number;
  chatCount?: number;
}

const tabs: { key: ExtCollectionTab; label: string }[] = [
  { key: 'items', label: 'Items' },
  { key: 'activity', label: 'Activity' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'chat', label: 'Chat' },
];

export const CollectionTabs: React.FC<CollectionTabsProps> = ({
  activeTab,
  setActiveTab,
  txCount,
  chatCount,
}) => {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 border-b border-os-border/30">
      <div className="flex items-center gap-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-5 py-3 text-sm font-semibold transition-colors ${
                isActive ? 'text-white' : 'text-os-text-secondary hover:text-white'
              }`}
            >
              {tab.label}
              {tab.key === 'activity' && txCount > 0 && (
                <span className="ml-1.5 text-[10px] font-bold bg-os-primary/20 text-os-primary px-1.5 py-0.5 rounded-full">
                  {txCount}
                </span>
              )}
              {tab.key === 'chat' && chatCount != null && chatCount > 0 && (
                <span className="ml-1.5 text-[10px] font-bold bg-os-primary/20 text-os-primary px-1.5 py-0.5 rounded-full">
                  {chatCount}
                </span>
              )}
              {isActive && (
                <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-gradient-to-r from-os-primary to-purple-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
