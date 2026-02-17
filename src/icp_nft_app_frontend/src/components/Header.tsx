import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { NotificationBell } from './NotificationBell';
import { WalletIcon, UserIcon, CartIcon, ICPLogo, MenuIcon, XIcon } from './icons';
import { useNFTStore } from '../store/nftStore';
import { useCartStore } from '../store/cartStore';
import { isPlugAvailable } from '../api/plug-wallet';
import { MegaMenu } from './MegaMenu';

const CartBadge: React.FC = () => {
  const count = useCartStore((s) => s.items.length);
  if (count === 0) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-os-secondary text-white text-[11px] font-bold rounded-full flex items-center justify-center">
      {count > 9 ? '9+' : count}
    </span>
  );
};

export const Header: React.FC = () => {
  const loadCollection = useNFTStore((s) => s.loadCollection);
  const plugConnected = useNFTStore((s) => s.plugConnected);
  const plugPrincipal = useNFTStore((s) => s.plugPrincipal);
  const connectPlugWallet = useNFTStore((s) => s.connectPlugWallet);
  const disconnectPlugWallet = useNFTStore((s) => s.disconnectPlugWallet);
  const [connecting, setConnecting] = useState(false);
  const [walletError, setWalletError] = useState('');
  const [megaOpen, setMegaOpen] = useState(false);
  const location = useLocation();
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  // Close mega menu on route change
  useEffect(() => {
    setMegaOpen(false);
  }, [location.pathname, location.search]);

  // ESC to close
  useEffect(() => {
    if (!megaOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMegaOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [megaOpen]);

  const closeMega = useCallback(() => setMegaOpen(false), []);

  const handleConnect = async () => {
    setWalletError('');
    if (!isPlugAvailable()) {
      setWalletError('Plug wallet not found');
      window.open('https://plugwallet.ooo', '_blank');
      return;
    }
    setConnecting(true);
    try {
      await connectPlugWallet();
    } catch (err) {
      setWalletError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setConnecting(false);
    }
  };

  const truncated = plugPrincipal.length > 16
    ? plugPrincipal.slice(0, 6) + '...' + plugPrincipal.slice(-4)
    : plugPrincipal;

  // Active shop detection
  const path = location.pathname;
  const isTokenShop = path === '/tokens' || path.startsWith('/token/');
  const isNFTShop = !isTokenShop && (path === '/' || path.startsWith('/collection') || path.startsWith('/nft') || path === '/rankings' || path === '/create' || path === '/mint');

  return (
    <>
    {/* ── Shop Selector Bar — slim bar above header ── */}
    <div className="fixed top-0 left-0 right-0 z-50 h-[32px] bg-os-bg border-b border-os-border/30">
      <div className="h-full max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center">
        <div className="flex items-center gap-1 bg-os-surface/60 rounded-lg p-0.5">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-semibold transition-all duration-200 ${
              isNFTShop
                ? 'bg-os-primary/15 text-os-primary shadow-sm'
                : 'text-os-text-secondary hover:text-white'
            }`}
          >
            NFTs
          </Link>
          <Link
            to="/tokens"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-semibold transition-all duration-200 ${
              isTokenShop
                ? 'bg-os-primary/15 text-os-primary shadow-sm'
                : 'text-os-text-secondary hover:text-white'
            }`}
          >
            Tokens
          </Link>
        </div>
      </div>
    </div>

    {/* ── Main Header ── */}
    <header className="fixed top-[32px] left-0 right-0 z-50 header-bg border-b border-os-border/40">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-[72px] flex items-center gap-3 sm:gap-4">
        {/* Logo — far left */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-os-bg/80 border border-os-border/30 flex items-center justify-center">
            <ICPLogo size={28} />
          </div>
        </Link>

        {/* Menu button — opens mega menu dropdown */}
        <button
          onClick={() => setMegaOpen((v) => !v)}
          onMouseEnter={() => {
            clearTimeout(closeTimer.current);
            if (!megaOpen) closeTimer.current = setTimeout(() => setMegaOpen(true), 200);
          }}
          onMouseLeave={() => {
            clearTimeout(closeTimer.current);
          }}
          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors shrink-0 ${
            megaOpen
              ? 'text-white bg-os-card/60'
              : 'text-os-text-secondary hover:text-white hover:bg-os-card/50'
          }`}
          aria-label={megaOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={megaOpen}
        >
          {megaOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
        </button>

        {/* Search — takes up most space */}
        <div className="flex-1 max-w-3xl">
          <SearchBar />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Cart */}
          <Link
            to="/cart"
            aria-label="Shopping cart"
            className="w-10 h-10 rounded-full bg-os-surface border border-os-border flex items-center justify-center hover:border-os-primary/50 hover:ring-2 hover:ring-os-primary/20 transition-all duration-250 relative"
          >
            <CartIcon size={18} className="text-os-text-secondary" />
            <CartBadge />
          </Link>

          {/* Notifications */}
          <NotificationBell />

          {/* Wallet */}
          <div className="relative">
            {plugConnected ? (
              <button
                onClick={disconnectPlugWallet}
                className="flex items-center gap-2.5 bg-os-green/10 border border-os-green/30 rounded-full px-3.5 sm:px-4 py-2 hover:bg-os-green/20 transition-all duration-250 group btn-press"
              >
                <div className="w-2 h-2 rounded-full bg-os-green" />
                <span className="text-xs font-mono text-os-green hidden sm:inline">{truncated}</span>
                <span className="text-[11px] text-os-text-secondary hidden group-hover:inline ml-1">Disconnect</span>
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="btn btn-md btn-primary flex items-center gap-2"
              >
                {connecting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <WalletIcon size={16} />
                )}
                <span className="hidden sm:inline">{connecting ? 'Connecting...' : 'Connect'}</span>
              </button>
            )}

            {walletError && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-os-surface border border-os-secondary/30 rounded-xl p-3.5 shadow-2xl shadow-black/40 z-50 animate-float-in">
                <p className="text-xs text-os-secondary font-semibold mb-1">{walletError}</p>
                <p className="text-[11px] text-os-text-secondary leading-relaxed">
                  Install the{' '}
                  <a href="https://plugwallet.ooo" target="_blank" rel="noopener noreferrer" className="text-os-primary underline">
                    Plug wallet
                  </a>{' '}
                  extension to connect.
                </p>
                <button onClick={() => setWalletError('')} className="mt-2 text-[11px] text-os-text-secondary hover:text-white">
                  Dismiss
                </button>
              </div>
            )}
          </div>

          {/* Profile */}
          <Link
            to="/account"
            aria-label="My account"
            className="w-10 h-10 rounded-full bg-os-surface border border-os-border flex items-center justify-center hover:border-os-primary/50 hover:ring-2 hover:ring-os-primary/20 hover:scale-105 transition-all duration-250"
          >
            <UserIcon size={18} className="text-os-text-secondary" />
          </Link>
        </div>
      </div>
    </header>

    {/* Mega Menu Dropdown */}
    {megaOpen && (
      <div
        onMouseEnter={() => clearTimeout(closeTimer.current)}
        onMouseLeave={() => {
          closeTimer.current = setTimeout(() => setMegaOpen(false), 400);
        }}
      >
        <MegaMenu onClose={closeMega} />
      </div>
    )}
    </>
  );
};
