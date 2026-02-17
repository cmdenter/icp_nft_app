import React, { useEffect, useState } from 'react';
import { useNFTStore } from '../store/nftStore';
import { NFTCard } from '../components/NFTCard';
import { SkeletonGrid } from '../components/Skeleton';
import { UserIcon, CopyIcon } from '../components/icons';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { RecentlyViewed } from '../components/RecentlyViewed';

type ProfileTab = 'collected' | 'created' | 'activity';

const Profile: React.FC = () => {
  const principal = useNFTStore((s) => s.principal);
  const profileTokens = useNFTStore((s) => s.profileTokens);
  const profileLoading = useNFTStore((s) => s.profileLoading);
  const loadProfileTokens = useNFTStore((s) => s.loadProfileTokens);
  const [activeTab, setActiveTab] = useState<ProfileTab>('collected');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (principal) loadProfileTokens(principal);
  }, [principal, loadProfileTokens]);

  const truncated =
    principal.length > 20
      ? principal.slice(0, 10) + '...' + principal.slice(-6)
      : principal;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(principal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: 'collected', label: `Collected ${profileTokens.length}` },
    { key: 'created', label: 'Created' },
    { key: 'activity', label: 'Activity' },
  ];

  return (
    <div>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Profile' }]} />
      </div>
      {/* Banner */}
      <div className="h-[260px] bg-gradient-to-r from-os-primary/20 via-purple-900/15 via-60% to-indigo-900/10" />

      {/* Profile info */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="-mt-14 mb-6">
          {/* Avatar */}
          <div className="w-[128px] h-[128px] rounded-full bg-os-surface border-[5px] border-os-bg flex items-center justify-center shadow-xl ring-2 ring-os-primary/20 shadow-2xl glow-pulse">
            <UserIcon size={40} className="text-os-text-secondary" />
          </div>
        </div>

        {/* Name + address */}
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Unnamed</h1>
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-sm text-os-text-secondary hover:text-white hover:bg-os-card transition-colors bg-os-surface rounded-lg px-4 py-2"
          >
            <span className="font-mono">{truncated}</span>
            <CopyIcon size={12} />
          </button>
          {copied && <span className="text-xs text-os-green">Copied!</span>}
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-6">
          <div className="rounded-xl px-4 py-2 hover:bg-os-surface transition-colors">
            <p className="text-2xl font-bold text-white">{profileTokens.length}</p>
            <p className="text-xs text-os-text-secondary">Items</p>
          </div>
          <div className="rounded-xl px-4 py-2 hover:bg-os-surface transition-colors">
            <p className="text-2xl font-bold text-white">1</p>
            <p className="text-xs text-os-text-secondary">Collections</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-os-border mb-6">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative pb-4 pt-3 px-1 text-sm font-bold transition-colors ${
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

        {/* Content */}
        {activeTab === 'collected' && (
          <>
            {profileLoading ? (
              <SkeletonGrid count={8} />
            ) : profileTokens.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-8">
                {profileTokens.map((item) => (
                  <NFTCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-28">
                <p className="text-lg text-os-text-secondary/80 mb-3">No NFTs yet</p>
                <p className="text-sm text-os-text-secondary/60">Mint or receive NFTs to see them here</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'created' && (
          <div className="text-center py-28">
            <p className="text-lg text-os-text-secondary/80 mb-3">Nothing created yet</p>
            <p className="text-sm text-os-text-secondary/60">Items you create will appear here</p>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="text-center py-28">
            <p className="text-lg text-os-text-secondary/80 mb-3">No activity</p>
            <p className="text-sm text-os-text-secondary/60">Your transaction history will appear here</p>
          </div>
        )}

        {/* Recently Viewed */}
        <div className="mt-10">
          <RecentlyViewed />
        </div>
      </div>
    </div>
  );
};

export default Profile;
