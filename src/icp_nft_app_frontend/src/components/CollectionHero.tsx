import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SafeImg } from './SafeImg';
import { VerifiedIcon, ExternalLink, XSocialIcon, DiscordIcon, ICPTokenIcon } from './icons';
import { formatPrice, formatNumber } from '../utils/format';
import { getCollectionImageUrls, getCollectionBannerUrls } from '../api/collections';
import type { CollectionEntry, ExtCollectionStats } from '../types';

interface CollectionHeroProps {
  collection: CollectionEntry;
  stats: ExtCollectionStats | null;
  marketLoading: boolean;
}

const StatSkeleton: React.FC = () => (
  <div className="flex flex-col items-center gap-1 px-4 py-2">
    <div className="h-5 w-14 rounded skeleton" />
    <div className="h-3 w-10 rounded skeleton mt-1" />
  </div>
);

export const CollectionHero: React.FC<CollectionHeroProps> = ({
  collection,
  stats,
  marketLoading,
}) => {
  const [showFullDesc, setShowFullDesc] = useState(false);
  const bannerUrls = getCollectionBannerUrls(collection);
  const avatarUrls = getCollectionImageUrls(collection);
  const descriptionLong = collection.description.length > 120;

  const floorPrice = stats?.floorPrice ?? collection.floorPrice;

  const statItems: { label: string; value: React.ReactNode }[] = [
    {
      label: 'Items',
      value: collection.totalSupply != null ? formatNumber(collection.totalSupply) : '--',
    },
    {
      label: 'Floor',
      value:
        floorPrice != null ? (
          <span className="inline-flex items-center gap-1">
            <ICPTokenIcon size={14} />
            {formatPrice(floorPrice)}
          </span>
        ) : (
          '--'
        ),
    },
    {
      label: 'Volume',
      value:
        stats?.totalVolume != null ? (
          <span className="inline-flex items-center gap-1">
            <ICPTokenIcon size={14} />
            {formatNumber(stats.totalVolume)}
          </span>
        ) : (
          '--'
        ),
    },
    {
      label: 'Sales',
      value: stats?.salesCount != null ? formatNumber(stats.salesCount) : '--',
    },
    {
      label: 'Listed',
      value: stats?.listedPercent != null ? `${stats.listedPercent.toFixed(1)}%` : '--',
    },
    {
      label: 'Creator Fee',
      value: collection.royaltyPercent != null ? `${collection.royaltyPercent}%` : '--',
    },
  ];

  return (
    <section className="relative">
      {/* Banner area */}
      <div className="relative h-[280px] overflow-hidden">
        <SafeImg
          urls={bannerUrls}
          alt=""
          fallback=""
          className="absolute inset-0 w-full h-full object-cover blur-sm opacity-40"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-os-bg via-os-bg/60 to-transparent" />
      </div>

      {/* Content area */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Avatar + Info row */}
        <div className="flex items-end gap-4 sm:gap-5 -mt-[60px] sm:-mt-[70px]">
          {/* Avatar */}
          <SafeImg
            urls={avatarUrls}
            fallback={collection.name[0] || '?'}
            alt={collection.name}
            className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-2xl border-4 border-os-bg ring-2 ring-os-border shadow-2xl object-cover flex-shrink-0 relative z-10"
          />

          {/* Text info */}
          <div className="pb-1 min-w-0">
            {/* Name + verified */}
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                {collection.name}
              </h1>
              {collection.verified && <VerifiedIcon size={22} className="flex-shrink-0" />}
            </div>

            {/* Creator */}
            {collection.creator && (
              <p className="text-sm text-os-text-secondary mb-2">
                by{' '}
                <Link
                  to={`/creator/${collection.creator.id}`}
                  className="text-os-primary hover:underline"
                >
                  {collection.creator.name}
                </Link>
              </p>
            )}

            {/* Description */}
            {collection.description && (
              <div className="mb-2">
                <p
                  className={`text-sm text-os-text-secondary ${
                    !showFullDesc ? 'line-clamp-2' : ''
                  }`}
                >
                  {collection.description}
                </p>
                {descriptionLong && (
                  <button
                    onClick={() => setShowFullDesc((v) => !v)}
                    className="text-xs text-os-primary hover:underline mt-0.5"
                  >
                    {showFullDesc ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}

            {/* Social icons */}
            <div className="flex items-center gap-2 flex-wrap">
              {collection.website && (
                <a
                  href={collection.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-os-card/80 border border-os-border/30 hover:bg-os-card text-os-text-secondary hover:text-white text-xs transition-colors"
                >
                  <ExternalLink size={12} />
                  Website
                </a>
              )}
              {collection.twitter && (
                <a
                  href={`https://x.com/${collection.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-os-card/80 border border-os-border/30 hover:bg-os-card text-os-text-secondary hover:text-white text-xs transition-colors"
                >
                  <XSocialIcon size={12} />
                  Twitter
                </a>
              )}
              {collection.discord && (
                <a
                  href={collection.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-os-card/80 border border-os-border/30 hover:bg-os-card text-os-text-secondary hover:text-white text-xs transition-colors"
                >
                  <DiscordIcon size={12} />
                  Discord
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 flex-wrap mt-6 mb-4">
          {marketLoading && !stats
            ? Array.from({ length: 5 }, (_, i) => <StatSkeleton key={i} />)
            : statItems.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center px-4 py-2 rounded-xl bg-os-surface/50 border border-os-border/20"
                >
                  <span className="text-lg font-bold text-white leading-tight">
                    {stat.value}
                  </span>
                  <span className="text-[11px] text-os-text-secondary mt-0.5">
                    {stat.label}
                  </span>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};
