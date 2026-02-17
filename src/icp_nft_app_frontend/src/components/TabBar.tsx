import React from 'react';
import { useNFTStore } from '../store/nftStore';
import type { CollectionTab } from '../types';

const tabs: { key: CollectionTab; label: string }[] = [
  { key: 'items', label: 'Items' },
  { key: 'activity', label: 'Activity' },
];

export const TabBar: React.FC = () => {
  const activeTab = useNFTStore((s) => s.activeTab);
  const setActiveTab = useNFTStore((s) => s.setActiveTab);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 border-b border-os-border overflow-x-auto hide-scrollbar">
      <div className="flex gap-4 sm:gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative pb-4 pt-2 text-sm font-bold transition-colors hover:bg-os-surface/30 rounded-t-lg ${
              activeTab === tab.key
                ? 'text-white'
                : 'text-os-text-secondary hover:text-white'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-os-primary to-purple-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
