import React, { useState } from 'react';
import { useAdminStore } from '../store/adminStore';
import {
  MegaphoneIcon,
  NewspaperIcon,
  SettingsIcon,
  PinIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  TagIcon,
  ImageIcon,
} from '../components/icons';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GRADIENT_PRESETS = [
  'from-blue-500 to-purple-600',
  'from-pink-500 to-rose-600',
  'from-green-500 to-emerald-600',
  'from-orange-500 to-amber-600',
  'from-indigo-500 to-blue-600',
  'from-violet-500 to-fuchsia-600',
  'from-cyan-500 to-teal-600',
  'from-red-500 to-orange-600',
];

const TABS = [
  { key: 'banners', label: 'Banners', icon: MegaphoneIcon },
  { key: 'ads', label: 'Ads', icon: TagIcon },
  { key: 'news', label: 'News', icon: NewspaperIcon },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const INPUT_CLASS =
  'w-full bg-os-card border border-os-border/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-os-text-secondary/50 focus:outline-none focus:border-os-primary/50 focus:ring-1 focus:ring-os-primary/20 transition-all';

// ---------------------------------------------------------------------------
// Toggle Switch
// ---------------------------------------------------------------------------

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({
  checked,
  onChange,
}) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
      checked ? 'bg-os-primary' : 'bg-os-border'
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

const StatCard: React.FC<{ label: string; value: string | number; accent: string }> = ({
  label,
  value,
  accent,
}) => (
  <div className="relative overflow-hidden rounded-xl bg-os-surface/80 border border-os-border/50 p-4 backdrop-blur-sm">
    <div className={`absolute top-0 left-0 w-1 h-full ${accent}`} />
    <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    <p className="text-[11px] text-os-text-secondary font-medium mt-0.5 uppercase tracking-wider">
      {label}
    </p>
  </div>
);

// ---------------------------------------------------------------------------
// Banners Tab
// ---------------------------------------------------------------------------

const BannersTab: React.FC = () => {
  const banners = useAdminStore((s) => s.banners);
  const addBanner = useAdminStore((s) => s.addBanner);
  const updateBanner = useAdminStore((s) => s.updateBanner);
  const deleteBanner = useAdminStore((s) => s.deleteBanner);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [gradient, setGradient] = useState(GRADIENT_PRESETS[0]);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    addBanner({
      title: title.trim(),
      message: message.trim(),
      link: link.trim() || undefined,
      gradient,
      active: true,
    });
    setTitle('');
    setMessage('');
    setLink('');
    setGradient(GRADIENT_PRESETS[0]);
    setShowForm(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Banners</h2>
          <p className="text-sm text-os-text-secondary mt-0.5">
            Manage promotional banners displayed across the site
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-os-primary hover:bg-os-primary-hover text-white text-sm font-medium transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          Add New
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-5 rounded-2xl bg-os-surface/60 border border-os-border/40 space-y-4"
        >
          <input
            type="text"
            placeholder="Banner title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={INPUT_CLASS}
          />
          <textarea
            placeholder="Banner message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className={INPUT_CLASS + ' resize-none'}
          />
          <input
            type="text"
            placeholder="Link URL (optional)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className={INPUT_CLASS}
          />

          {/* Gradient Picker */}
          <div>
            <label className="block text-xs font-medium text-os-text-secondary mb-2">
              Gradient
            </label>
            <div className="flex flex-wrap gap-2">
              {GRADIENT_PRESETS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGradient(g)}
                  className={`w-10 h-10 rounded-lg bg-gradient-to-r ${g} transition-all ${
                    gradient === g
                      ? 'ring-2 ring-os-primary ring-offset-2 ring-offset-os-bg scale-110'
                      : 'hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-os-primary hover:bg-os-primary-hover text-white text-sm font-medium transition-colors"
            >
              Create Banner
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl bg-os-card border border-os-border/60 text-os-text-secondary hover:text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Banner List */}
      {banners.length === 0 ? (
        <div className="text-center py-12 text-os-text-secondary">
          <MegaphoneIcon size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No banners yet. Create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div
              key={b.id}
              className="rounded-xl bg-os-surface/60 border border-os-border/40 overflow-hidden"
            >
              {/* Gradient preview strip */}
              <div className={`h-2 bg-gradient-to-r ${b.gradient}`} />
              <div className="p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white truncate">{b.title}</h3>
                    {b.active ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-os-green/10 text-os-green border border-os-green/20">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-os-border/30 text-os-text-secondary border border-os-border/40">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-os-text-secondary line-clamp-2">{b.message}</p>
                  {b.link && (
                    <p className="text-[11px] text-os-primary mt-1 truncate">{b.link}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <ToggleSwitch
                    checked={b.active}
                    onChange={() => updateBanner(b.id, { active: !b.active })}
                  />
                  <button
                    onClick={() => deleteBanner(b.id)}
                    className="p-1.5 rounded-lg text-os-text-secondary hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Ads Tab
// ---------------------------------------------------------------------------

const AdsTab: React.FC = () => {
  const ads = useAdminStore((s) => s.ads);
  const addAd = useAdminStore((s) => s.addAd);
  const updateAd = useAdminStore((s) => s.updateAd);
  const deleteAd = useAdminStore((s) => s.deleteAd);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [placement, setPlacement] = useState<'sidebar' | 'feed' | 'banner'>('sidebar');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !link.trim()) return;
    addAd({
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || undefined,
      link: link.trim(),
      placement,
      active: true,
    });
    setTitle('');
    setDescription('');
    setImageUrl('');
    setLink('');
    setPlacement('sidebar');
    setShowForm(false);
  };

  const placementColor = (p: string) => {
    switch (p) {
      case 'sidebar':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'feed':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'banner':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-os-border/30 text-os-text-secondary border-os-border/40';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Ads</h2>
          <p className="text-sm text-os-text-secondary mt-0.5">
            Manage advertisements and their placements
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-os-primary hover:bg-os-primary-hover text-white text-sm font-medium transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          Add New
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-5 rounded-2xl bg-os-surface/60 border border-os-border/40 space-y-4"
        >
          <input
            type="text"
            placeholder="Ad title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={INPUT_CLASS}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={INPUT_CLASS + ' resize-none'}
          />
          <input
            type="text"
            placeholder="Image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className={INPUT_CLASS}
          />
          <input
            type="text"
            placeholder="Link URL"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className={INPUT_CLASS}
          />

          {/* Placement Dropdown */}
          <div>
            <label className="block text-xs font-medium text-os-text-secondary mb-2">
              Placement
            </label>
            <select
              value={placement}
              onChange={(e) => setPlacement(e.target.value as 'sidebar' | 'feed' | 'banner')}
              className={INPUT_CLASS + ' appearance-none cursor-pointer'}
            >
              <option value="sidebar">Sidebar</option>
              <option value="feed">Feed</option>
              <option value="banner">Banner</option>
            </select>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-os-primary hover:bg-os-primary-hover text-white text-sm font-medium transition-colors"
            >
              Create Ad
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl bg-os-card border border-os-border/60 text-os-text-secondary hover:text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Ad List */}
      {ads.length === 0 ? (
        <div className="text-center py-12 text-os-text-secondary">
          <TagIcon size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No ads yet. Create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ads.map((a) => (
            <div
              key={a.id}
              className="rounded-xl bg-os-surface/60 border border-os-border/40 p-4 flex items-start gap-4"
            >
              {/* Image preview */}
              {a.imageUrl && (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-os-card shrink-0">
                  <img
                    src={a.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              {!a.imageUrl && (
                <div className="w-16 h-16 rounded-lg bg-os-card flex items-center justify-center shrink-0">
                  <ImageIcon size={20} className="text-os-text-secondary/40" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white truncate">{a.title}</h3>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${placementColor(
                      a.placement
                    )}`}
                  >
                    {a.placement}
                  </span>
                  {a.active ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-os-green/10 text-os-green border border-os-green/20">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-os-border/30 text-os-text-secondary border border-os-border/40">
                      Inactive
                    </span>
                  )}
                </div>
                {a.description && (
                  <p className="text-xs text-os-text-secondary line-clamp-2">{a.description}</p>
                )}
                <p className="text-[11px] text-os-primary mt-1 truncate">{a.link}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <ToggleSwitch
                  checked={a.active}
                  onChange={() => updateAd(a.id, { active: !a.active })}
                />
                <button
                  onClick={() => deleteAd(a.id)}
                  className="p-1.5 rounded-lg text-os-text-secondary hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// News Tab
// ---------------------------------------------------------------------------

const NewsTab: React.FC = () => {
  const news = useAdminStore((s) => s.news);
  const addNews = useAdminStore((s) => s.addNews);
  const updateNews = useAdminStore((s) => s.updateNews);
  const deleteNews = useAdminStore((s) => s.deleteNews);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [author, setAuthor] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !author.trim()) return;
    addNews({
      title: title.trim(),
      body: body.trim(),
      author: author.trim(),
      pinned: false,
    });
    setTitle('');
    setBody('');
    setAuthor('');
    setShowForm(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">News</h2>
          <p className="text-sm text-os-text-secondary mt-0.5">
            Publish and manage news posts
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-os-primary hover:bg-os-primary-hover text-white text-sm font-medium transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          Add New
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-5 rounded-2xl bg-os-surface/60 border border-os-border/40 space-y-4"
        >
          <input
            type="text"
            placeholder="News title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={INPUT_CLASS}
          />
          <textarea
            placeholder="Article body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            className={INPUT_CLASS + ' resize-none'}
          />
          <input
            type="text"
            placeholder="Author name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className={INPUT_CLASS}
          />

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-os-primary hover:bg-os-primary-hover text-white text-sm font-medium transition-colors"
            >
              Publish
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl bg-os-card border border-os-border/60 text-os-text-secondary hover:text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* News List */}
      {news.length === 0 ? (
        <div className="text-center py-12 text-os-text-secondary">
          <NewspaperIcon size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No news posts yet. Publish your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {news.map((n) => (
            <div
              key={n.id}
              className="rounded-xl bg-os-surface/60 border border-os-border/40 p-4 flex items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {n.pinned && (
                    <PinIcon size={14} className="text-os-yellow shrink-0" />
                  )}
                  <h3 className="text-sm font-semibold text-white truncate">{n.title}</h3>
                  {n.pinned && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-os-yellow/10 text-os-yellow border border-os-yellow/20">
                      Pinned
                    </span>
                  )}
                </div>
                <p className="text-xs text-os-text-secondary line-clamp-2 mb-1">{n.body}</p>
                <p className="text-[11px] text-os-text-secondary/60">
                  By {n.author} &middot;{' '}
                  {new Date(n.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => updateNews(n.id, { pinned: !n.pinned })}
                  className={`p-1.5 rounded-lg transition-colors ${
                    n.pinned
                      ? 'text-os-yellow bg-os-yellow/10'
                      : 'text-os-text-secondary hover:text-os-yellow hover:bg-os-yellow/10'
                  }`}
                  title={n.pinned ? 'Unpin' : 'Pin'}
                >
                  <PinIcon size={16} />
                </button>
                <button
                  onClick={() => deleteNews(n.id)}
                  className="p-1.5 rounded-lg text-os-text-secondary hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Settings Tab
// ---------------------------------------------------------------------------

const SettingsTab: React.FC = () => {
  const isAdmin = useAdminStore((s) => s.isAdmin);
  const toggleAdmin = useAdminStore((s) => s.toggleAdmin);
  const banners = useAdminStore((s) => s.banners);
  const ads = useAdminStore((s) => s.ads);
  const news = useAdminStore((s) => s.news);

  const [confirmClear, setConfirmClear] = useState(false);

  const activeBanners = banners.filter((b) => b.active).length;
  const activeAds = ads.filter((a) => a.active).length;
  const totalNews = news.length;

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    // Delete all items
    banners.forEach((b) => useAdminStore.getState().deleteBanner(b.id));
    ads.forEach((a) => useAdminStore.getState().deleteAd(a.id));
    news.forEach((n) => useAdminStore.getState().deleteNews(n.id));
    setConfirmClear(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Settings</h2>
        <p className="text-sm text-os-text-secondary mt-0.5">
          Configure admin preferences and manage data
        </p>
      </div>

      {/* Admin Mode Toggle */}
      <div className="rounded-xl bg-os-surface/60 border border-os-border/40 p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Admin Mode</h3>
            <p className="text-xs text-os-text-secondary max-w-md">
              Enable admin mode to access management features across the platform.
              When enabled, admin controls will appear on applicable pages.
            </p>
          </div>
          <ToggleSwitch checked={isAdmin} onChange={toggleAdmin} />
        </div>
        <div className="mt-3 flex items-center gap-2">
          {isAdmin ? (
            <>
              <CheckCircleIcon size={14} className="text-os-green" />
              <span className="text-xs font-medium text-os-green">Admin mode is active</span>
            </>
          ) : (
            <>
              <XCircleIcon size={14} className="text-os-text-secondary" />
              <span className="text-xs font-medium text-os-text-secondary">
                Admin mode is inactive
              </span>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard label="Active Banners" value={activeBanners} accent="bg-os-primary" />
          <StatCard label="Active Ads" value={activeAds} accent="bg-os-green" />
          <StatCard label="Total News" value={totalNews} accent="bg-os-yellow" />
        </div>
      </div>

      {/* Clear All Data */}
      <div className="rounded-xl bg-os-surface/60 border border-red-500/20 p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Danger Zone</h3>
        <p className="text-xs text-os-text-secondary mb-4">
          This will permanently remove all banners, ads, and news posts. This action cannot be
          undone.
        </p>
        {!confirmClear ? (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
          >
            Clear All Data
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearAll}
              className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Yes, Delete Everything
            </button>
            <button
              onClick={() => setConfirmClear(false)}
              className="px-4 py-2 rounded-xl bg-os-card border border-os-border/60 text-os-text-secondary hover:text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Admin Page
// ---------------------------------------------------------------------------

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('banners');
  const banners = useAdminStore((s) => s.banners);
  const ads = useAdminStore((s) => s.ads);
  const news = useAdminStore((s) => s.news);

  const activeBanners = banners.filter((b) => b.active).length;
  const activeAds = ads.filter((a) => a.active).length;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
      {/* ── Gradient Hero Banner ── */}
      <div className="relative -mx-4 sm:-mx-6 overflow-hidden">
        <div className="h-[160px] sm:h-[200px] relative">
          <div className="absolute inset-0 bg-gradient-to-br from-os-primary/30 via-purple-600/20 to-os-secondary/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-os-bg via-os-bg/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end px-6 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-os-primary/20 border border-os-primary/30 flex items-center justify-center">
                <SettingsIcon size={20} className="text-os-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-sm text-os-text-secondary">
              Manage banners, advertisements, news, and platform settings
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 mb-8">
        <StatCard label="Active Banners" value={activeBanners} accent="bg-os-primary" />
        <StatCard label="Active Ads" value={activeAds} accent="bg-os-green" />
        <StatCard label="News Posts" value={news.length} accent="bg-os-yellow" />
        <StatCard
          label="Total Items"
          value={banners.length + ads.length + news.length}
          accent="bg-purple-500"
        />
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
                  onClick={() => setActiveTab(t.key)}
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
          {activeTab === 'banners' && <BannersTab />}
          {activeTab === 'ads' && <AdsTab />}
          {activeTab === 'news' && <NewsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
};

export default Admin;
