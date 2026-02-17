import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SafeImg } from './SafeImg';
import { CopyIcon, ExternalLink, XSocialIcon, DiscordIcon, GithubIcon, VerifiedIcon } from './icons';
import { getCreatorAvatarUrls } from '../api/collections';
import type { CollectionEntry } from '../types';

interface CollectionAboutSectionProps {
  collection: CollectionEntry;
}

export const CollectionAboutSection: React.FC<CollectionAboutSectionProps> = ({ collection }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(collection.canisterId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const truncatedCanister =
    collection.canisterId.length > 16
      ? collection.canisterId.slice(0, 8) + '...' + collection.canisterId.slice(-6)
      : collection.canisterId;

  const contractRows: { label: string; value: React.ReactNode }[] = [
    {
      label: 'Canister ID',
      value: (
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-os-primary hover:underline"
          title={collection.canisterId}
        >
          <span className="font-mono text-xs">{truncatedCanister}</span>
          <CopyIcon size={13} className={copied ? 'text-green-400' : ''} />
        </button>
      ),
    },
    {
      label: 'Standard',
      value: (
        <span className="font-mono text-xs text-white">
          {collection.standard.toUpperCase()}
        </span>
      ),
    },
    {
      label: 'Network',
      value: <span className="text-os-green text-xs font-semibold">Mainnet</span>,
    },
  ];

  if (collection.launchDate) {
    contractRows.push({
      label: 'Launch Date',
      value: <span className="text-xs text-white">{collection.launchDate}</span>,
    });
  }

  if (collection.royaltyPercent != null) {
    contractRows.push({
      label: 'Royalty',
      value: <span className="text-xs text-white">{collection.royaltyPercent}%</span>,
    });
  }

  const creator = collection.creator;

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-12 border-t border-os-border/30 pt-8">
      <h2 className="text-xl font-bold text-white mb-6">About {collection.name}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        {/* Left column */}
        <div>
          {collection.description && (
            <p className="text-sm text-os-text-secondary leading-relaxed mb-6">
              {collection.description}
            </p>
          )}

          {/* Contract details card */}
          <div className="rounded-2xl border border-os-border bg-os-surface">
            <h3 className="px-4 py-3 text-sm font-semibold text-white border-b border-os-border/20">
              Contract Details
            </h3>
            {contractRows.map((row) => (
              <div
                key={row.label}
                className="flex justify-between items-center px-4 py-3 border-b border-os-border/20 last:border-b-0"
              >
                <span className="text-xs text-os-text-secondary">{row.label}</span>
                {row.value}
              </div>
            ))}
          </div>
        </div>

        {/* Right column — Creator card */}
        {creator && (
          <div className="rounded-2xl border border-os-border bg-os-surface p-5">
            <div className="flex items-center gap-3 mb-3">
              <SafeImg
                urls={creator.id ? getCreatorAvatarUrls(creator.id) : (creator.avatar ? [creator.avatar] : [])}
                fallback={creator.name[0] || '?'}
                alt={creator.name}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white truncate">{creator.name}</span>
                  <VerifiedIcon size={14} />
                </div>
                {creator.bio && (
                  <p className="text-xs text-os-text-secondary line-clamp-2 mt-0.5">
                    {creator.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Creator social links */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {creator.website && (
                <a
                  href={creator.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-os-card/80 border border-os-border/30 hover:bg-os-card text-os-text-secondary hover:text-white text-xs transition-colors"
                >
                  <ExternalLink size={12} />
                </a>
              )}
              {creator.twitter && (
                <a
                  href={`https://x.com/${creator.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-os-card/80 border border-os-border/30 hover:bg-os-card text-os-text-secondary hover:text-white text-xs transition-colors"
                >
                  <XSocialIcon size={12} />
                </a>
              )}
              {creator.discord && (
                <a
                  href={creator.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-os-card/80 border border-os-border/30 hover:bg-os-card text-os-text-secondary hover:text-white text-xs transition-colors"
                >
                  <DiscordIcon size={12} />
                </a>
              )}
              {creator.github && (
                <a
                  href={`https://github.com/${creator.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-os-card/80 border border-os-border/30 hover:bg-os-card text-os-text-secondary hover:text-white text-xs transition-colors"
                >
                  <GithubIcon size={12} />
                </a>
              )}
            </div>

            <Link
              to={`/creator/${creator.id}`}
              className="btn btn-sm btn-secondary w-full mt-3 text-center"
            >
              View Creator
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
