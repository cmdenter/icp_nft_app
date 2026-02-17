import React, { useState } from 'react';
import { useNFTStore } from '../../store/nftStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useNotificationStore } from '../../store/notificationStore';
import {
  CopyIcon, GlobeIcon, XSocialIcon, DiscordIcon,
  LinkIcon,
} from '../icons';
import { COLLECTIONS } from '../../api/collections';
import { getExtImageUrls } from '../../api/ext';
import { SafeImg } from '../SafeImg';

const THEME_COLORS = [
  '#2081E2', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981',
  '#EF4444', '#06B6D4', '#F97316',
];

const Section: React.FC<{ title: string; desc?: string; children: React.ReactNode }> = ({ title, desc, children }) => (
  <div className="rounded-2xl border border-os-border/50 bg-os-surface overflow-hidden">
    <div className="px-5 py-4 border-b border-os-border/30">
      <h3 className="text-sm font-bold text-white">{title}</h3>
      {desc && <p className="text-[11px] text-os-text-secondary mt-0.5">{desc}</p>}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const FieldLabel: React.FC<{ label: string; hint?: string }> = ({ label, hint }) => (
  <label className="block mb-1.5">
    <span className="text-[13px] font-semibold text-white">{label}</span>
    {hint && <span className="text-[11px] text-os-text-secondary ml-2">{hint}</span>}
  </label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className="w-full bg-os-card border border-os-border/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-os-text-secondary/50 focus:outline-none focus:border-os-primary/50 focus:ring-1 focus:ring-os-primary/20 transition-all"
  />
);

export const AccountSettings: React.FC = () => {
  const plugConnected = useNFTStore((s) => s.plugConnected);
  const plugPrincipal = useNFTStore((s) => s.plugPrincipal);
  const plugAccountId = useNFTStore((s) => s.plugAccountId);
  const principal = useNFTStore((s) => s.principal);

  const displayName = useSettingsStore((s) => s.displayName);
  const bio = useSettingsStore((s) => s.bio);
  const avatarUrl = useSettingsStore((s) => s.avatarUrl);
  const bannerUrl = useSettingsStore((s) => s.bannerUrl);
  const themeColor = useSettingsStore((s) => s.themeColor);
  const website = useSettingsStore((s) => s.website);
  const twitter = useSettingsStore((s) => s.twitter);
  const discord = useSettingsStore((s) => s.discord);
  const setField = useSettingsStore((s) => s.setField);
  const showToast = useNotificationStore((s) => s.showToast);

  const extCol = COLLECTIONS.find((c) => c.standard === 'ext');
  const defaultAvatarUrls = extCol ? getExtImageUrls(extCol.canisterId, 7) : [];
  const defaultBannerUrls = extCol ? getExtImageUrls(extCol.canisterId, 42) : [];

  const [localName, setLocalName] = useState(displayName);
  const [localBio, setLocalBio] = useState(bio);
  const [localWebsite, setLocalWebsite] = useState(website);
  const [localTwitter, setLocalTwitter] = useState(twitter);
  const [localDiscord, setLocalDiscord] = useState(discord);
  const [, setCopied] = useState('');

  const handleSave = () => {
    setField('displayName', localName);
    setField('bio', localBio);
    setField('website', localWebsite);
    setField('twitter', localTwitter);
    setField('discord', localDiscord);
    showToast({ type: 'success', title: 'Profile saved' });
  };

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    showToast({ type: 'success', title: 'Copied!' });
    setTimeout(() => setCopied(''), 2000);
  };

  const handleImageUrl = (field: 'bannerUrl' | 'avatarUrl') => {
    const url = prompt(field === 'bannerUrl' ? 'Enter banner image URL:' : 'Enter avatar image URL:');
    if (url) {
      setField(field, url);
      showToast({ type: 'success', title: `${field === 'bannerUrl' ? 'Banner' : 'Avatar'} updated` });
    }
  };

  const dirty =
    localName !== displayName ||
    localBio !== bio ||
    localWebsite !== website ||
    localTwitter !== twitter ||
    localDiscord !== discord;

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Profile Info */}
      <Section title="Profile Information" desc="How others see you on the platform">
        <div className="space-y-4">
          <div>
            <FieldLabel label="Display Name" hint="Max 30 characters" />
            <Input
              type="text"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="Enter your display name"
              maxLength={30}
            />
          </div>

          <div>
            <FieldLabel label="Bio" hint="Optional, max 160 characters" />
            <textarea
              value={localBio}
              onChange={(e) => setLocalBio(e.target.value)}
              placeholder="Tell others about yourself..."
              maxLength={160}
              rows={3}
              className="w-full bg-os-card border border-os-border/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-os-text-secondary/50 focus:outline-none focus:border-os-primary/50 focus:ring-1 focus:ring-os-primary/20 transition-all resize-none"
            />
            <p className="text-[10px] text-os-text-secondary mt-1 text-right">{localBio.length}/160</p>
          </div>
        </div>
      </Section>

      {/* Social Links */}
      <Section title="Social Links" desc="Connect your online presence">
        <div className="space-y-3">
          <div>
            <FieldLabel label="Website" />
            <div className="relative">
              <GlobeIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-os-text-secondary" />
              <Input
                type="url"
                value={localWebsite}
                onChange={(e) => setLocalWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
          </div>
          <div>
            <FieldLabel label="X (Twitter)" />
            <div className="relative">
              <XSocialIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-os-text-secondary" />
              <Input
                type="text"
                value={localTwitter}
                onChange={(e) => setLocalTwitter(e.target.value)}
                placeholder="username"
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
          </div>
          <div>
            <FieldLabel label="Discord" />
            <div className="relative">
              <DiscordIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-os-text-secondary" />
              <Input
                type="text"
                value={localDiscord}
                onChange={(e) => setLocalDiscord(e.target.value)}
                placeholder="username#0000"
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Appearance" desc="Customize your profile look">
        <div className="space-y-4">
          {/* Theme Color */}
          <div>
            <FieldLabel label="Theme Color" />
            <div className="flex items-center gap-2 flex-wrap">
              {THEME_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setField('themeColor', c)}
                  className={`w-8 h-8 rounded-lg transition-all duration-200 ${
                    themeColor === c
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-os-surface scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Avatar URL */}
          <div>
            <FieldLabel label="Profile Picture" hint="Upload from account page or enter URL" />
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-os-card border border-os-border/50 overflow-hidden shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <SafeImg
                    urls={defaultAvatarUrls}
                    alt=""
                    fallback="?"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleImageUrl('avatarUrl')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-os-card border border-os-border/50 text-xs text-os-text-secondary hover:text-white hover:border-os-primary/30 transition-all"
                >
                  <LinkIcon size={12} />
                  Enter URL
                </button>
                {avatarUrl && (
                  <button
                    onClick={() => { setField('avatarUrl', ''); showToast({ type: 'info', title: 'Avatar removed' }); }}
                    className="px-3 py-2 rounded-lg text-xs text-os-text-secondary hover:text-os-secondary transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Banner URL */}
          <div>
            <FieldLabel label="Banner Image" hint="Upload from account page or enter URL" />
            <div className="flex items-center gap-3">
              <div className="w-20 h-10 rounded-lg bg-os-card border border-os-border/50 overflow-hidden shrink-0">
                {bannerUrl ? (
                  <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <SafeImg
                    urls={defaultBannerUrls}
                    alt=""
                    fallback=""
                    className="w-full h-full object-cover opacity-60"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleImageUrl('bannerUrl')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-os-card border border-os-border/50 text-xs text-os-text-secondary hover:text-white hover:border-os-primary/30 transition-all"
                >
                  <LinkIcon size={12} />
                  Enter URL
                </button>
                {bannerUrl && (
                  <button
                    onClick={() => { setField('bannerUrl', ''); showToast({ type: 'info', title: 'Banner removed' }); }}
                    className="px-3 py-2 rounded-lg text-xs text-os-text-secondary hover:text-os-secondary transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Wallet Info */}
      <Section title="Wallet" desc="Your blockchain identity">
        {plugConnected ? (
          <div className="space-y-3">
            <div>
              <p className="text-[11px] text-os-text-secondary uppercase tracking-wider mb-1.5 font-medium">Principal ID</p>
              <div className="flex items-center gap-2 bg-os-card rounded-lg px-3 py-2.5">
                <code className="text-xs text-os-primary font-mono break-all flex-1">{plugPrincipal}</code>
                <button
                  onClick={() => handleCopy(plugPrincipal, 'principal')}
                  className="text-os-text-secondary hover:text-white shrink-0 p-1"
                >
                  <CopyIcon size={12} />
                </button>
              </div>
            </div>
            {plugAccountId && (
              <div>
                <p className="text-[11px] text-os-text-secondary uppercase tracking-wider mb-1.5 font-medium">Account ID</p>
                <div className="flex items-center gap-2 bg-os-card rounded-lg px-3 py-2.5">
                  <code className="text-xs text-os-primary font-mono break-all flex-1">{plugAccountId}</code>
                  <button
                    onClick={() => handleCopy(plugAccountId, 'account')}
                    className="text-os-text-secondary hover:text-white shrink-0 p-1"
                  >
                    <CopyIcon size={12} />
                  </button>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <div className="w-2 h-2 rounded-full bg-os-green" />
              <span className="text-xs text-os-green font-semibold">Connected via Plug</span>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-[11px] text-os-text-secondary uppercase tracking-wider mb-1.5 font-medium">Identity Principal</p>
            <div className="flex items-center gap-2 bg-os-card rounded-lg px-3 py-2.5">
              <code className="text-xs text-os-text-secondary font-mono break-all">{principal}</code>
            </div>
            <p className="text-xs text-os-text-secondary mt-3">Connect Plug wallet for full functionality.</p>
          </div>
        )}
      </Section>

      {/* Save Button — sticky at bottom */}
      {dirty && (
        <div className="sticky bottom-4 z-10">
          <div className="flex items-center justify-between bg-os-surface/95 backdrop-blur-md border border-os-primary/30 rounded-xl px-5 py-3 shadow-xl shadow-black/30">
            <p className="text-sm text-os-text-secondary">You have unsaved changes</p>
            <button
              onClick={handleSave}
              className="btn btn-md btn-primary"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
