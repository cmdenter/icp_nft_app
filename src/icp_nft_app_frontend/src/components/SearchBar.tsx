import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from './icons';
import { useNFTStore } from '../store/nftStore';
import { COLLECTIONS } from '../api/collections';
import { useLiveTokens } from '../hooks/useTokenData';
import type { CollectionEntry } from '../types';

const SCOPES = [
  { value: 'all', label: 'All' },
  { value: 'collections', label: 'Collections' },
  { value: 'nfts', label: 'NFTs' },
  { value: 'tokens', label: 'Tokens' },
] as const;

const LS_KEY = 'recentSearches';
function getRecentSearches(): string[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]').slice(0, 5); } catch { return []; }
}
function saveRecentSearch(q: string) {
  const prev = getRecentSearches().filter((s) => s !== q);
  localStorage.setItem(LS_KEY, JSON.stringify([q, ...prev].slice(0, 5)));
}

export const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const search = useNFTStore((s) => s.search);
  const searchResults = useNFTStore((s) => s.searchResults);
  const searchLoading = useNFTStore((s) => s.searchLoading);
  const clearSearch = useNFTStore((s) => s.clearSearch);

  const [input, setInput] = useState('');
  const [scope, setScope] = useState<'all' | 'collections' | 'nfts' | 'tokens'>('all');
  const [focused, setFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const allLiveTokens = useLiveTokens();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Collection search (client-side)
  const matchedCollections: CollectionEntry[] = input.trim().length >= 1
    ? COLLECTIONS.filter((c) => !c.isLocal && c.name.toLowerCase().includes(input.toLowerCase()))
    : [];

  // Token search (client-side)
  const matchedTokens = input.trim().length >= 1
    ? allLiveTokens.filter((t) => {
        const q = input.toLowerCase();
        return t.name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q);
      })
    : [];

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInput(val);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!val.trim()) {
        clearSearch();
        setShowDropdown(focused);
        return;
      }

      setShowDropdown(true);
      if (scope !== 'collections' && scope !== 'tokens') {
        debounceRef.current = setTimeout(() => search(val), 300);
      }
    },
    [search, clearSearch, focused, scope]
  );

  const handleSelectItem = useCallback(
    (collectionId: string | undefined, tokenId: number) => {
      setShowDropdown(false);
      if (input.trim()) saveRecentSearch(input.trim());
      setInput('');
      clearSearch();
      if (collectionId && collectionId !== 'local') {
        navigate(`/collection/${collectionId}/nft/${tokenId}`);
      } else {
        navigate(`/nft/${tokenId}`);
      }
    },
    [navigate, clearSearch, input]
  );

  const handleSelectCollection = useCallback(
    (id: string) => {
      setShowDropdown(false);
      if (input.trim()) saveRecentSearch(input.trim());
      setInput('');
      clearSearch();
      navigate(`/collection/${id}`);
    },
    [navigate, clearSearch, input]
  );

  const handleSelectToken = useCallback(
    (tokenId: string) => {
      setShowDropdown(false);
      if (input.trim()) saveRecentSearch(input.trim());
      setInput('');
      clearSearch();
      navigate(`/token/${tokenId}`);
    },
    [navigate, clearSearch, input]
  );

  const handleRecentClick = useCallback(
    (q: string) => {
      setInput(q);
      search(q);
      setShowDropdown(true);
    },
    [search]
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasResults = matchedCollections.length > 0 || searchResults.length > 0 || matchedTokens.length > 0;
  const showRecent = !input.trim() && recentSearches.length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Amazon-style merged search */}
      <div className={`flex items-stretch rounded-xl overflow-hidden transition-all duration-250 ${
        focused ? 'ring-2 ring-os-primary/50' : ''
      }`}>
        {/* Scope dropdown */}
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value as typeof scope)}
          aria-label="Search scope"
          className="bg-os-card border-r border-os-border/40 text-os-text-secondary text-xs font-medium px-2.5 sm:px-3 py-2.5 cursor-pointer hover:bg-os-card-hover transition-colors focus:outline-none hidden sm:block"
        >
          {SCOPES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {/* Input */}
        <input
          type="text"
          value={input}
          onChange={handleChange}
          onFocus={() => {
            setFocused(true);
            setRecentSearches(getRecentSearches());
            if (input.trim() && hasResults) setShowDropdown(true);
            else if (!input.trim()) setShowDropdown(true);
          }}
          placeholder="Search collections, NFTs, and more..."
          className="flex-1 bg-os-surface border-none outline-none text-sm text-white placeholder-os-text-secondary/60 px-4 py-2.5 min-w-0"
        />

        {/* Search button */}
        <button
          onClick={() => { if (input.trim()) { saveRecentSearch(input.trim()); setShowDropdown(true); } }}
          className="bg-os-primary hover:bg-os-primary-hover px-4 flex items-center justify-center transition-colors"
        >
          {searchLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <SearchIcon size={18} className="text-white" />
          )}
        </button>
      </div>

      {/* Dropdown */}
      {showDropdown && focused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-os-surface border border-os-border/30 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-float-in max-h-[70vh] overflow-y-auto">
          {/* Recent searches */}
          {showRecent && (
            <div>
              <div className="px-4 py-2.5 border-b border-os-border/30">
                <p className="text-[11px] font-semibold text-os-text-secondary uppercase tracking-widest">Recent Searches</p>
              </div>
              {recentSearches.map((q) => (
                <button
                  key={q}
                  onClick={() => handleRecentClick(q)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-os-card/60 transition-colors text-left"
                >
                  <SearchIcon size={14} className="text-os-text-secondary/40 shrink-0" />
                  <span className="text-sm text-os-text-secondary">{q}</span>
                </button>
              ))}
            </div>
          )}

          {/* Trending / Suggestions when empty */}
          {!input.trim() && !showRecent && (
            <div>
              <div className="px-4 py-2.5 border-b border-os-border/30">
                <p className="text-[11px] font-semibold text-os-text-secondary uppercase tracking-widest">Popular Collections</p>
              </div>
              {COLLECTIONS.filter((c) => !c.isLocal).map((col) => (
                <button
                  key={col.id}
                  onClick={() => handleSelectCollection(col.id)}
                  className="w-full flex items-center gap-3.5 px-4 py-3 hover:bg-os-card/60 transition-colors text-left"
                >
                  <img
                    src={col.image}
                    alt={col.name}
                    className="w-10 h-10 rounded-lg object-cover bg-os-card ring-1 ring-os-border/20"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{col.name}</p>
                    <p className="text-xs text-os-text-secondary/70">
                      {col.totalSupply?.toLocaleString() || '—'} items
                      {col.floorPrice != null && <> &middot; Floor: {col.floorPrice} ICP</>}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Collections results */}
          {input.trim() && (scope === 'all' || scope === 'collections') && matchedCollections.length > 0 && (
            <div>
              <div className="px-4 py-2.5 border-b border-os-border/30">
                <p className="text-[11px] font-semibold text-os-text-secondary uppercase tracking-widest">Collections</p>
              </div>
              {matchedCollections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => handleSelectCollection(col.id)}
                  className="w-full flex items-center gap-3.5 px-4 py-3 hover:bg-os-card/60 transition-colors text-left"
                >
                  <img
                    src={col.image}
                    alt={col.name}
                    className="w-10 h-10 rounded-lg object-cover bg-os-card ring-1 ring-os-border/20"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{col.name}</p>
                    <p className="text-xs text-os-text-secondary/70">
                      {col.totalSupply?.toLocaleString() || '—'} items
                    </p>
                  </div>
                  {col.verified && (
                    <span className="text-[11px] text-os-primary font-medium">Verified</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* NFT results */}
          {input.trim() && (scope === 'all' || scope === 'nfts') && searchResults.length > 0 && (
            <div>
              <div className="px-4 py-2.5 border-b border-os-border/30">
                <p className="text-[11px] font-semibold text-os-text-secondary uppercase tracking-widest">Items</p>
              </div>
              {searchResults.slice(0, 6).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item.collectionId, item.id)}
                  className="w-full flex items-center gap-3.5 px-4 py-3 hover:bg-os-card/60 transition-colors text-left"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover bg-os-card ring-1 ring-os-border/20"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                    <p className="text-xs text-os-text-secondary/70">ICP Speed NFTs</p>
                  </div>
                  <span className="text-xs text-os-text-secondary/60 font-mono">#{item.id}</span>
                </button>
              ))}
            </div>
          )}

          {/* Token results */}
          {input.trim() && (scope === 'all' || scope === 'tokens') && matchedTokens.length > 0 && (
            <div>
              <div className="px-4 py-2.5 border-b border-os-border/30">
                <p className="text-[11px] font-semibold text-os-text-secondary uppercase tracking-widest">Tokens</p>
              </div>
              {matchedTokens.slice(0, 6).map((token) => (
                <button
                  key={token.id}
                  onClick={() => handleSelectToken(token.id)}
                  className="w-full flex items-center gap-3.5 px-4 py-3 hover:bg-os-card/60 transition-colors text-left"
                >
                  <img
                    src={token.logo}
                    alt={token.symbol}
                    className="w-4 h-4 rounded-full shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{token.name}</p>
                  </div>
                  <span className="text-xs text-os-text-secondary/60 font-medium">{token.symbol}</span>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {input.trim() && !searchLoading && !hasResults && (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-os-text-secondary/70">No results found for "{input}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
