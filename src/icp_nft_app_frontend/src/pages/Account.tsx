import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNFTStore } from '../store/nftStore';
import { useSettingsStore } from '../store/settingsStore';
import { useWishlistStore } from '../store/wishlistStore';
import { usePurchaseHistoryStore } from '../store/purchaseHistoryStore';
import {
  UserIcon, ShoppingBagIcon, HeartIcon, TagIcon, PackageIcon, SettingsIcon,
  CameraIcon, EditIcon, GlobeIcon, XSocialIcon, DiscordIcon, CopyIcon,
} from '../components/icons';
import { AccountOverview } from '../components/account/AccountOverview';
import { PurchaseHistory } from '../components/account/PurchaseHistory';
import { Watchlist } from '../components/account/Watchlist';
import { MyListings } from '../components/account/MyListings';
import { MyCollection } from '../components/account/MyCollection';
import { AccountSettings } from '../components/account/AccountSettings';
import { useNotificationStore } from '../store/notificationStore';

const TABS = [
  { key: 'overview', label: 'Overview', icon: UserIcon },
  { key: 'collection', label: 'My Collection', icon: PackageIcon },
  { key: 'watchlist', label: 'Watchlist', icon: HeartIcon },
  { key: 'listings', label: 'Listings', icon: TagIcon },
  { key: 'purchases', label: 'Purchases', icon: ShoppingBagIcon },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

const StatCard: React.FC<{ label: string; value: string | number; accent: string }> = ({ label, value, accent }) => (
  <div className="relative overflow-hidden rounded-xl bg-os-surface/80 border border-os-border/50 p-4 backdrop-blur-sm">
    <div className={`absolute top-0 left-0 w-1 h-full ${accent}`} />
    <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    <p className="text-[11px] text-os-text-secondary font-medium mt-0.5 uppercase tracking-wider">{label}</p>
  </div>
);

// ---------------------------------------------------------------------------
// Account Page
// ---------------------------------------------------------------------------

const Account: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const activeTab = (TABS.find((t) => t.key === tab)?.key || 'overview') as TabKey;

  const plugPrincipal = useNFTStore((s) => s.plugPrincipal);
  const principal = useNFTStore((s) => s.principal);
  const plugConnected = useNFTStore((s) => s.plugConnected);
  const profileTokens = useNFTStore((s) => s.profileTokens);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const purchases = usePurchaseHistoryStore((s) => s.purchases);
  const showToast = useNotificationStore((s) => s.showToast);

  const displayName = useSettingsStore((s) => s.displayName);
  const bio = useSettingsStore((s) => s.bio);
  const avatarUrl = useSettingsStore((s) => s.avatarUrl);
  const bannerUrl = useSettingsStore((s) => s.bannerUrl);
  const themeColor = useSettingsStore((s) => s.themeColor);
  const website = useSettingsStore((s) => s.website);
  const twitter = useSettingsStore((s) => s.twitter);
  const discord = useSettingsStore((s) => s.discord);
  const setField = useSettingsStore((s) => s.setField);

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const addr = plugPrincipal || principal;
  const truncated = addr.length > 16 ? addr.slice(0, 8) + '...' + addr.slice(-4) : addr;
  const name = displayName || 'Unnamed';
  const successfulPurchases = purchases.filter((p) => p.status === 'success');
  const totalSpent = successfulPurchases.reduce((s, p) => s + p.price, 0);

  const handleImageUpload = (field: 'bannerUrl' | 'avatarUrl') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast({ type: 'error', title: 'Image too large', message: 'Max 5MB' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setField(field, reader.result);
        showToast({ type: 'success', title: field === 'bannerUrl' ? 'Banner updated' : 'Avatar updated' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(addr);
    showToast({ type: 'success', title: 'Address copied' });
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
      {/* ── Banner ── */}
      <div className="relative -mx-4 sm:-mx-6 group">
        <div className="h-[160px] sm:h-[200px] lg:h-[240px] overflow-hidden relative">
          {bannerUrl ? (
            <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${themeColor}40 0%, #581c8730 40%, ${themeColor}20 70%, #ed1e7915 100%)`,
              }}
            />
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-os-bg via-os-bg/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
        </div>
        {/* Banner edit button */}
        <button
          onClick={() => bannerInputRef.current?.click()}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 text-white/80 hover:text-white hover:bg-black/60 transition-all text-xs font-medium opacity-0 group-hover:opacity-100"
        >
          <CameraIcon size={14} />
          <span className="hidden sm:inline">Edit Banner</span>
        </button>
        <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload('bannerUrl')} />
      </div>

      {/* ── Profile Header ── */}
      <div className="relative -mt-16 sm:-mt-20 mb-6 px-2">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Avatar */}
          <div className="relative group/avatar shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-os-bg overflow-hidden bg-os-surface shadow-2xl">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${themeColor}30, ${themeColor}10)` }}
                >
                  <UserIcon size={40} className="text-os-text-secondary" />
                </div>
              )}
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
            >
              <CameraIcon size={20} className="text-white" />
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload('avatarUrl')} />
            {plugConnected && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-os-bg flex items-center justify-center border-2 border-os-bg">
                <div className="w-3.5 h-3.5 rounded-full bg-os-green" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{name}</h1>
              {plugConnected && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-os-green/10 text-os-green border border-os-green/20">
                  Connected
                </span>
              )}
            </div>
            {bio && <p className="text-sm text-os-text-secondary mt-1 max-w-lg">{bio}</p>}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <button
                onClick={handleCopyAddress}
                className="flex items-center gap-1.5 text-xs text-os-text-secondary hover:text-white font-mono transition-colors"
              >
                {truncated}
                <CopyIcon size={11} />
              </button>
              {website && (
                <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-os-text-secondary hover:text-os-primary transition-colors">
                  <GlobeIcon size={12} />
                  <span className="truncate max-w-[120px]">{website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
              {twitter && (
                <a href={`https://x.com/${twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-os-text-secondary hover:text-os-primary transition-colors">
                  <XSocialIcon size={12} />
                  @{twitter}
                </a>
              )}
              {discord && (
                <span className="flex items-center gap-1 text-xs text-os-text-secondary">
                  <DiscordIcon size={12} />
                  {discord}
                </span>
              )}
            </div>
          </div>

          {/* Edit Profile button */}
          <button
            onClick={() => navigate('/account/settings')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-os-surface border border-os-border hover:border-os-primary/30 text-sm font-medium text-os-text-secondary hover:text-white transition-all shrink-0 self-start sm:self-end"
          >
            <EditIcon size={14} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Items Owned" value={profileTokens.length} accent="bg-os-primary" />
        <StatCard label="Purchases" value={successfulPurchases.length} accent="bg-os-green" />
        <StatCard label="Watchlist" value={wishlistCount} accent="bg-os-yellow" />
        <StatCard label="Total Spent" value={totalSpent > 0 ? `${totalSpent.toFixed(1)} ICP` : '\u2014'} accent="bg-purple-500" />
      </div>

      {/* ── Main Layout: Sidebar + Content ── */}
      <div className="flex flex-col lg:flex-row gap-6 pb-12">
        {/* Sidebar */}
        <nav className="lg:w-[200px] shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible hide-scrollbar pb-2 lg:pb-0 lg:sticky lg:top-[160px]">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => navigate(t.key === 'overview' ? '/account' : `/account/${t.key}`)}
                  className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-os-primary/8 text-white'
                      : 'text-os-text-secondary hover:text-white hover:bg-os-card/40'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-os-primary" />
                  )}
                  <Icon size={16} className={isActive ? 'text-os-primary' : ''} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'overview' && <AccountOverview />}
          {activeTab === 'purchases' && <PurchaseHistory />}
          {activeTab === 'watchlist' && <Watchlist />}
          {activeTab === 'listings' && <MyListings />}
          {activeTab === 'collection' && <MyCollection />}
          {activeTab === 'settings' && <AccountSettings />}
        </div>
      </div>
    </div>
  );
};

export default Account;
