import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SafeImg } from '../components/SafeImg';
import { TrashIcon, CartIcon, ICPTokenIcon } from '../components/icons';
import { useCartStore } from '../store/cartStore';
import { useNotificationStore } from '../store/notificationStore';

const Cart: React.FC = () => {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const showToast = useNotificationStore((s) => s.showToast);

  const handleRemove = (collectionId: string, tokenIndex: number, name: string) => {
    removeItem(collectionId, tokenIndex);
    showToast({ type: 'info', title: 'Removed from cart', message: name });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shopping Cart' }]} />
        <div className="rounded-2xl border border-os-border bg-os-surface p-12 sm:p-20 text-center max-w-lg mx-auto mt-6">
          <div className="w-20 h-20 rounded-full bg-os-primary/10 flex items-center justify-center mx-auto mb-5">
            <CartIcon size={32} className="text-os-primary" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-sm text-os-text-secondary mb-6">
            Browse NFT collections and add items to your cart.
          </p>
          <Link
            to="/"
            className="btn btn-md btn-primary inline-flex items-center justify-center"
          >
            Explore NFTs
          </Link>
        </div>
      </div>
    );
  }

  const total = totalPrice();
  const serviceFee = total * 0.01;
  const networkFees = items.length * 0.0001;
  const grandTotal = total + serviceFee + networkFees;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shopping Cart' }]} />

      <div className="flex items-center justify-between mb-6 mt-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Shopping Cart <span className="text-os-text-secondary text-lg font-normal">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
        </h1>
        <button
          onClick={() => { clearCart(); showToast({ type: 'info', title: 'Cart cleared' }); }}
          className="text-xs text-os-text-secondary hover:text-os-secondary transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Items list */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={`${item.collectionId}-${item.tokenIndex}`}
              className="rounded-2xl border border-os-border bg-os-surface p-4 flex gap-4 items-center card-hover-glow"
            >
              <Link
                to={`/collection/${item.collectionId}/nft/${item.tokenIndex}`}
                className="w-20 h-20 rounded-xl overflow-hidden bg-os-card shrink-0"
              >
                <SafeImg
                  src={item.image}
                  alt={item.name}
                  fallback={item.name[0] || '?'}
                  className="w-full h-full object-cover"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/collection/${item.collectionId}`}
                  className="text-[11px] text-os-primary font-semibold hover:underline"
                >
                  {item.collectionName}
                </Link>
                <Link
                  to={`/collection/${item.collectionId}/nft/${item.tokenIndex}`}
                  className="block"
                >
                  <p className="font-bold text-white text-sm truncate hover:text-os-primary transition-colors">
                    {item.name}
                  </p>
                </Link>
                <p className="text-[11px] text-os-text-secondary mt-0.5">
                  Seller: <span className="font-mono">{item.seller.slice(0, 8)}...{item.seller.slice(-4)}</span>
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 justify-end">
                  <ICPTokenIcon size={16} />
                  <span className="text-lg font-bold text-white">{item.price.toFixed(2)}</span>
                </div>
                <span className="text-[11px] text-os-text-secondary">ICP</span>
              </div>

              <button
                onClick={() => handleRemove(item.collectionId, item.tokenIndex, item.name)}
                className="w-9 h-9 rounded-lg bg-os-card hover:bg-os-secondary/10 hover:text-os-secondary flex items-center justify-center text-os-text-secondary transition-colors shrink-0"
              >
                <TrashIcon size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-[128px] h-fit">
          <div className="rounded-2xl border border-os-border bg-os-surface overflow-hidden">
            <div className="px-5 py-4 border-b border-os-border">
              <h2 className="text-base font-bold text-white">Order Summary</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-os-text-secondary">Subtotal ({items.length} items)</span>
                <span className="text-white font-semibold">{total.toFixed(4)} ICP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-os-text-secondary">Service fee (1%)</span>
                <span className="text-white">{serviceFee.toFixed(4)} ICP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-os-text-secondary">Network fees</span>
                <span className="text-white">{networkFees.toFixed(4)} ICP</span>
              </div>
              <div className="border-t border-os-border pt-3 flex justify-between text-sm font-bold">
                <span className="text-white">Total</span>
                <span className="text-white">{grandTotal.toFixed(4)} ICP</span>
              </div>
            </div>
            <div className="px-5 pb-5 space-y-2.5">
              <Link
                to="/checkout"
                className="btn btn-lg btn-primary w-full flex items-center justify-center"
              >
                Proceed to Checkout
              </Link>
              <Link
                to="/"
                className="btn btn-lg btn-secondary w-full flex items-center justify-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
