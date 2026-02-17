import React, { useEffect, useState, useMemo } from 'react';
import { COLLECTIONS } from '../../api/collections';
import { getExtImageUrls } from '../../api/ext';
import { fetchOwnedTokens, listExtNFT, delistExtNFT } from '../../api/ext-list';
import { fetchExtListings } from '../../api/ext-market';
import type { ExtListing } from '../../api/ext-market';
import type { CollectionEntry } from '../../types';
import { useNFTStore } from '../../store/nftStore';
import { useNotificationStore } from '../../store/notificationStore';
import { WalletIcon, VerifiedIcon, TagIcon } from '../icons';
import { SafeImg } from '../SafeImg';
import { isPlugAvailable } from '../../api/plug-wallet';

interface OwnedNFT {
  collection: CollectionEntry;
  tokenIndex: number;
  listing?: ExtListing;
}

export const MyListings: React.FC = () => {
  const plugConnected = useNFTStore((s) => s.plugConnected);
  const plugAccountId = useNFTStore((s) => s.plugAccountId);
  const connectPlugWallet = useNFTStore((s) => s.connectPlugWallet);
  const showToast = useNotificationStore((s) => s.showToast);

  const [loading, setLoading] = useState(false);
  const [ownedNFTs, setOwnedNFTs] = useState<OwnedNFT[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [connectError, setConnectError] = useState('');

  const mainnetCollections = useMemo(
    () => COLLECTIONS.filter((c) => !c.isLocal && c.standard === 'ext'),
    []
  );

  useEffect(() => {
    if (!plugConnected || !plugAccountId) {
      setOwnedNFTs([]);
      setLoaded(false);
      return;
    }

    let cancelled = false;

    async function scan() {
      setLoading(true);
      const results: OwnedNFT[] = [];
      const queries = mainnetCollections.map(async (col) => {
        const [owned, listings] = await Promise.all([
          fetchOwnedTokens(col, plugAccountId),
          fetchExtListings(col),
        ]);
        return owned.map((idx) => ({
          collection: col,
          tokenIndex: idx,
          listing: listings.get(idx),
        }));
      });
      const allResults = await Promise.all(queries);
      for (const batch of allResults) results.push(...batch);
      if (!cancelled) {
        setOwnedNFTs(results);
        setLoading(false);
        setLoaded(true);
      }
    }

    scan();
    return () => { cancelled = true; };
  }, [plugConnected, plugAccountId, mainnetCollections]);

  const handleConnect = async () => {
    setConnectError('');
    if (!isPlugAvailable()) {
      setConnectError('Install Plug wallet from plugwallet.ooo');
      return;
    }
    try {
      await connectPlugWallet();
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : 'Connection failed');
    }
  };

  const listedCount = ownedNFTs.filter((n) => n.listing).length;

  if (!plugConnected) {
    return (
      <div className="rounded-2xl border border-os-border bg-os-surface p-8 text-center">
        <WalletIcon size={32} className="text-os-primary mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-2">Connect Wallet</h3>
        <p className="text-sm text-os-text-secondary mb-4">Connect to see and manage your listings.</p>
        <button onClick={handleConnect} className="bg-os-primary hover:bg-os-primary-hover text-white font-bold py-2.5 px-6 rounded-xl text-sm btn-press">
          Connect Plug Wallet
        </button>
        {connectError && <p className="text-os-secondary text-xs mt-3">{connectError}</p>}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-os-border bg-os-surface p-12 text-center">
        <div className="w-8 h-8 border-2 border-os-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-os-text-secondary">Scanning collections...</p>
      </div>
    );
  }

  if (loaded && ownedNFTs.length === 0) {
    return (
      <div className="rounded-2xl border border-os-border bg-os-surface p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-os-primary/10 flex items-center justify-center mx-auto mb-4">
          <TagIcon size={28} className="text-os-primary" />
        </div>
        <p className="text-lg font-semibold text-white mb-2">No NFTs found</p>
        <p className="text-sm text-os-text-secondary">You don't own any NFTs from supported collections.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-lg font-bold text-white">My Listings</h2>
        <div className="flex gap-3 text-sm">
          <span className="text-os-text-secondary">{ownedNFTs.length} owned</span>
          <span className="text-os-green">{listedCount} listed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ownedNFTs.map((nft) => (
          <ListingCard
            key={`${nft.collection.id}-${nft.tokenIndex}`}
            nft={nft}
            onListingChange={(updated) => {
              setOwnedNFTs((prev) =>
                prev.map((n) =>
                  n.collection.id === nft.collection.id && n.tokenIndex === nft.tokenIndex
                    ? { ...n, listing: updated }
                    : n
                )
              );
              showToast({ type: 'success', title: updated ? 'Listed!' : 'Delisted' });
            }}
          />
        ))}
      </div>
    </div>
  );
};

