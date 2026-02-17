import React from 'react';
import { useNFTStore } from '../store/nftStore';
import { SafeImg } from './SafeImg';
import { VerifiedIcon } from './icons';
import { COLLECTIONS } from '../api/collections';
import { getExtImageUrls } from '../api/ext';

export const CollectionBanner: React.FC = () => {
  const collection = useNFTStore((s) => s.collection);

  // Use a real NFT image from a mainnet collection for the local collection banner + avatar
  const extCol = COLLECTIONS.find((c) => c.standard === 'ext');
  const bannerUrls = extCol ? getExtImageUrls(extCol.canisterId, 42) : [];
  const avatarUrls = extCol ? getExtImageUrls(extCol.canisterId, 1) : [];

  return (
    <div className="relative">
      {/* Full-width banner image */}
      <div className="h-[260px] relative overflow-hidden">
        <SafeImg
          urls={bannerUrls}
          alt=""
          fallback=""
          className="absolute inset-0 w-full h-full object-cover blur-sm opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-os-bg via-os-bg/60 to-transparent" />
      </div>

      {/* Collection info */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Avatar */}
        <div className="-mt-12 sm:-mt-16 mb-4">
          <div className="w-[90px] h-[90px] sm:w-[130px] sm:h-[130px] rounded-xl border-4 border-os-bg shadow-2xl overflow-hidden">
            <SafeImg
              urls={avatarUrls}
              alt={collection?.name || 'ICP Speed NFTs'}
              fallback="I"
              className="w-full h-full object-cover"
            />
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
