import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../store/adminStore';
import { ExternalLink } from './icons';

interface DefaultPromo {
  title: string;
  description: string;
  link: string;
  external: boolean;
  placement: 'sidebar' | 'feed' | 'banner';
}

const DEFAULT_PROMOS: DefaultPromo[] = [
  // Sidebar promos
  { title: 'Trade on ICP', description: 'Zero gas fees. Instant finality. 100% on-chain.', link: 'https://internetcomputer.org', external: true, placement: 'sidebar' },
  { title: 'Explore NFTs', description: 'Discover unique digital art on the Internet Computer.', link: '/explore', external: false, placement: 'sidebar' },
  { title: 'ICP Tokens', description: 'Browse 27+ tokens in the ICP ecosystem.', link: '/tokens', external: false, placement: 'sidebar' },
  // Feed promos (between content sections)
  { title: 'List Your NFTs', description: 'Connect your wallet and start selling on the fastest blockchain marketplace. Zero gas fees.', link: '/create', external: false, placement: 'feed' },
  { title: 'Advertise Here', description: 'Reach thousands of ICP collectors and traders. Premium ad placements available.', link: '/admin', external: false, placement: 'feed' },
  { title: 'Join the Community', description: 'Chat with collectors, share alpha, and discover the next big collection.', link: '/chat', external: false, placement: 'feed' },
  // Banner promos (wide, between major sections)
  { title: 'Your Ad Here', description: 'Premium banner placement. Reach the ICP NFT community. Contact us for rates.', link: '/admin', external: false, placement: 'banner' },
  { title: 'KongSwap DEX', description: 'Swap ICP tokens instantly. Cross-chain trading with zero bridges.', link: 'https://www.kongswap.io', external: true, placement: 'banner' },
  { title: 'OpenChat', description: 'The fully on-chain messaging platform. Chat, tip crypto, and govern.', link: 'https://oc.app', external: true, placement: 'banner' },
];

interface AdSlotProps {
  placement: 'sidebar' | 'feed' | 'banner';
}

export const AdSlot: React.FC<AdSlotProps> = ({ placement }) => {
  const navigate = useNavigate();
  const ads = useAdminStore((s) => s.ads);

  const ad = useMemo(() => {
    const active = ads.filter((a) => a.active && a.placement === placement);
    if (active.length === 0) return null;
    return active[Math.floor(Math.random() * active.length)];
  }, [ads, placement]);

  // Fallback: show a random default promo matching this placement
  if (!ad) {
    const matchingDefaults = DEFAULT_PROMOS.filter((p) => p.placement === placement);
    const defaultPromo = matchingDefaults[Math.floor(Math.random() * matchingDefaults.length)];
    if (!defaultPromo) return null;

    const handleDefaultClick = () => {
      if (defaultPromo.external) {
        window.open(defaultPromo.link, '_blank', 'noopener,noreferrer');
      } else {
        navigate(defaultPromo.link);
      }
    };

    if (placement === 'banner') {
      return (
        <button
          onClick={handleDefaultClick}
          className="w-full rounded-xl bg-gradient-to-r from-os-primary/10 via-purple-900/8 to-os-primary/10 border border-os-border/30 px-6 py-4 flex items-center justify-between hover:border-os-primary/40 hover:shadow-lg hover:shadow-os-primary/5 transition-all duration-200 group text-left"
        >
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-os-text-secondary/60 bg-os-card px-1.5 py-0.5 rounded">Promoted</span>
            </div>
            <h4 className="text-sm font-semibold text-white group-hover:text-os-primary transition-colors">{defaultPromo.title}</h4>
            <p className="text-[12px] text-os-text-secondary">{defaultPromo.description}</p>
          </div>
          <ExternalLink size={14} className="text-os-primary shrink-0 ml-4" />
        </button>
      );
    }

    // sidebar and feed use the existing card style
    return (
      <button
        onClick={handleDefaultClick}
        className="block w-full text-left rounded-xl bg-os-surface border border-os-border/30 overflow-hidden hover:border-os-primary/30 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group"
      >
        <div className="p-3.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-os-text-secondary/60 bg-os-card px-1.5 py-0.5 rounded">Promoted</span>
          </div>
          <h4 className="text-sm font-semibold text-white group-hover:text-os-primary transition-colors mb-1">{defaultPromo.title}</h4>
          <p className="text-[12px] text-os-text-secondary line-clamp-2">{defaultPromo.description}</p>
          <div className="flex items-center gap-1 mt-2.5 text-[11px] text-os-primary group-hover:gap-2 transition-all duration-200">
            Learn more <ExternalLink size={10} />
          </div>
        </div>
      </button>
    );
  }

  return (
    <a
      href={ad.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl bg-os-surface border border-os-border/30 overflow-hidden hover:border-os-primary/30 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group"
    >
      {ad.imageUrl && (
        <div className="h-32 overflow-hidden bg-os-card">
          <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      <div className="p-3.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-os-text-secondary/60 bg-os-card px-1.5 py-0.5 rounded">
            Sponsored
          </span>
        </div>
        <h4 className="text-sm font-semibold text-white group-hover:text-os-primary transition-colors mb-1">
          {ad.title}
        </h4>
        <p className="text-[12px] text-os-text-secondary line-clamp-2">{ad.description}</p>
        <div className="flex items-center gap-1 mt-2.5 text-[11px] text-os-primary group-hover:gap-2 transition-all duration-200">
          Learn more <ExternalLink size={10} />
        </div>
      </div>
    </a>
  );
};
