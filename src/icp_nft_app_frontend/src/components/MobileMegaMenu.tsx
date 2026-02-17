import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TOKEN_CATEGORY_DEFS } from '../api/tokens';
import { XIcon, ChevronDown, ImageIcon, TokenIcon } from './icons';
import { ICPLogo } from './icons';

interface MobileMegaMenuProps {
  onClose: () => void;
}

export const MobileMegaMenu: React.FC<MobileMegaMenuProps> = ({ onClose }) => {
  const [nftsExpanded, setNftsExpanded] = useState(false);
  const [tokensExpanded, setTokensExpanded] = useState(false);

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Panel */}
      <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-os-bg animate-mobile-menu-in overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-os-border/30">
          <Link to="/" onClick={onClose} className="flex items-center gap-2">
            <ICPLogo size={24} />
            <span className="text-gradient font-bold text-lg tracking-tight">ICP NFTs</span>
          </Link>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-os-text-secondary hover:text-white hover:bg-os-card/50 transition-colors"
            aria-label="Close menu"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* NFTs Section */}
        <div className="border-b border-os-border/20">
          <button
            onClick={() => setNftsExpanded((v) => !v)}
            className="flex items-center justify-between w-full px-4 py-3.5 text-left hover:bg-os-card/30 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ImageIcon size={16} className="text-os-primary" />
              <span className="text-sm font-semibold text-white">NFTs</span>
            </div>
            <ChevronDown
              size={14}
              className={`text-os-text-secondary transition-transform ${nftsExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          {nftsExpanded && (
            <div className="pb-2 px-2">
              <Link
                to="/"
                onClick={onClose}
                className="block px-4 py-2.5 rounded-lg text-sm text-os-text-secondary hover:text-white hover:bg-os-card/40 transition-colors"
              >
                All Collections
              </Link>
              <Link
                to="/?category=art"
                onClick={onClose}
                className="block px-4 py-2.5 rounded-lg text-sm text-os-text-secondary hover:text-white hover:bg-os-card/40 transition-colors"
              >
                Art
              </Link>
              <Link
                to="/?category=pfps"
                onClick={onClose}
                className="block px-4 py-2.5 rounded-lg text-sm text-os-text-secondary hover:text-white hover:bg-os-card/40 transition-colors"
              >
                PFPs
              </Link>
              <Link
                to="/?category=gaming"
                onClick={onClose}
                className="block px-4 py-2.5 rounded-lg text-sm text-os-text-secondary hover:text-white hover:bg-os-card/40 transition-colors"
              >
                Gaming
              </Link>
              <Link
                to="/?category=collectibles"
                onClick={onClose}
                className="block px-4 py-2.5 rounded-lg text-sm text-os-text-secondary hover:text-white hover:bg-os-card/40 transition-colors"
              >
                Collectibles
              </Link>
              <div className="h-px bg-os-border/20 mx-4 my-1" />
              <Link
                to="/rankings"
                onClick={onClose}
                className="block px-4 py-2.5 rounded-lg text-sm text-os-text-secondary hover:text-white hover:bg-os-card/40 transition-colors"
              >
                Rankings
              </Link>
              <Link
                to="/create"
                onClick={onClose}
                className="block px-4 py-2.5 rounded-lg text-sm text-os-text-secondary hover:text-white hover:bg-os-card/40 transition-colors"
              >
                Create NFT
              </Link>
            </div>
          )}
        </div>

        {/* Tokens Section */}
        <div className="border-b border-os-border/20">
          <button
            onClick={() => setTokensExpanded((v) => !v)}
            className="flex items-center justify-between w-full px-4 py-3.5 text-left hover:bg-os-card/30 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <TokenIcon size={16} className="text-os-primary" />
              <span className="text-sm font-semibold text-white">Tokens</span>
            </div>
            <ChevronDown
              size={14}
              className={`text-os-text-secondary transition-transform ${tokensExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          {tokensExpanded && (
            <div className="pb-2 px-2">
              <Link
                to="/tokens"
                onClick={onClose}
                className="block px-4 py-2.5 rounded-lg text-sm text-os-text-secondary hover:text-white hover:bg-os-card/40 transition-colors"
              >
                All Tokens
              </Link>
              {TOKEN_CATEGORY_DEFS.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/tokens?category=${cat.id}`}
                  onClick={onClose}
                  className="block px-4 py-2.5 rounded-lg text-sm text-os-text-secondary hover:text-white hover:bg-os-card/40 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Bottom links */}
        <div className="px-2 py-3 space-y-0.5">
          <Link
            to="/account"
            onClick={onClose}
            className="flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium text-os-text-secondary hover:text-white hover:bg-os-card/40 transition-colors"
          >
            My Account
          </Link>
          <Link
            to="/cart"
            onClick={onClose}
            className="flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium text-os-text-secondary hover:text-white hover:bg-os-card/40 transition-colors"
          >
            Cart
          </Link>
        </div>
      </div>
    </div>
  );
};
