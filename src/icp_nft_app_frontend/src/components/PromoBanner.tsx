import React, { useState, useEffect, useCallback } from 'react';
import { useAdminStore } from '../store/adminStore';
import { XIcon, ChevronRight } from './icons';

export const PromoBanner: React.FC = () => {
  const banners = useAdminStore((s) => s.banners.filter((b) => b.active));
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const rotate = useCallback(() => {
    setIndex((i) => (i + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(rotate, 6000);
    return () => clearInterval(timer);
  }, [banners.length, rotate]);

  if (banners.length === 0 || dismissed) return null;

  const banner = banners[index % banners.length];
  if (!banner) return null;

  return (
    <div className={`h-[32px] bg-gradient-to-r ${banner.gradient} flex items-center justify-center px-4 relative`}>
      <div className="flex items-center gap-2 text-[12px] text-white font-medium">
        <span className="font-bold">{banner.title}</span>
        <span className="opacity-80 hidden sm:inline">{banner.message}</span>
        {banner.link && (
          <a
            href={banner.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-0.5 underline underline-offset-2 opacity-90 hover:opacity-100"
          >
            Learn more <ChevronRight size={10} />
          </a>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
      >
        <XIcon size={14} />
      </button>
    </div>
  );
};
