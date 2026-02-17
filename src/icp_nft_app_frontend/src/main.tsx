import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { useNFTStore } from './store/nftStore';
import { useCartStore } from './store/cartStore';
import { useWishlistStore } from './store/wishlistStore';
import { useReviewStore } from './store/reviewStore';
import { useNotificationStore } from './store/notificationStore';
import { usePurchaseHistoryStore } from './store/purchaseHistoryStore';
import { useSettingsStore } from './store/settingsStore';
import { useTokenStore } from './store/tokenStore';
import { useChatStore } from './store/chatStore';
import { useAdminStore } from './store/adminStore';

// Unregister any old service workers and clear caches to prevent stale content
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((reg) => reg.unregister());
  });
  caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
}

// Set principal from dfx identity (anonymous for local dev)
async function initPrincipal() {
  try {
    const { getAgent } = await import('./api/actor');
    const agent = getAgent();
    const principal = await agent.getPrincipal();
    useNFTStore.getState().setPrincipal(principal.toText());
  } catch (err) {
    console.warn('Failed to get principal:', err);
    // Fallback anonymous principal
    useNFTStore.getState().setPrincipal('2vxsx-fae');
  }
}

initPrincipal();

// Hydrate all localStorage-backed stores
useCartStore.getState()._hydrate();
useWishlistStore.getState()._hydrate();
useReviewStore.getState()._hydrate();
useNotificationStore.getState()._hydrate();
usePurchaseHistoryStore.getState()._hydrate();
useSettingsStore.getState()._hydrate();
useTokenStore.getState()._hydrate();
useTokenStore.getState().startPolling();
useChatStore.getState()._hydrate();
useAdminStore.getState()._hydrate();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