const ListingCard: React.FC<{
  nft: OwnedNFT;
  onListingChange: (listing: ExtListing | undefined) => void;
}> = ({ nft, onListingChange }) => {
  const { collection, tokenIndex, listing } = nft;
  const imgUrls = useMemo(() => getExtImageUrls(collection.canisterId, tokenIndex), [collection.canisterId, tokenIndex]);
  const [price, setPrice] = useState(listing ? listing.price.toString() : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleList = async () => {
    const priceNum = parseFloat(price);
    if (!priceNum || priceNum <= 0) { setError('Enter a valid price'); return; }
    setError('');
    setBusy(true);
    const result = await listExtNFT(collection, tokenIndex, priceNum);
    setBusy(false);
    if (result.success) {
      onListingChange({ seller: '', price: priceNum, locked: false });
    } else {
      setError(result.error || 'Failed');
    }
  };

  const handleDelist = async () => {
    setError('');
    setBusy(true);
    const result = await delistExtNFT(collection, tokenIndex);
    setBusy(false);
    if (result.success) {
      setPrice('');
      onListingChange(undefined);
    } else {
      setError(result.error || 'Failed');
    }
  };

  return (
    <div className="rounded-2xl border border-os-border bg-os-surface overflow-hidden card-hover-glow">
      <div className="relative">
        <div className="aspect-square bg-os-card overflow-hidden">
          <SafeImg urls={imgUrls} alt={`#${tokenIndex}`} fallback={`#${tokenIndex}`} className="w-full h-full object-cover" />
        </div>
        {listing && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[11px] font-bold bg-os-green/20 text-os-green">Listed</div>
        )}
      </div>
      <div className="p-3.5">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[11px] text-os-primary font-semibold truncate">{collection.name}</span>
          {collection.verified && <VerifiedIcon size={12} className="text-os-primary shrink-0" />}
        </div>
        <p className="font-bold text-white text-sm mb-2">{collection.name} #{tokenIndex}</p>

        {listing && (
          <div className="flex items-center gap-2 mb-2 px-2.5 py-1.5 rounded-lg bg-os-green/5 border border-os-green/20">
            <div className="w-1.5 h-1.5 rounded-full bg-os-green" />
            <span className="text-xs text-os-green font-semibold">{listing.price.toFixed(2)} ICP</span>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price in ICP"
            className="flex-1 bg-os-card border border-os-border rounded-lg px-2.5 py-2 text-sm text-white placeholder-os-text-secondary focus:outline-none focus:border-os-primary transition-colors input-glow"
          />
          <button
            onClick={handleList}
            disabled={busy}
            className="bg-os-primary hover:bg-os-primary-hover disabled:opacity-50 text-white font-bold px-3 py-2 rounded-lg transition-colors text-xs btn-press"
          >
            {busy ? '...' : listing ? 'Update' : 'List'}
          </button>
        </div>
        {listing && !busy && (
          <button onClick={handleDelist} className="text-xs text-os-text-secondary hover:text-os-secondary transition-colors mt-2">
            Remove listing
          </button>
        )}
        {error && <p className="text-os-secondary text-xs mt-2">{error}</p>}
      </div>
    </div>
  );
};
