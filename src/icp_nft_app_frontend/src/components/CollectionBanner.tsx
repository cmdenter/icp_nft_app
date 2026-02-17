import React from 'react';
import { useNFTStore } from '../store/nftStore';
import { VerifiedIcon, ICPLogo } from './icons';

export const CollectionBanner: React.FC = () => {
  const collection = useNFTStore((s) => s.collection);

  return (
    <div className="relative">
      {/* Full-width banner image */}
      <div className="h-[260px] bg-gradient-to-br from-os-primary/40 via-purple-900/30 to-os-primary/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(32,129,226,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(128,0,255,0.2) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Collection info */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Avatar */}
        <div className="-mt-12 sm:-mt-16 mb-4">
          <div className="w-[90px] h-[90px] sm:w-[130px] sm:h-[130px] rounded-xl bg-os-surface border-4 border-os-bg flex items-center justify-center shadow-2xl glow-pulse">
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-os-primary/20 to-purple-600/20 flex items-center justify-center">
              <ICPLogo size={60} />
            </div>
          </div>
        </div>

        {/* Name + Verified */}
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl lg:text-4xl tracking-tight font-bold text-white">
            {collection?.name || 'ICP Speed NFTs'}
          </h1>
          <VerifiedIcon size={24} />
        </div>

        {/* Description */}
        <p className="text-sm text-os-text-secondary max-w-2xl leading-relaxed">
          {collection?.description || 'High-performance NFTs on the Internet Computer. Blazing fast materialized views with pre-computed JSON responses.'}
        </p>
      </div>
    </div>
  );
};
