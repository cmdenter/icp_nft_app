import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { getCreator, getCollectionsByCreator } from '../api/collections';
import { useCreatorStore } from '../store/creatorStore';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SafeImg } from '../components/SafeImg';
import {
  BarChartIcon,
  PackageIcon,
  TagIcon,
  TrendingIcon,
  WalletIcon,
  SettingsIcon,
} from '../components/icons';
import { CreatorOverview } from '../components/creator/CreatorOverview';
import { CreatorCollections } from '../components/creator/CreatorCollections';
import { CreatorListings } from '../components/creator/CreatorListings';
import { CreatorAnalytics } from '../components/creator/CreatorAnalytics';
import { CreatorPayouts } from '../components/creator/CreatorPayouts';
import { CreatorSettings } from '../components/creator/CreatorSettings';

const TABS = [
  { key: 'overview', label: 'Overview', icon: BarChartIcon },
  { key: 'collections', label: 'Collections', icon: PackageIcon },
  { key: 'listings', label: 'Listings', icon: TagIcon },
  { key: 'analytics', label: 'Analytics', icon: TrendingIcon },
  { key: 'payouts', label: 'Payouts', icon: WalletIcon },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function CreatorDashboard() {
  const { creatorId, tab } = useParams<{ creatorId: string; tab: string }>();
  const navigate = useNavigate();
  const activeTab = (TABS.find((t) => t.key === tab)?.key || 'overview') as TabKey;

  const creator = creatorId ? getCreator(creatorId) : undefined;
  const collections = creatorId ? getCollectionsByCreator(creatorId) : [];
  const isClaimed = useCreatorStore((s) => s.isCreatorClaimed(creatorId || ''));

  // If not claimed or creator not found, redirect to public profile
  if (!isClaimed || !creator || !creatorId) {
    return <Navigate to={`/creator/${creatorId || ''}`} replace />;
  }

  const basePath = `/creator/${creatorId}/dashboard`;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: creator.name, to: `/creator/${creatorId}` },
          { label: 'Dashboard' },
        ]}
      />

      {/* Profile Banner */}
      <div className="relative mt-2 mb-8">
        <div className="h-[140px] sm:h-[180px] rounded-2xl overflow-hidden relative">
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(32,129,226,0.4) 0%, rgba(88,28,135,0.3) 40%, rgba(41,171,226,0.2) 70%, rgba(237,30,121,0.15) 100%)',
            }}
          />
          <div className="absolute inset-0 dot-grid opacity-20" />
          <div className="absolute top-4 right-[15%] w-32 h-32 rounded-full bg-os-primary/10 blur-3xl" />
          <div className="absolute bottom-0 left-[20%] w-40 h-24 rounded-full bg-purple-500/10 blur-3xl" />
        </div>

        <div className="absolute -bottom-10 left-6 sm:left-8">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-os-surface border-4 border-os-bg flex items-center justify-center shadow-2xl ring-2 ring-os-primary/20 overflow-hidden">
              <SafeImg
                urls={creator.avatar ? [creator.avatar] : []}
                alt={creator.name}
                fallback={creator.name.charAt(0)}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-os-bg flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-os-green" />
            </div>
          </div>
        </div>

        <div className="absolute -bottom-8 left-[7rem] sm:left-[8.5rem]">
          <h1 className="text-xl sm:text-2xl font-bold text-white">{creator.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-os-primary/10 text-os-primary border border-os-primary/20">
              Creator Dashboard
            </span>
          </div>
        </div>
      </div>

      <div className="h-6" />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar nav */}
        <nav className="lg:w-[220px] shrink-0">
          <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible hide-scrollbar pb-2 lg:pb-0">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() =>
                    navigate(t.key === 'overview' ? basePath : `${basePath}/${t.key}`)
                  }
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-250 ${isActive ? 'bg-os-primary/10 text-white shadow-sm shadow-os-primary/10 border border-os-primary/20' : 'text-os-text-secondary hover:text-white hover:bg-os-card/50 border border-transparent'}`}
                >
                  <Icon size={16} className={isActive ? 'text-os-primary' : ''} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'overview' && (
            <CreatorOverview creatorId={creatorId} creator={creator} collections={collections} />
          )}
          {activeTab === 'collections' && (
            <CreatorCollections creatorId={creatorId} creator={creator} collections={collections} />
          )}
          {activeTab === 'listings' && (
            <CreatorListings creatorId={creatorId} creator={creator} collections={collections} />
          )}
          {activeTab === 'analytics' && (
            <CreatorAnalytics creatorId={creatorId} creator={creator} collections={collections} />
          )}
          {activeTab === 'payouts' && (
            <CreatorPayouts creatorId={creatorId} creator={creator} collections={collections} />
          )}
          {activeTab === 'settings' && (
            <CreatorSettings creatorId={creatorId} creator={creator} collections={collections} />
          )}
        </div>
      </div>
    </div>
  );
}
