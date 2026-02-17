import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNFTStore } from '../../store/nftStore';
import { NFTCard } from '../NFTCard';
import { SkeletonGrid } from '../Skeleton';
import { RecentlyViewed } from '../RecentlyViewed';
import { PackageIcon } from '../icons';

export const MyCollection: React.FC = () => {
  const principal = useNFTStore((s) => s.principal);
  const profileTokens = useNFTStore((s) => s.profileTokens);
  const profileLoading = useNFTStore((s) => s.profileLoading);
  const loadProfileTokens = useNFTStore((s) => s.loadProfileTokens);

  useEffect(() => {
    if (principal) loadProfileTokens(principal);
  }, [principal, loadProfileTokens]);

  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-4">My Collection ({profileTokens.length})</h2>

      {profileLoading ? (
        <SkeletonGrid count={8} />
      ) : profileTokens.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {profileTokens.map((item) => (
            <NFTCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-os-border bg-os-surface p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-os-primary/10 flex items-center justify-center mx-auto mb-4">
            <PackageIcon size={28} className="text-os-primary" />
          </div>
          <p className="text-lg font-semibold text-white mb-2">No NFTs yet</p>
          <p className="text-sm text-os-text-secondary mb-6">Mint or purchase NFTs to see them here.</p>
          <Link to="/" className="btn btn-md btn-primary inline-flex">Explore Collections</Link>
        </div>
      )}

      <div className="mt-8">
        <RecentlyViewed />
      </div>
    </div>
  );
};
