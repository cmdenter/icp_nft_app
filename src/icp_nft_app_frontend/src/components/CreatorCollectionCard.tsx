import React from 'react';
import { Link } from 'react-router-dom';
import { SafeImg } from './SafeImg';
import { VerifiedIcon } from './icons';
import type { CollectionEntry } from '../types';
import { getCollectionImageUrls } from '../api/collections';

interface CreatorCollectionCardProps {
  collection: CollectionEntry;
}

const CreatorCollectionCard: React.FC<CreatorCollectionCardProps> = ({ collection }) => {
  return (
    <Link to={'/collection/' + collection.id}>
      <div className="card-base overflow-hidden group">
        {/* Banner / image area */}
        <div className="h-[140px] relative overflow-hidden">
          <SafeImg
            urls={getCollectionImageUrls(collection)}
            alt={collection.name}
            fallback={collection.name.charAt(0)}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Info area */}
        <div className="p-4">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-white group-hover:text-os-primary transition-colors">
              {collection.name}
            </span>
            {collection.verified && <VerifiedIcon size={14} />}
          </div>

          <div className="flex gap-4 mt-2">
            <div>
              <div className="text-[11px] text-os-text-secondary">Items</div>
              <div className="text-xs font-bold text-white">{collection.totalSupply ?? '—'}</div>
            </div>
            <div>
              <div className="text-[11px] text-os-text-secondary">Floor</div>
              <div className="text-xs font-bold text-white">
                {collection.floorPrice != null ? collection.floorPrice + ' ICP' : '—'}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-os-text-secondary">Category</div>
              <div className="text-xs font-bold text-white capitalize">
                {collection.category ?? '—'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CreatorCollectionCard;
