import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useNFTStore } from '../store/nftStore';
import { Accordion } from './Accordion';
import { TraitBadge } from './TraitBadge';
import { TransferForm } from './TransferForm';
import { Breadcrumbs } from './Breadcrumbs';
import { CopyIcon, TagIcon, ListIcon, TransferIcon, ClockIcon, HeartIcon, HeartFilledIcon, VerifiedIcon, ExternalLink } from './icons';
import type { ActivityEvent } from '../types';

function timeAgo(timestamp: number): string {
  const ts = timestamp > 1e15 ? timestamp / 1e6 : timestamp;
  const diff = Date.now() - ts;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const TokenDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const tokenId = Number(id);

  const tokenCache = useNFTStore((s) => s.tokenCache);
  const loadTokenDetail = useNFTStore((s) => s.loadTokenDetail);
  const loadTokenActivity = useNFTStore((s) => s.loadTokenActivity);
  const collection = useNFTStore((s) => s.collection);
  const principal = useNFTStore((s) => s.principal);

  const token = tokenCache.get(tokenId);
  const [copied, setCopied] = useState(false);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [favorited, setFavorited] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoadFailed(false);
      loadTokenDetail(tokenId).catch(() => setLoadFailed(true));
      // Timeout fallback — if token still not loaded after 10s, show error
      const timer = setTimeout(() => setLoadFailed(true), 10000);
      return () => clearTimeout(timer);
    }
  }, [tokenId, token, loadTokenDetail]);

  useEffect(() => {
    loadTokenActivity(tokenId).then(setActivity);
  }, [tokenId, loadTokenActivity]);

  const handleCopy = useCallback(async () => {
    if (token) {
      await navigator.clipboard.writeText(token.owner);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [token]);

  if (!token) {
    if (loadFailed) {
      return (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Not Found' }]} />
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-os-text-secondary text-lg">NFT not found</p>
            <p className="text-sm text-os-text-secondary/60">Token #{tokenId} could not be loaded.</p>
            <a href="/" className="btn btn-md btn-primary">Back to Explore</a>
          </div>
        </div>
      );
    }
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8">
          <div className="aspect-square skeleton rounded-xl" />
          <div className="space-y-4">
            <div className="h-6 w-32 rounded skeleton" />
            <div className="h-10 w-2/3 rounded skeleton" />
            <div className="h-4 w-48 rounded skeleton" />
            <div className="h-48 rounded-xl skeleton" />
          </div>
        </div>
      </div>
    );
  }

  const isOwner = token.owner === principal;
  const totalSupply = collection?.totalSupply || 1;
  const simPrice = (0.01 + token.id * 0.005).toFixed(3);

  const getTraitPercentage = (category: string, value: string): number | undefined => {
    if (!collection?.traits) return undefined;
    const cat = collection.traits.find((c) => c.category === category);
    if (!cat) return undefined;
    const val = cat.values.find((v) => v.value === value);
    if (!val) return undefined;
    return (val.count / totalSupply) * 100;
  };

  const truncatedOwner =
    token.owner.length > 20
      ? token.owner.slice(0, 8) + '...' + token.owner.slice(-6)
      : token.owner;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Breadcrumbs items={[
        { label: 'Home', to: '/' },
        { label: 'My Collection', to: '/collection/local' },
        { label: token?.name || `#${id}` },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8">
        {/* Left: Image + Price card */}
        <div className="lg:sticky lg:top-[88px] lg:self-start space-y-4">
          {/* Image */}
          <div className="rounded-xl overflow-hidden border border-os-border bg-os-surface shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
            {/* Image toolbar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-os-border">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#E5E8EB">
                <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
              </svg>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFavorited(!favorited)}
                  className="flex items-center gap-1 text-os-text-secondary hover:text-white transition-colors"
                >
                  {favorited ? (
                    <HeartFilledIcon size={16} className="text-os-secondary" />
                  ) : (
                    <HeartIcon size={16} />
                  )}
                  <span className="text-xs">{Math.floor(Math.random() * 30) + (favorited ? 1 : 0)}</span>
                </button>
                <button className="text-os-text-secondary hover:text-white transition-colors">
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
            <img
              src={token.image}
              alt={token.name}
              className="w-full aspect-square object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml,' +
                  encodeURIComponent(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="#15253B" width="400" height="400"/><text fill="#707A83" font-size="48" font-family="system-ui" text-anchor="middle" x="200" y="210">#${token.id}</text></svg>`
                  );
              }}
            />
          </div>

          {/* Price / Buy card */}
          <div className="rounded-2xl border border-os-border bg-os-surface overflow-hidden">
            <div className="px-4 py-3 border-b border-os-border">
              <p className="text-xs text-os-text-secondary">Current price</p>
              <div className="flex items-center gap-2 mt-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#E5E8EB">
                  <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                </svg>
                <span className="text-3xl font-bold text-white">{simPrice}</span>
                <span className="text-sm text-os-text-secondary mt-1">${(parseFloat(simPrice) * 2500).toFixed(2)}</span>
              </div>
            </div>
            <div className="p-4 flex gap-3">
              <button className="btn btn-lg btn-primary flex-1">
                Buy now
              </button>
              <button className="btn btn-lg btn-secondary flex-1">
                Make offer
              </button>
            </div>
          </div>
        </div>

        {/* Right: Info panels */}
        <div className="space-y-4">
          {/* Collection + Title */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-os-primary text-sm font-semibold">ICP Speed NFTs</span>
              <VerifiedIcon size={16} />
            </div>
            <h1 className="text-3xl font-bold text-white">{token.name}</h1>
          </div>

          {/* Owner + views */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-sm text-os-text-secondary">Owned by</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-sm text-os-primary hover:text-os-primary-hover transition-colors"
              >
                <span className="font-mono">{truncatedOwner}</span>
                <CopyIcon size={12} />
              </button>
              {copied && <span className="text-xs text-os-green ml-1">Copied!</span>}
            </div>
          </div>

          {/* Description */}
          {token.description && (
            <Accordion title="Description" icon={<ListIcon size={16} />} defaultOpen>
              <p className="text-sm text-os-text-secondary leading-relaxed">{token.description}</p>
            </Accordion>
          )}

          {/* Properties / Traits */}
          {token.traits && token.traits.length > 0 && (
            <Accordion title="Properties" icon={<TagIcon size={16} />} defaultOpen>
              <div className="grid grid-cols-3 gap-2.5">
                {token.traits.map((trait, i) => (
                  <TraitBadge
                    key={i}
                    trait={trait}
                    percentage={getTraitPercentage(trait.category, trait.value)}
                  />
                ))}
              </div>
            </Accordion>
          )}

          {/* Details */}
          <Accordion title="Details" icon={<ListIcon size={16} />}>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-os-text-secondary">Token ID</span>
                <span className="text-os-primary font-mono">#{token.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-os-text-secondary">Blockchain</span>
                <span className="text-white">Internet Computer</span>
              </div>
              <div className="flex justify-between">
                <span className="text-os-text-secondary">Token Standard</span>
                <span className="text-white">ICRC-7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-os-text-secondary">Creator Earnings</span>
                <span className="text-white">5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-os-text-secondary">Minted</span>
                <span className="text-white">{timeAgo(token.mintedAt)}</span>
              </div>
            </div>
          </Accordion>

          {/* Transfer */}
          {isOwner && (
            <Accordion title="Transfer" icon={<TransferIcon size={16} />}>
              <TransferForm tokenId={tokenId} />
            </Accordion>
          )}

          {/* Item Activity */}
          <Accordion title="Item Activity" icon={<ClockIcon size={16} />}>
            {activity.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-os-text-secondary text-xs">
                      <th className="text-left pb-2 font-semibold">Event</th>
                      <th className="text-left pb-2 font-semibold">Price</th>
                      <th className="text-left pb-2 font-semibold">From</th>
                      <th className="text-left pb-2 font-semibold">To</th>
                      <th className="text-right pb-2 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity.map((event, i) => (
                      <tr key={i} className="border-t border-os-border/30">
                        <td className="py-2.5">
                          <span className={`font-semibold ${event.eventType === 'Mint' ? 'text-os-green' : 'text-os-primary'}`}>
                            {event.eventType}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="#E5E8EB">
                              <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                            </svg>
                            <span className="text-white">{simPrice}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-os-primary font-mono text-xs">
                          {event.from ? `${event.from.slice(0, 6)}...` : '--'}
                        </td>
                        <td className="py-2.5 text-os-primary font-mono text-xs">
                          {event.to.slice(0, 6)}...
                        </td>
                        <td className="py-2.5 text-os-primary text-right text-xs">
                          {timeAgo(event.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-os-text-secondary text-center py-4">No activity</p>
            )}
          </Accordion>
        </div>
      </div>
    </div>
  );
};
