import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TOKEN_CATEGORY_DEFS } from '../api/tokens';

// ---------------------------------------------------------------------------
// Static NFT nav items
// ---------------------------------------------------------------------------

const NFT_NAV_ITEMS = [
  { to: '/', label: 'All Collections' },
  { to: '/?category=art', label: 'Art' },
  { to: '/?category=pfps', label: 'PFPs' },
  { to: '/?category=gaming', label: 'Gaming' },
  { to: '/?category=collectibles', label: 'Collectibles' },
  { to: '/?category=music', label: 'Music' },
  { to: '/rankings', label: 'Rankings' },
  { to: '/create', label: 'Create' },
];

// ---------------------------------------------------------------------------
// Detect which shop context we're in
// ---------------------------------------------------------------------------

type ShopContext = 'nft' | 'token';

function detectShop(pathname: string): ShopContext {
  if (pathname === '/tokens' || pathname.startsWith('/token/') || pathname.startsWith('/tokens/')) {
    return 'token';
  }
  // NFT paths: /, /collection/*, /nft/*, /rankings, /create, /mint
  // Everything else (e.g. /account, /cart, /checkout) also defaults to NFT
  return 'nft';
}

// ---------------------------------------------------------------------------
// Build token nav items dynamically from TOKEN_CATEGORY_DEFS
// ---------------------------------------------------------------------------

function buildTokenNavItems(): { to: string; label: string }[] {
  return [
    { to: '/tokens', label: 'All Tokens' },
    ...TOKEN_CATEGORY_DEFS.map((cat) => ({
      to: `/tokens?category=${cat.id}`,
      label: cat.name,
    })),
  ];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const CategoryNav: React.FC = () => {
  const location = useLocation();
  const fullPath = location.pathname + location.search;
  const shop = detectShop(location.pathname);

  const navItems = useMemo(
    () => (shop === 'token' ? buildTokenNavItems() : NFT_NAV_ITEMS),
    [shop],
  );

  const isActive = (to: string) => {
    // Exact match for root paths (/ or /tokens with no query)
    if (to === '/') return location.pathname === '/' && !location.search;
    if (to === '/tokens') return location.pathname === '/tokens' && !location.search;
    // Query-string categories: match full path + search
    if (to.includes('?')) return fullPath === to;
    // Everything else: prefix match
    return location.pathname.startsWith(to);
  };

  return (
    <nav aria-label="Category navigation" className="fixed top-[104px] left-0 right-0 z-40 h-[40px] bg-os-surface/95 backdrop-blur-md border-b border-os-border/30 relative">
      <div role="menubar" className="h-full max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center gap-0.5 overflow-x-auto hide-scrollbar">
        {navItems.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              role="menuitem"
              aria-current={active ? 'page' : undefined}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all duration-250 shrink-0 ${
                active
                  ? 'text-white bg-os-card/70'
                  : 'text-os-text-secondary hover:text-white hover:bg-os-card/40'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0f1e30] to-transparent pointer-events-none lg:hidden" />
    </nav>
  );
};
