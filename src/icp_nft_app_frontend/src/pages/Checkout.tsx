import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SafeImg } from '../components/SafeImg';
import { CheckCircleIcon, XCircleIcon, WalletIcon } from '../components/icons';
import { useCartStore } from '../store/cartStore';
import { useNFTStore } from '../store/nftStore';
import { useNotificationStore } from '../store/notificationStore';
import { usePurchaseHistoryStore } from '../store/purchaseHistoryStore';
import { isPlugAvailable } from '../api/plug-wallet';

type CheckoutStep = 'review' | 'wallet' | 'confirm' | 'processing' | 'receipt';
type ItemStatus = 'pending' | 'processing' | 'success' | 'failed';

interface ItemProgress {
  key: string;
  status: ItemStatus;
  error?: string;
}

const Checkout: React.FC = () => {
  const items = useCartStore((s) => s.items);
  const removeSuccessful = useCartStore((s) => s.removeSuccessful);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const plugConnected = useNFTStore((s) => s.plugConnected);
  const plugPrincipal = useNFTStore((s) => s.plugPrincipal);
  const connectPlugWallet = useNFTStore((s) => s.connectPlugWallet);
  const buyNFT = useNFTStore((s) => s.buyNFT);
  const showToast = useNotificationStore((s) => s.showToast);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const addPurchase = usePurchaseHistoryStore((s) => s.addPurchase);
  const [step, setStep] = useState<CheckoutStep>('review');
  const [connecting, setConnecting] = useState(false);
  const [walletError, setWalletError] = useState('');
  const [progress, setProgress] = useState<ItemProgress[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);

  if (items.length === 0 && step !== 'receipt') {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />
        <div className="rounded-2xl border border-os-border bg-os-surface p-12 text-center max-w-lg mx-auto mt-6">
          <p className="text-lg text-os-text-secondary mb-4">Your cart is empty</p>
          <Link to="/" className="text-os-primary hover:underline text-sm">Browse NFTs</Link>
        </div>
      </div>
    );
  }

  const total = totalPrice();
  const serviceFee = total * 0.01;
  const networkFees = items.length * 0.0001;
  const grandTotal = total + serviceFee + networkFees;

  const handleConnect = async () => {
    setWalletError('');
    if (!isPlugAvailable()) {
      setWalletError('Install Plug wallet from plugwallet.ooo');
      return;
    }
    setConnecting(true);
    try {
      await connectPlugWallet();
      setStep('confirm');
    } catch (err) {
      setWalletError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setConnecting(false);
    }
  };

  const handlePurchase = async () => {
    setStep('processing');
    const initial: ItemProgress[] = items.map((i) => ({
      key: `${i.collectionId}-${i.tokenIndex}`,
      status: 'pending' as ItemStatus,
    }));
    setProgress(initial);

    let successes = 0;
    let failures = 0;
    const successKeys: string[] = [];

    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const key = `${item.collectionId}-${item.tokenIndex}`;

      setProgress((prev) => prev.map((p) => p.key === key ? { ...p, status: 'processing' } : p));

      const result = await buyNFT(item.collectionId, item.tokenIndex);

      if (result.success) {
        successes++;
        successKeys.push(key);
        setProgress((prev) => prev.map((p) => p.key === key ? { ...p, status: 'success' } : p));
        addPurchase({
          collectionId: item.collectionId,
          tokenIndex: item.tokenIndex,
          name: item.name,
          image: item.image,
          collectionName: item.collectionName,
          price: item.price,
          seller: item.seller,
          purchasedAt: Date.now(),
          status: 'success',
        });
        addNotification({
          type: 'success',
          title: `Purchased ${item.name}`,
          message: `${item.price.toFixed(2)} ICP from ${item.collectionName}`,
          link: `/collection/${item.collectionId}/nft/${item.tokenIndex}`,
        });
      } else {
        failures++;
        setProgress((prev) => prev.map((p) => p.key === key ? { ...p, status: 'failed', error: result.error } : p));
        addPurchase({
          collectionId: item.collectionId,
          tokenIndex: item.tokenIndex,
          name: item.name,
          image: item.image,
          collectionName: item.collectionName,
          price: item.price,
          seller: item.seller,
          purchasedAt: Date.now(),
          status: 'failed',
          error: result.error,
        });
      }
    }

    setSuccessCount(successes);
    setFailCount(failures);
    removeSuccessful(successKeys);

    if (successes > 0) {
      showToast({ type: 'success', title: `${successes} NFT${successes > 1 ? 's' : ''} purchased!` });
    }
    if (failures > 0) {
      showToast({ type: 'error', title: `${failures} purchase${failures > 1 ? 's' : ''} failed` });
    }

    setStep('receipt');
  };

  const truncatedPrincipal = plugPrincipal.length > 16
    ? plugPrincipal.slice(0, 8) + '...' + plugPrincipal.slice(-4)
    : plugPrincipal;

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />

      <h1 className="text-2xl font-bold text-white mt-2 mb-6">Checkout</h1>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {['review', 'wallet', 'confirm', 'processing', 'receipt'].map((s, i) => (
          <React.Fragment key={s}>
            {i > 0 && <div className={`flex-1 h-0.5 ${['review', 'wallet', 'confirm', 'processing', 'receipt'].indexOf(step) >= i ? 'bg-os-primary' : 'bg-os-border'}`} />}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${['review', 'wallet', 'confirm', 'processing', 'receipt'].indexOf(step) >= i ? 'bg-os-primary text-white' : 'bg-os-surface border border-os-border text-os-text-secondary'}`}>
              {i + 1}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Review */}
      {step === 'review' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-os-border bg-os-surface overflow-hidden">
            <div className="px-5 py-3 border-b border-os-border">
              <h2 className="text-sm font-bold text-white">Review Items ({items.length})</h2>
            </div>
            <div className="divide-y divide-os-border/30">
              {items.map((item) => (
                <div key={`${item.collectionId}-${item.tokenIndex}`} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-os-card shrink-0">
                    <SafeImg src={item.image} alt={item.name} fallback="?" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                    <p className="text-[11px] text-os-text-secondary">{item.collectionName}</p>
                  </div>
                  <span className="text-sm font-bold text-white">{item.price.toFixed(2)} ICP</span>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-os-border bg-os-card/30">
              <div className="flex justify-between text-sm">
                <span className="text-os-text-secondary">Subtotal</span>
                <span className="font-bold text-white">{total.toFixed(4)} ICP</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-os-text-secondary">+ fees</span>
                <span className="text-os-text-secondary">{(serviceFee + networkFees).toFixed(4)} ICP</span>
              </div>
              <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-os-border/30">
                <span className="text-white">Total</span>
                <span className="text-white">{grandTotal.toFixed(4)} ICP</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => plugConnected ? setStep('confirm') : setStep('wallet')}
            className="btn btn-lg btn-primary w-full"
          >
            {plugConnected ? 'Continue to Confirm' : 'Continue to Connect Wallet'}
          </button>
        </div>
      )}

      {/* Step 2: Wallet */}
      {step === 'wallet' && (
        <div className="rounded-2xl border border-os-border bg-os-surface p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-os-primary/10 flex items-center justify-center mx-auto mb-4">
            <WalletIcon size={28} className="text-os-primary" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-sm text-os-text-secondary mb-6">Connect your Plug wallet to complete the purchase.</p>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="btn btn-lg btn-primary"
          >
            {connecting ? 'Connecting...' : 'Connect Plug Wallet'}
          </button>
          {walletError && <p className="text-os-secondary text-xs mt-4">{walletError}</p>}
          <button onClick={() => setStep('review')} className="block mx-auto mt-4 text-xs text-os-text-secondary hover:text-white">
            Back to review
          </button>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-os-border bg-os-surface p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-os-green" />
              <span className="text-sm text-os-green font-semibold">Wallet Connected</span>
              <span className="text-xs text-os-text-secondary font-mono">{truncatedPrincipal}</span>
            </div>

            <div className="bg-os-card/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-os-text-secondary">Items</span>
                <span className="text-white">{items.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-os-text-secondary">Subtotal</span>
                <span className="text-white">{total.toFixed(4)} ICP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-os-text-secondary">Service fee (1%)</span>
                <span className="text-white">{serviceFee.toFixed(4)} ICP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-os-text-secondary">Network fees</span>
                <span className="text-white">{networkFees.toFixed(4)} ICP</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-os-border/30">
                <span className="text-white">Total</span>
                <span className="text-white">{grandTotal.toFixed(4)} ICP</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            className="btn btn-lg btn-primary w-full"
          >
            Confirm Purchase — {grandTotal.toFixed(4)} ICP
          </button>
          <button onClick={() => setStep('review')} className="block mx-auto text-xs text-os-text-secondary hover:text-white">
            Back to review
          </button>
        </div>
      )}

      {/* Step 4: Processing */}
      {step === 'processing' && (
        <div className="rounded-2xl border border-os-border bg-os-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-os-border">
            <h2 className="text-sm font-bold text-white">Processing Purchases...</h2>
            <p className="text-xs text-os-text-secondary mt-1">Please don't close this page.</p>
          </div>
          <div className="divide-y divide-os-border/30">
            {items.map((item, idx) => {
              const p = progress[idx];
              return (
                <div key={`${item.collectionId}-${item.tokenIndex}`} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-os-card shrink-0">
                    <SafeImg src={item.image} alt={item.name} fallback="?" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                    <p className="text-[11px] text-os-text-secondary">{item.price.toFixed(2)} ICP</p>
                  </div>
                  <div className="shrink-0">
                    {p?.status === 'success' && <CheckCircleIcon size={20} className="text-os-green" />}
                    {p?.status === 'failed' && <XCircleIcon size={20} className="text-os-secondary" />}
                    {p?.status === 'processing' && (
                      <div className="w-5 h-5 border-2 border-os-primary border-t-transparent rounded-full animate-spin" />
                    )}
                    {(!p || p.status === 'pending') && (
                      <div className="w-5 h-5 rounded-full border-2 border-os-border" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 5: Receipt */}
      {step === 'receipt' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-os-border bg-os-surface p-8 text-center">
            {successCount > 0 ? (
              <>
                <CheckCircleIcon size={48} className="text-os-green mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Purchase Complete!</h2>
                <p className="text-sm text-os-text-secondary">
                  {successCount} of {successCount + failCount} item{successCount + failCount > 1 ? 's' : ''} purchased successfully.
                </p>
              </>
            ) : (
              <>
                <XCircleIcon size={48} className="text-os-secondary mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Purchase Failed</h2>
                <p className="text-sm text-os-text-secondary">
                  None of the items could be purchased. They may no longer be listed.
                </p>
              </>
            )}
          </div>

          {/* Per-item results */}
          <div className="rounded-2xl border border-os-border bg-os-surface overflow-hidden">
            <div className="divide-y divide-os-border/30">
              {progress.map((p, idx) => {
                const item = items[idx] || { name: 'Item', image: '', collectionName: '', price: 0, collectionId: '', tokenIndex: 0 };
                return (
                  <div key={p.key} className="px-5 py-3 flex items-center gap-3">
                    <div className="shrink-0">
                      {p.status === 'success' ? (
                        <CheckCircleIcon size={18} className="text-os-green" />
                      ) : (
                        <XCircleIcon size={18} className="text-os-secondary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{item.name}</p>
                      {p.error && <p className="text-[11px] text-os-secondary">{p.error}</p>}
                    </div>
                    <span className="text-sm text-os-text-secondary">{item.price.toFixed(2)} ICP</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              to="/account/collection"
              className="btn btn-lg btn-primary flex-1 flex items-center justify-center"
            >
              View My Collection
            </Link>
            <Link
              to="/"
              className="btn btn-lg btn-secondary flex-1 flex items-center justify-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
