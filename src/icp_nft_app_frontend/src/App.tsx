import React, { Component, type ReactNode, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';

const TokenExplore = React.lazy(() => import('./pages/TokenExplore'));
const TokenDetail = React.lazy(() => import('./pages/TokenDetail'));
const Admin = React.lazy(() => import('./pages/Admin'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { ChatWidget } from './components/ChatWidget';
import { PromoBanner } from './components/PromoBanner';
import Explore from './pages/Explore';
import Collection from './pages/Collection';
import ExternalCollection from './pages/ExternalCollection';
import ExternalNFTDetail from './pages/ExternalNFTDetail';
import Rankings from './pages/Rankings';
import CreatorProfile from './pages/CreatorProfile';
import CreatorDashboard from './pages/CreatorDashboard';

import Mint from './pages/Mint';
import Detail from './pages/Detail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Account from './pages/Account';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-os-bg flex flex-col items-center justify-center px-4 py-16">
          <div className="w-16 h-16 rounded-2xl bg-os-secondary/10 border border-os-secondary/20 flex items-center justify-center mb-6">
            <span className="text-3xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-sm text-os-text-secondary mb-6 max-w-md text-center">
            An unexpected error occurred. Try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-md btn-primary mb-8"
          >
            Refresh Page
          </button>
          <details className="max-w-lg w-full">
            <summary className="text-xs text-os-text-secondary/50 cursor-pointer hover:text-os-text-secondary transition-colors">
              Technical details
            </summary>
            <pre className="mt-2 p-4 bg-os-surface border border-os-border rounded-xl text-xs text-os-secondary overflow-auto max-h-48" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {this.state.error.message}
            </pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 sm:py-32 px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-os-surface border border-os-border flex items-center justify-center mb-6">
        <span className="text-4xl font-bold text-os-text-secondary">?</span>
      </div>
      <p className="text-5xl sm:text-6xl font-bold text-white mb-3 tracking-tight">404</p>
      <p className="text-lg text-os-text-secondary mb-2">Page not found</p>
      <p className="text-sm text-os-text-secondary/60 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="btn btn-md btn-primary"
        >
          Back to Explore
        </Link>
        <Link
          to="/rankings"
          className="btn btn-md btn-secondary"
        >
          View Rankings
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-os-bg text-os-text flex flex-col overflow-x-hidden">
          <Header />
          <PromoBanner />
          <CategoryNav />

          <main className="pt-[144px] flex-1">
            <Routes>
              <Route path="/" element={<Explore />} />
              <Route path="/collection/local" element={<Collection />} />
              <Route path="/collection/:collectionId" element={<ExternalCollection />} />
              <Route path="/collection/:collectionId/nft/:tokenId" element={<ExternalNFTDetail />} />
              <Route path="/rankings" element={<Rankings />} />
              <Route path="/list" element={<Navigate to="/create" replace />} />
              <Route path="/mint" element={<Mint />} />
              <Route path="/create" element={<Mint />} />
              <Route path="/nft/:id" element={<Detail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/account" element={<Account />} />
              <Route path="/account/:tab" element={<Account />} />
              <Route path="/profile" element={<Navigate to="/account/collection" replace />} />
              <Route path="/tokens" element={<Suspense fallback={<div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-os-primary border-t-transparent rounded-full animate-spin" /></div>}><TokenExplore /></Suspense>} />
              <Route path="/token/:tokenId" element={<Suspense fallback={<div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-os-primary border-t-transparent rounded-full animate-spin" /></div>}><TokenDetail /></Suspense>} />
              <Route path="/creator/:creatorId/dashboard" element={<CreatorDashboard />} />
              <Route path="/creator/:creatorId/dashboard/:tab" element={<CreatorDashboard />} />
              <Route path="/creator/:creatorId" element={<CreatorProfile />} />
              <Route path="/admin" element={<Suspense fallback={<div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-os-primary border-t-transparent rounded-full animate-spin" /></div>}><Admin /></Suspense>} />
              <Route path="/admin/:tab" element={<Suspense fallback={<div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-os-primary border-t-transparent rounded-full animate-spin" /></div>}><Admin /></Suspense>} />
              <Route path="/chat" element={<Suspense fallback={<div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-os-primary border-t-transparent rounded-full animate-spin" /></div>}><ChatPage /></Suspense>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />
          <ToastContainer />
          <ChatWidget />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
