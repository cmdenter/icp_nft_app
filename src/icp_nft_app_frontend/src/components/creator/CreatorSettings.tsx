import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatorStore } from '../../store/creatorStore';
import { useNotificationStore } from '../../store/notificationStore';
import { TrashIcon } from '../icons';
import { timeAgo } from '../../utils/format';
import type { CreatorInfo, CollectionEntry } from '../../types';

interface CreatorSettingsProps {
  creatorId: string;
  creator: CreatorInfo;
  collections: CollectionEntry[];
}

const inputClass =
  'bg-os-card border border-os-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-os-text-secondary focus:outline-none focus:border-os-primary/50 w-full';
const labelClass = 'text-sm font-medium text-os-text-secondary mb-1.5';

export function CreatorSettings({ creatorId, creator, collections }: CreatorSettingsProps) {
  const navigate = useNavigate();
  const profileOverrides = useCreatorStore((s) => s.profileOverrides);
  const updateProfile = useCreatorStore((s) => s.updateProfile);
  const addAnnouncement = useCreatorStore((s) => s.addAnnouncement);
  const deleteAnnouncement = useCreatorStore((s) => s.deleteAnnouncement);
  const announcements = useCreatorStore((s) => s.getAnnouncements(creatorId));
  const unclaimCreatorPage = useCreatorStore((s) => s.unclaimCreatorPage);
  const showToast = useNotificationStore((s) => s.showToast);

  // Merge creator defaults with any saved overrides
  const merged = { ...creator, ...profileOverrides[creatorId] };

  const [displayName, setDisplayName] = useState(merged.name || '');
  const [bio, setBio] = useState(merged.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(merged.avatar || '');
  const [website, setWebsite] = useState(merged.website || '');
  const [twitter, setTwitter] = useState(merged.twitter || '');
  const [discord, setDiscord] = useState(merged.discord || '');
  const [github, setGithub] = useState(merged.github || '');

  const [announcementText, setAnnouncementText] = useState('');
  const [confirmUnclaim, setConfirmUnclaim] = useState(false);

  function handleSaveProfile() {
    updateProfile(creatorId, {
      name: displayName,
      bio,
      avatar: avatarUrl,
      website,
      twitter,
      discord,
      github,
    });
    showToast({ type: 'success', title: 'Profile updated' });
  }

  function handlePostAnnouncement() {
    const text = announcementText.trim();
    if (!text) return;
    addAnnouncement(creatorId, text);
    setAnnouncementText('');
    showToast({ type: 'success', title: 'Announcement posted' });
  }

  function handleDeleteAnnouncement(id: string) {
    deleteAnnouncement(creatorId, id);
    showToast({ type: 'info', title: 'Announcement deleted' });
  }

  function handleUnclaim() {
    if (!confirmUnclaim) {
      setConfirmUnclaim(true);
      return;
    }
    unclaimCreatorPage(creatorId);
    navigate(`/creator/${creatorId}`);
  }

  return (
    <div className="space-y-8">
      {/* Profile Settings */}
      <div className="rounded-2xl bg-os-surface border border-os-border p-6">
        <h3 className="text-lg font-bold text-white mb-5">Profile Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself..."
              rows={3}
              className={inputClass + ' resize-none'}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Avatar URL</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Website</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yoursite.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Twitter Handle</label>
            <input
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="@handle"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Discord URL</label>
            <input
              type="text"
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
              placeholder="https://discord.gg/..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>GitHub URL</label>
            <input
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="https://github.com/username"
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-5">
          <button onClick={handleSaveProfile} className="btn btn-md btn-primary">
            Save Changes
          </button>
        </div>
      </div>

      {/* Announcements */}
      <div className="rounded-2xl bg-os-surface border border-os-border p-6">
        <h3 className="text-lg font-bold text-white mb-1">Announcements</h3>
        <p className="text-xs text-os-text-secondary mb-4">
          Post announcements visible on your creator page
        </p>

        <div className="flex gap-2">
          <textarea
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="Write an announcement..."
            rows={2}
            className={inputClass + ' resize-none flex-1'}
          />
        </div>
        <div className="mt-3">
          <button
            onClick={handlePostAnnouncement}
            disabled={!announcementText.trim()}
            className="btn btn-md btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Post Announcement
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {announcements.length === 0 ? (
            <p className="text-sm text-os-text-secondary py-4 text-center">
              No announcements posted
            </p>
          ) : (
            announcements.map((a) => (
              <div
                key={a.id}
                className="flex items-start justify-between gap-3 rounded-xl bg-os-card/50 border border-os-border/30 p-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{a.text}</p>
                  <p className="text-[11px] text-os-text-secondary mt-1.5">
                    {timeAgo(a.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteAnnouncement(a.id)}
                  className="p-1.5 rounded-lg text-os-text-secondary hover:text-os-secondary hover:bg-os-secondary/10 transition-colors shrink-0"
                  title="Delete announcement"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Royalty Info */}
      <div className="rounded-2xl bg-os-surface border border-os-border p-6">
        <h3 className="text-lg font-bold text-white mb-4">Royalty Settings</h3>
        {collections.length === 0 ? (
          <p className="text-sm text-os-text-secondary">No collections found</p>
        ) : (
          <div className="space-y-3">
            {collections.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl bg-os-card/50 border border-os-border/30 px-4 py-3"
              >
                <span className="text-sm font-semibold text-white">{c.name}</span>
                <span className="text-sm text-os-text-secondary">
                  {c.royaltyPercent != null ? `${c.royaltyPercent}%` : 'Not set'}
                </span>
              </div>
            ))}
          </div>
        )}
        <p className="text-[11px] text-os-text-secondary/60 mt-3">
          Royalty percentages are set at the smart contract level
        </p>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-os-secondary/30 bg-os-secondary/5 p-5">
        <h3 className="text-lg font-bold text-os-secondary mb-2">Danger Zone</h3>
        <p className="text-xs text-os-text-secondary mb-4">
          This will remove your access to this dashboard
        </p>
        <button
          onClick={handleUnclaim}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            confirmUnclaim
              ? 'bg-os-secondary text-white hover:bg-os-secondary/80'
              : 'bg-os-secondary/10 text-os-secondary border border-os-secondary/30 hover:bg-os-secondary/20'
          }`}
        >
          {confirmUnclaim ? 'Click again to confirm' : 'Unclaim Page'}
        </button>
      </div>
    </div>
  );
}
