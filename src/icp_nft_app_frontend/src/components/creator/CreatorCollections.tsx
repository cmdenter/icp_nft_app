import { Link, useNavigate } from 'react-router-dom';
import { SafeImg } from '../SafeImg';
import { getExtImageUrls } from '../../api/ext';
import { ICPTokenIcon, PackageIcon, VerifiedIcon } from '../icons';
import type { CreatorInfo, CollectionEntry } from '../../types';

interface CreatorCollectionsProps {
  creatorId: string;
  creator: CreatorInfo;
  collections: CollectionEntry[];
}

export function CreatorCollections({ creatorId, collections }: CreatorCollectionsProps) {
  const navigate = useNavigate();
  const basePath = `/creator/${creatorId}/dashboard`;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Your Collections</h2>

      {collections.length === 0 && (
        <div className="rounded-2xl border border-os-border bg-os-surface p-12 text-center">
          <PackageIcon size={40} className="text-os-text-secondary mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Collections Yet</h3>
          <p className="text-sm text-os-text-secondary mt-1">
            Your collections will appear here once they are created.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((collection) => {
          const bannerUrls = collection.banner
            ? [collection.banner]
            : collection.canisterId
              ? getExtImageUrls(collection.canisterId, 0)
              : [];

          return (
            <div
              key={collection.id}
              className="card-base overflow-hidden"
            >
              {/* Image header */}
              <div className="aspect-[3/1] bg-os-card overflow-hidden relative">
                <SafeImg
                  urls={bannerUrls}
                  alt={collection.name}
                  fallback={collection.name.charAt(0)}
                  className="w-full h-full object-cover"
                />
                {/* Active badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-os-bg/80 backdrop-blur-sm border border-os-border/30">
                  <div className="w-2 h-2 rounded-full bg-os-green" />
                  <span className="text-[10px] font-semibold text-os-green">Active</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Name + verified */}
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white truncate">{collection.name}</h3>
                  {collection.verified && <VerifiedIcon size={14} />}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 mt-2 text-xs text-os-text-secondary">
                  <span>{collection.totalSupply?.toLocaleString() ?? 0} items</span>
                  {collection.floorPrice != null && (
                    <span className="flex items-center gap-1">
                      <ICPTokenIcon size={12} />
                      {collection.floorPrice.toFixed(2)}
                    </span>
                  )}
                  {collection.category && (
                    <span className="px-1.5 py-0.5 rounded bg-os-card text-[10px] uppercase tracking-wide">
                      {collection.category}
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-3">
                  <Link
                    to={`/collection/${collection.id}`}
                    className="flex-1 text-center px-3 py-2 rounded-lg text-xs font-semibold text-os-text-secondary hover:text-white bg-os-card/50 hover:bg-os-card border border-os-border/30 transition-colors"
                  >
                    View Collection
                  </Link>
                  <button
                    onClick={() => navigate(`${basePath}/listings`)}
                    className="flex-1 text-center px-3 py-2 rounded-lg text-xs font-semibold text-white bg-os-primary/20 hover:bg-os-primary/30 border border-os-primary/30 transition-colors"
                  >
                    Manage Listings
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Create Collection placeholder */}
        <div className="rounded-xl border-2 border-dashed border-os-border/40 flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
          <PackageIcon size={32} className="text-os-text-secondary/40 mb-3" />
          <p className="text-sm font-semibold text-os-text-secondary/60">Create Collection</p>
          <span className="mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-os-card/50 text-os-text-secondary/50 border border-os-border/30">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
}
