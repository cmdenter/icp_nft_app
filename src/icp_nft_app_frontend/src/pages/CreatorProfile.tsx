import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCreator, getCollectionsByCreator, getCreatorAvatarUrls, getCollectionBannerUrls } from '../api/collections';
import { useCreatorStore } from '../store/creatorStore';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SafeImg } from '../components/SafeImg';
import { ExternalLink, XSocialIcon, DiscordIcon, GithubIcon, ShieldCheckIcon, SettingsIcon } from '../components/icons';
import CreatorCollectionCard from '../components/CreatorCollectionCard';
import { timeAgo } from '../utils/format';

export default function CreatorProfile() {
  const { creatorId } = useParams<{ creatorId: string }>();
  const navigate = useNavigate();
  const isClaimed = useCreatorStore((s) => s.isCreatorClaimed(creatorId || ''));
  const claimPage = useCreatorStore((s) => s.claimCreatorPage);
  const announcements = useCreatorStore((s) => s.getAnnouncements(creatorId || ''));
  const creator = creatorId ? getCreator(creatorId) : undefined;
  const collections = creatorId ? getCollectionsByCreator(creatorId) : [];

  if (!creator) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-xl font-bold text-white">Creator not found</p>
        <p className="text-sm text-os-text-secondary">
          The creator you are looking for does not exist or has been removed.
        </p>
        <Link to="/" className="btn btn-md btn-primary">
          Back to Explore
        </Link>
      </div>
    );
  }

  const totalItems = collections.reduce((sum, c) => sum + (c.totalSupply ?? 0), 0);
  const bannerUrls = collections.length > 0 ? getCollectionBannerUrls(collections[0]) : [];
  const avatarUrls = creatorId ? getCreatorAvatarUrls(creatorId) : [];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: creator.name }]} />

      {/* Banner */}
      <div className="relative -mx-4 sm:-mx-6 mt-4">
        <div className="h-[160px] sm:h-[200px] overflow-hidden relative">
          {bannerUrls.length > 0 ? (
            <SafeImg
              urls={bannerUrls}
              alt=""
              fallback=""
              className="w-full h-full object-cover blur-sm opacity-40"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-os-primary/20 via-purple-900/20 to-os-bg" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-os-bg via-os-bg/40 to-transparent" />
        </div>
      </div>

      {/* Hero section */}
      <div className="relative -mt-14 flex flex-col sm:flex-row gap-5 items-start">
        {/* Avatar */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl border-4 border-os-bg ring-2 ring-os-border overflow-hidden">
          <SafeImg
            urls={avatarUrls}
            alt={creator.name}
            fallback={creator.name.charAt(0)}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{creator.name}</h1>
          {creator.bio && (
            <p className="text-sm text-os-text-secondary mt-1 max-w-lg">{creator.bio}</p>
          )}

          {/* Social links */}
          <div className="mt-3 flex flex-wrap gap-2">
            {creator.website && (
              <a
                href={creator.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-os-card/80 border border-os-border/30 hover:bg-os-card text-os-text-secondary hover:text-white text-xs transition-colors"
              >
                <ExternalLink size={14} />
                Website
              </a>
            )}
            {creator.twitter && (
              <a
                href={'https://x.com/' + creator.twitter}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-os-card/80 border border-os-border/30 hover:bg-os-card text-os-text-secondary hover:text-white text-xs transition-colors"
              >
                <XSocialIcon size={14} />
                @{creator.twitter}
              </a>
            )}
            {creator.discord && (
              <a
                href={creator.discord}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-os-card/80 border border-os-border/30 hover:bg-os-card text-os-text-secondary hover:text-white text-xs transition-colors"
              >
                <DiscordIcon size={14} />
                Discord
              </a>
            )}
            {creator.github && (
              <a
                href={creator.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-os-card/80 border border-os-border/30 hover:bg-os-card text-os-text-secondary hover:text-white text-xs transition-colors"
              >
                <GithubIcon size={14} />
                GitHub
              </a>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex gap-2">
            {isClaimed ? (
              <button
                onClick={() => navigate(`/creator/${creatorId}/dashboard`)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-os-primary hover:bg-os-primary-hover text-white text-sm font-semibold transition-colors"
              >
                <SettingsIcon size={16} />
                Creator Dashboard
              </button>
            ) : (
              <button
                onClick={() => {
                  claimPage(creatorId || '');
                  navigate(`/creator/${creatorId}/dashboard`);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-os-primary hover:bg-os-primary-hover text-white text-sm font-semibold transition-colors"
              >
                <ShieldCheckIcon size={16} />
                Claim This Page
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-8 flex gap-4">
        <div className="px-5 py-3 rounded-xl bg-os-surface border border-os-border/40">
          <div className="text-lg font-bold text-white">{collections.length}</div>
          <div className="text-[11px] text-os-text-secondary">Collections</div>
        </div>
        <div className="px-5 py-3 rounded-xl bg-os-surface border border-os-border/40">
          <div className="text-lg font-bold text-white">{totalItems.toLocaleString()}</div>
          <div className="text-[11px] text-os-text-secondary">Total Items</div>
        </div>
        <div className="px-5 py-3 rounded-xl bg-os-surface border border-os-border/40">
          <div className="text-lg font-bold text-white">{collections.length}</div>
          <div className="text-[11px] text-os-text-secondary">
            {collections.map((c) => c.name).join(', ')}
          </div>
        </div>
      </div>

      {/* Collections grid */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-white mb-4">Collections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((c) => (
            <CreatorCollectionCard key={c.id} collection={c} />
          ))}
        </div>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-white mb-4">Announcements</h2>
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="rounded-xl bg-os-surface border border-os-border/40 p-4">
                <p className="text-sm text-white">{a.text}</p>
                <p className="text-[11px] text-os-text-secondary mt-2">{timeAgo(a.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
