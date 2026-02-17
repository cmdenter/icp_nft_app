import { useNavigate } from 'react-router-dom';
import { useNFTStore } from '../../store/nftStore';
import { SafeImg } from '../SafeImg';
import { getExtImageUrls } from '../../api/ext';
import { ICPTokenIcon, TagIcon, TrendingIcon, WalletIcon, SettingsIcon } from '../icons';
import { timeAgo } from '../../utils/format';
import type { CreatorInfo, CollectionEntry } from '../../types';

interface CreatorOverviewProps {
  creatorId: string;
  creator: CreatorInfo;
  collections: CollectionEntry[];
}

export function CreatorOverview({ creatorId, collections }: CreatorOverviewProps) {
  const navigate = useNavigate();
  const externalTransactions = useNFTStore((s) => s.externalTransactions);
  const externalListings = useNFTStore((s) => s.externalListings);

  // Gather collection IDs for this creator
  const collectionIds = collections.map((c) => c.id);

  // Aggregate transactions across all creator collections
  const allTransactions = collectionIds.flatMap((id) => {
    const txs = externalTransactions.get(id);
    return txs || [];
  });

  // Aggregate listings across all creator collections
  let activeListingsCount = 0;
  for (const id of collectionIds) {
    const listings = externalListings.get(id);
    if (listings) activeListingsCount += listings.size;
  }

  const totalRevenue = allTransactions.reduce((sum, tx) => sum + tx.price, 0);
  const totalSales = allTransactions.length;
  const totalItems = collections.reduce((sum, c) => sum + (c.totalSupply ?? 0), 0);
  const avgSalePrice = totalSales > 0 ? totalRevenue / totalSales : 0;

  const stats = [
    { label: 'Total Revenue', value: `${totalRevenue.toFixed(2)} ICP`, color: 'text-os-green' },
    { label: 'Total Sales', value: totalSales.toLocaleString(), color: 'text-os-primary' },
    { label: 'Active Listings', value: activeListingsCount.toLocaleString(), color: 'text-os-yellow' },
    { label: 'Total Items', value: totalItems.toLocaleString(), color: 'text-white' },
    { label: 'Collections', value: collections.length.toString(), color: 'text-purple-400' },
    { label: 'Avg Sale Price', value: `${avgSalePrice.toFixed(2)} ICP`, color: 'text-os-green' },
  ];

  const statColors = ['#34C77B', '#2081E2', '#F0B90B', '#ffffff', '#A855F7', '#34C77B'];

  // Recent 5 transactions sorted by time descending
  const recentSales = [...allTransactions]
    .sort((a, b) => b.time - a.time)
    .slice(0, 5);

  // Find the collection for a given transaction
  function findCollectionForTx(tokenIndex: number): CollectionEntry | undefined {
    // Try each collection - use the first one that has the transaction
    for (const id of collectionIds) {
      const txs = externalTransactions.get(id);
      if (txs?.some((t) => t.tokenIndex === tokenIndex)) {
        return collections.find((c) => c.id === id);
      }
    }
    return collections[0];
  }

  const quickLinks = [
    {
      label: 'Manage Listings',
      desc: 'View and manage active listings',
      tab: 'listings',
      Icon: TagIcon,
    },
    {
      label: 'View Analytics',
      desc: 'Sales charts and metrics',
      tab: 'analytics',
      Icon: TrendingIcon,
    },
    {
      label: 'Payout History',
      desc: 'Track your earnings',
      tab: 'payouts',
      Icon: WalletIcon,
    },
    {
      label: 'Edit Profile',
      desc: 'Update creator settings',
      tab: 'settings',
      Icon: SettingsIcon,
    },
  ];

  const basePath = `/creator/${creatorId}/dashboard`;

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="rounded-xl bg-os-surface border border-os-border p-4 relative overflow-hidden"
          >
            <div
              className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-[0.07]"
              style={{ background: statColors[i] }}
            />
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-os-text-secondary mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Sales */}
      {recentSales.length > 0 && (
        <div className="rounded-2xl border border-os-border bg-os-surface overflow-hidden">
          <div className="px-5 py-3 border-b border-os-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Recent Sales</h3>
            <button
              onClick={() => navigate(`${basePath}/analytics`)}
              className="text-[11px] text-os-primary hover:underline"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-os-border/30">
            {recentSales.map((tx, i) => {
              const col = findCollectionForTx(tx.tokenIndex);
              const imgUrls = col
                ? getExtImageUrls(col.canisterId, tx.tokenIndex)
                : [];
              return (
                <div
                  key={`${tx.tokenIndex}-${tx.time}-${i}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-os-card/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-os-card shrink-0">
                    <SafeImg
                      urls={imgUrls}
                      alt={`#${tx.tokenIndex}`}
                      fallback="?"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {col?.name || 'NFT'} #{tx.tokenIndex}
                    </p>
                    <p className="text-[11px] text-os-text-secondary">
                      {timeAgo(tx.time)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <ICPTokenIcon size={14} />
                    <span className="text-sm font-bold text-white">
                      {tx.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quickLinks.map((link) => (
          <button
            key={link.tab}
            onClick={() => navigate(`${basePath}/${link.tab}`)}
            className="rounded-xl border border-os-border bg-os-surface p-4 hover:border-os-primary/30 hover:bg-os-card/50 transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-os-primary/10 flex items-center justify-center shrink-0">
                <link.Icon size={16} className="text-os-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-os-primary transition-colors">
                  {link.label}
                </p>
                <p className="text-xs text-os-text-secondary mt-0.5">{link.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
