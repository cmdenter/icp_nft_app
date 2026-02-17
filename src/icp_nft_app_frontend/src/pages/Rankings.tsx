import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { COLLECTIONS } from '../api/collections';
import { useNFTStore } from '../store/nftStore';
import { VerifiedIcon, ICPTokenIcon } from '../components/icons';
import { SafeImg } from '../components/SafeImg';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getExtImageUrls } from '../api/ext';

const Rankings: React.FC = () => {
  const externalListings = useNFTStore((s) => s.externalListings);
  const loadExternalMarketData = useNFTStore((s) => s.loadExternalMarketData);

  const mainnet = COLLECTIONS.filter((c) => !c.isLocal);

  useEffect(() => {
    mainnet.forEach((c) => {
      if (c.standard === 'ext') loadExternalMarketData(c.id);
    });
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Rankings' }]} />
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-gradient mb-2 tracking-tight">Collection Rankings</h1>
        <p className="text-os-text-secondary text-sm sm:text-lg">
          Top NFT collections on the Internet Computer
        </p>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-os-border bg-os-surface overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-os-border bg-os-card/30 text-os-text-secondary text-xs">
                <th className="text-left py-4 px-5 font-semibold">#</th>
                <th className="text-left py-4 px-5 font-semibold">Collection</th>
                <th className="text-right py-4 px-5 font-semibold">Floor Price</th>
                <th className="text-right py-4 px-5 font-semibold hidden sm:table-cell">Items</th>
                <th className="text-right py-4 px-5 font-semibold hidden md:table-cell">Listed</th>
                <th className="text-right py-4 px-5 font-semibold hidden md:table-cell">Standard</th>
              </tr>
            </thead>
            <tbody>
              {mainnet.map((col, i) => {
                const listings = externalListings.get(col.id);
                const listedCount = listings ? listings.size : 0;
                const imgUrls = getExtImageUrls(col.canisterId, 1);

                return (
                  <tr
                    key={col.id}
                    className="border-b border-os-border/40 hover:bg-os-card/60 transition-colors duration-250"
                  >
                    <td className="py-5 px-5">
                      <span
                        className={`text-base font-bold ${
                          i === 0
                            ? 'text-os-rarity-legendary'
                            : i === 1
                              ? 'text-gray-300'
                              : i === 2
                                ? 'text-amber-600'
                                : 'text-os-text-secondary'
                        }`}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-5 px-5">
                      <Link
                        to={`/collection/${col.id}`}
                        className="flex items-center gap-3 group hover:opacity-80 transition-opacity"
                      >
                        <CollectionAvatar urls={imgUrls} name={col.name} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white truncate">{col.name}</span>
                            {col.verified && <VerifiedIcon size={14} className="text-os-primary shrink-0" />}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="py-5 px-5 text-right">
                      {col.floorPrice != null ? (
                        <div className="flex items-center justify-end gap-1">
                          <ICPTokenIcon size={16} className="shrink-0" />
                          <span className="text-base font-bold text-white">{col.floorPrice}</span>
                        </div>
                      ) : (
                        <span className="text-os-text-secondary">—</span>
                      )}
                    </td>
                    <td className="py-5 px-5 text-right hidden sm:table-cell">
                      <span className="text-white font-semibold">
                        {(col.totalSupply || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-5 px-5 text-right hidden md:table-cell">
                      <span className="text-white font-semibold">
                        {listedCount > 0 ? listedCount.toLocaleString() : '—'}
                      </span>
                    </td>
                    <td className="py-5 px-5 text-right hidden md:table-cell">
                      <span className="text-[11px] px-2.5 py-1 bg-os-primary/10 text-os-primary rounded-full font-semibold uppercase tracking-wider border border-os-primary/20">
                        {col.standard}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CollectionAvatar: React.FC<{ urls: string[]; name: string }> = ({ urls, name }) => {
  return (
    <div className="w-11 h-11 rounded-xl overflow-hidden bg-os-card shrink-0 ring-0 hover:ring-2 ring-os-primary/30 transition-all duration-250">
      <SafeImg
        src={urls[0]}
        alt={name}
        fallback={name[0] || '?'}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default Rankings;
