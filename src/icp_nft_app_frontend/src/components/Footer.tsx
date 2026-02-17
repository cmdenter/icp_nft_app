import React from 'react';
import { Link } from 'react-router-dom';
import { ICPLogo, ShieldCheckIcon, CheckCircleIcon, XSocialIcon, DiscordIcon, GithubIcon } from './icons';

const SECTIONS = [
  {
    title: 'Marketplace',
    links: [
      { label: 'Explore', to: '/' },
      { label: 'Rankings', to: '/rankings' },
      { label: 'Create NFT', to: '/create' },
      { label: 'Chat', to: '/chat' },
      { label: 'Admin', to: '/admin' },
    ],
  },
  {
    title: 'My Account',
    links: [
      { label: 'Account Overview', to: '/account' },
      { label: 'Purchase History', to: '/account/purchases' },
      { label: 'Watchlist', to: '/account/watchlist' },
      { label: 'My Listings', to: '/account/listings' },
      { label: 'My Collection', to: '/account/collection' },
      { label: 'Settings', to: '/account/settings' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'About ICP', href: 'https://internetcomputer.org' },
      { label: 'Developer Docs', href: 'https://internetcomputer.org/docs' },
      { label: 'DFINITY Foundation', href: 'https://dfinity.org' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Twitter / X', href: 'https://twitter.com/dfinity' },
      { label: 'Discord', href: 'https://discord.gg/internet-computer' },
      { label: 'GitHub', href: 'https://github.com/dfinity' },
    ],
  },
];

export const Footer: React.FC = () => (
  <footer className="bg-os-surface/60 border-t border-os-border/30 mt-12">
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h3 className="text-sm font-bold text-white mb-4 tracking-wide">{section.title}</h3>
            <ul className="space-y-2.5">
              {section.links.map((link) => (
                <li key={link.label}>
                  {'to' in link ? (
                    <Link
                      to={link.to}
                      className="text-sm text-os-text-secondary hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-os-text-secondary hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="pt-8 border-t border-os-border/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Left: Logo + Powered by */}
          <div className="flex items-center gap-4">
            <ICPLogo size={36} />
            <div>
              <span className="text-sm font-bold text-white">ICP NFTs</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] text-os-text-secondary">Powered by</span>
                <span className="text-[11px] text-os-primary font-semibold">Internet Computer</span>
              </div>
            </div>
          </div>

          {/* Center: Trust badges */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-os-text-secondary/60">
              <ShieldCheckIcon size={14} />
              <span className="text-[11px]">100% On-Chain</span>
            </div>
            <div className="flex items-center gap-1.5 text-os-text-secondary/60">
              <CheckCircleIcon size={14} />
              <span className="text-[11px]">Verified Collections</span>
            </div>
          </div>

          {/* Right: Social icons */}
          <div className="flex items-center gap-2">
            <a
              href="https://twitter.com/dfinity"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-os-card flex items-center justify-center text-os-text-secondary hover:text-white hover:bg-os-primary/20 transition-colors"
              aria-label="Twitter"
            >
              <XSocialIcon size={14} />
            </a>
            <a
              href="https://discord.gg/internet-computer"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-os-card flex items-center justify-center text-os-text-secondary hover:text-white hover:bg-os-primary/20 transition-colors"
              aria-label="Discord"
            >
              <DiscordIcon size={14} />
            </a>
            <a
              href="https://github.com/dfinity"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-os-card flex items-center justify-center text-os-text-secondary hover:text-white hover:bg-os-primary/20 transition-colors"
              aria-label="GitHub"
            >
              <GithubIcon size={14} />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-[11px] text-os-text-secondary/40 text-center mt-6">
          &copy; {new Date().getFullYear()} ICP NFTs. Built on the Internet Computer.
        </p>
      </div>
    </div>
  </footer>
);
