import React, { useEffect, useState, useMemo } from 'react';
import { COLLECTIONS } from '../api/collections';
import { getExtImageUrls } from '../api/ext';
import { fetchOwnedTokens, listExtNFT, delistExtNFT } from '../api/ext-list';
import { fetchExtListings } from '../api/ext-market';
import type { ExtListing } from '../api/ext-market';
import type { CollectionEntry } from '../types';
import { useNFTStore } from '../store/nftStore';
import { WalletIcon, VerifiedIcon } from '../components/icons';
import { isPlugAvailable } from '../api/plug-wallet';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface OwnedNFT {
  collection: CollectionEntry;
  tokenIndex: number;
  listing?: ExtListing;
}

const ListNFT: React.FC = () => {
  const plugConnected = useNFTStore((s) => s.plugConnected);
  const plugAccountId = useNFTStore((s) => s.plugAccountId);
  const connectPlugWallet = useNFTStore((s) => s.connectPlugWallet);

  const [loading, setLoading] = useState(false);
  const [ownedNFTs, setOwnedNFTs] = useState<OwnedNFT[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [connectError, setConnectError] = useState('');

  const mainnetCollections = useMemo(
    () => COLLECTIONS.filter((c) => !c.isLocal && c.standard === 'ext'),
    []
  );

  // Load owned tokens when wallet connects
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

      // Query ownership + listings for all collections in parallel
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
      window.open('https://plugwallet.ooo', '_blank');
      return;
    }
    try {
      await connectPlugWallet();
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : 'Connection failed');
    }
  };

  const listedCount = ownedNFTs.filter((n) => n.listing).length;
  const unlistedCount = ownedNFTs.filter((n) => !n.listing).length;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'List NFT' }]} />
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-gradient mb-2 tracking-tight">
          List Your NFTs
        </h1>
        <p className="text-os-text-secondary text-sm sm:text-lg max-w-xl">
          Claim and list your NFTs for sale in one click. We scan all supported collections for NFTs you own.
        </p>
      </div>

      {/* Not connected */}
      {!plugConnected && (
        <div className="rounded-2xl border border-os-border bg-os-surface p-8 sm:p-12 text-center max-w-lg mx-auto card-hover-glow">
          <div className="w-20 h-20 rounded-full bg-os-primary/10 flex items-center justify-center mx-auto mb-5">
            <WalletIcon size={32} className="text-os-primary" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-sm text-os-text-secondary mb-6">
            Connect your Plug wallet to see NFTs you own and list them for sale.
          </p>
          <button
            onClick={handleConnect}
            className="btn btn-lg btn-primary"
          >
            Connect Plug Wallet
          </button>
          {connectError && (
            <p className="text-os-secondary text-xs mt-4 px-1">{connectError}</p>
          )}
        </div>
      )}

      {/* Connected — loading */}
      {plugConnected && loading && (
        <div className="rounded-2xl border border-os-border bg-os-surface p-12 text-center">
          <div className="w-8 h-8 border-2 border-os-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-os-text-secondary">
            Scanning {mainnetCollections.length} collections for your NFTs...
          </p>
        </div>
      )}

      {/* Connected — results */}
      {plugConnected && loaded && !loading && (
        <>
          {/* Stats bar */}
          <div className="flex flex-wrap gap-4 sm:gap-6 mb-6 pb-4 border-b border-os-border/40">
            <div className="rounded-xl bg-os-surface/50 px-4 py-2">
              <p className="text-2xl font-bold text-white">{ownedNFTs.length}</p>
              <p className="text-xs text-os-text-secondary">Owned</p>
            </div>
            <div className="rounded-xl bg-os-surface/50 px-4 py-2">
              <p className="text-2xl font-bold text-os-green">{listedCount}</p>
              <p className="text-xs text-os-text-secondary">Listed</p>
            </div>
            <div className="rounded-xl bg-os-surface/50 px-4 py-2">
              <p className="text-2xl font-bold text-os-text-secondary">{unlistedCount}</p>
              <p className="text-xs text-os-text-secondary">Unlisted</p>
            </div>
          </div>

          {ownedNFTs.length === 0 ? (
            <div className="rounded-2xl border border-os-border bg-os-surface p-12 text-center">
              <p className="text-lg text-os-text-secondary mb-2">No NFTs found</p>
              <p className="text-sm text-os-text-secondary">
                You don't own any NFTs from the supported collections yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ownedNFTs.map((nft) => (
                <NFTListCard
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
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── Individual NFT Card with inline list action ─────────────────

interface NFTListCardProps {
  nft: OwnedNFT;
  onListingChange: (listing: ExtListing | undefined) => void;
}

const NFTListCard: React.FC<NFTListCardProps> = ({ nft, onListingChange }) => {
  const { collection, tokenIndex, listing } = nft;

  const fallbackUrls = useMemo(
    () => getExtImageUrls(collection.canisterId, tokenIndex),
    [collection.canisterId, tokenIndex]
  );
  const [imgIdx, setImgIdx] = useState(0);
  const allFailed = imgIdx >= fallbackUrls.length;
  const imgSrc = allFailed ? '' : fallbackUrls[imgIdx];

  const [price, setPrice] = useState(listing ? listing.price.toString() : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleList = async () => {
    const priceNum = parseFloat(price);
    if (!priceNum || priceNum <= 0) {
      setError('Enter a valid price');
      return;
    }
    setError('');
    setSuccess('');
    setBusy(true);

    const result = await listExtNFT(collection, tokenIndex, priceNum);
    setBusy(false);

    if (result.success) {
      setSuccess('Listed!');
      onListingChange({ seller: '', price: priceNum, locked: false });
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed');
    }
  };

  const handleDelist = async () => {
    setError('');
    setSuccess('');
    setBusy(true);

    const result = await delistExtNFT(collection, tokenIndex);
    setBusy(false);

    if (result.success) {
      setSuccess('Delisted');
      setPrice('');
      onListingChange(undefined);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed');
    }
  };

  return (
    <div className="rounded-2xl border border-os-border bg-os-surface overflow-hidden card-hover-glow">
      {/* Image + collection badge */}
      <div className="relative">
        <div className="aspect-square bg-os-card overflow-hidden">
          {!allFailed ? (
            <img
              src={imgSrc}
              alt={`#${tokenIndex}`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImgIdx((i) => i + 1)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-os-primary/20 to-purple-900/20">
              <span className="text-2xl font-bold text-os-text-secondary">#{tokenIndex}</span>
            </div>
          )}
        </div>

        {/* Status badge */}
        {listing && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[11px] font-bold bg-os-green/20 text-os-green">
            Listed
          </div>
        )}
      </div>

      {/* Info + actions */}
      <div className="p-4">
        {/* Title row */}
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[11px] text-os-primary font-semibold truncate">{collection.name}</span>
          {collection.verified && <VerifiedIcon size={12} className="text-os-primary shrink-0" />}
        </div>
        <p className="font-bold text-white text-sm mb-3">{collection.name} #{tokenIndex}</p>

        {/* Current listing info */}
        {listing && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-os-green/5 border border-os-green/20">
            <div className="w-2 h-2 rounded-full bg-os-green" />
            <span className="text-xs text-os-green font-semibold">
              Listed at {listing.price.toFixed(2)} ICP
            </span>
          </div>
        )}

        {/* Price input + buttons */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price in ICP"
              className="w-full bg-os-card border border-os-border rounded-xl px-3 py-2.5 text-sm text-white placeholder-os-text-secondary focus:outline-none focus:border-os-primary transition-colors input-glow"
            />
          </div>
          <button
            onClick={handleList}
            disabled={busy}
            className="bg-os-primary hover:bg-os-primary-hover disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm whitespace-nowrap flex items-center gap-1.5 btn-press"
          >
            {busy ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : listing ? (
              'Update'
            ) : (
              'List'
            )}
          </button>
        </div>

        {/* Delist button */}
        {listing && !busy && (
          <button
            onClick={handleDelist}
            className="w-full mt-2 text-xs text-os-text-secondary hover:text-os-secondary transition-colors py-1.5"
          >
            Remove listing
          </button>
        )}

        {/* Feedback */}
        {error && <p className="text-os-secondary text-xs mt-3 px-1">{error}</p>}
        {success && <p className="text-os-green text-xs mt-3 px-1 font-semibold">{success}</p>}
      </div>
    </div>
  );
};

export default ListNFT;
