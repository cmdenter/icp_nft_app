import React, { useState } from 'react';
import { SafeImg } from './SafeImg';
import { ZoomInIcon, ICPLogo } from './icons';

interface ImageGalleryProps {
  urls: string[];
  alt: string;
  fallback: string;
  collectionImage?: string;
  standard: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  urls,
  alt,
  fallback,
  collectionImage,
  standard,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState('center center');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  // Build thumbnails: NFT image, collection avatar (if provided), on-chain info card
  const thumbnails: Array<{ type: 'nft' | 'collection' | 'info'; label: string }> = [
    { type: 'nft', label: 'NFT Image' },
  ];
  if (collectionImage) {
    thumbnails.push({ type: 'collection', label: 'Collection' });
  }
  thumbnails.push({ type: 'info', label: 'On-Chain' });

  const activeThumb = thumbnails[activeTab] || thumbnails[0];

  return (
    <div className="rounded-2xl overflow-hidden border border-os-border bg-os-surface shadow-[0_8px_40px_rgba(0,0,0,0.3)] ring-1 ring-inset ring-white/[0.03]">
      {/* Main image area */}
      <div
        className="relative overflow-hidden cursor-crosshair"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {activeThumb.type === 'nft' && (
          <SafeImg
            urls={urls}
            alt={alt}
            fallback={fallback}
            className="w-full aspect-square object-cover transition-transform duration-250"
            style={{
              transformOrigin: origin,
              transform: zoomed ? 'scale(2)' : 'scale(1)',
            }}
          />
        )}
        {activeThumb.type === 'collection' && collectionImage && (
          <img
            src={collectionImage}
            alt="Collection"
            className="w-full aspect-square object-cover transition-transform duration-250"
            style={{
              transformOrigin: origin,
              transform: zoomed ? 'scale(2)' : 'scale(1)',
            }}
          />
        )}
        {activeThumb.type === 'info' && (
          <div className="w-full aspect-square bg-gradient-to-br from-os-card to-os-surface flex flex-col items-center justify-center gap-4 p-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-os-primary/20 to-purple-600/20 flex items-center justify-center shadow-lg shadow-os-primary/30">
              <ICPLogo size={40} />
            </div>
            <div className="text-center space-y-2">
              <span className="inline-block px-4 py-1.5 rounded-lg bg-os-primary/15 text-os-primary text-sm font-bold tracking-wide">
                {standard.toUpperCase()}
              </span>
              <p className="text-sm text-os-text-secondary">Internet Computer</p>
              <p className="text-xs text-os-text-secondary/70">On-chain digital asset</p>
            </div>
          </div>
        )}

        {/* Zoom indicator */}
        {activeThumb.type !== 'info' && (
          <div
            className={`absolute top-3 right-3 bg-black/50 rounded-lg p-1.5 transition-opacity duration-250 ${
              zoomed ? 'opacity-0' : 'opacity-60'
            }`}
          >
            <ZoomInIcon size={16} className="text-white" />
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-os-border">
        {thumbnails.map((thumb, i) => (
          <button
            key={thumb.type}
            onClick={() => setActiveTab(i)}
            className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-250 shrink-0 ${
              activeTab === i
                ? 'border-os-primary shadow-md shadow-os-primary/20'
                : 'border-os-border/40 hover:border-os-border opacity-70 hover:opacity-100'
            }`}
          >
            {thumb.type === 'nft' && (
              <SafeImg
                urls={urls}
                alt={alt}
                fallback={fallback}
                className="w-full h-full object-cover"
              />
            )}
            {thumb.type === 'collection' && collectionImage && (
              <img
                src={collectionImage}
                alt="Collection"
                className="w-full h-full object-cover"
              />
            )}
            {thumb.type === 'info' && (
              <div className="w-full h-full bg-gradient-to-br from-os-card to-os-surface flex items-center justify-center">
                <span className="text-[9px] font-bold text-os-primary">{standard.toUpperCase()}</span>
              </div>
            )}
          </button>
        ))}
        <span className="text-[11px] text-os-text-secondary ml-2">{activeThumb.label}</span>
      </div>
    </div>
  );
};
