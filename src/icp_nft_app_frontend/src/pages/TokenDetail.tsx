import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TOKEN_CATEGORY_DEFS, FALLBACK_LOGO } from '../api/tokens';
import { useLiveToken, useLiveTokens, useRelatedTokens } from '../hooks/useTokenData';
import { useTokenStore } from '../store/tokenStore';
import { useReviewStore } from '../store/reviewStore';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { PriceChangeBadge } from '../components/PriceChangeBadge';
import { TokenBulletPoints } from '../components/TokenBulletPoints';
import { TokenCarousel } from '../components/TokenCarousel';
import { TokenComparisonTable } from '../components/TokenComparisonTable';
import { TokenomicsChart } from '../components/TokenomicsChart';
import { RecentlyViewedTokens } from '../components/RecentlyViewedTokens';
import { CandlestickChart } from '../components/CandlestickChart';
import { TokenFrequentlyBought } from '../components/TokenFrequentlyBought';
import { SponsoredTokens } from '../components/SponsoredTokens';
import { BrandContent } from '../components/BrandContent';
import { TokenRecommendations } from '../components/TokenRecommendations';
import { ReviewList } from '../components/ReviewList';
import { ReviewForm } from '../components/ReviewForm';
import { StarRating } from '../components/StarRating';
import { StatsBar } from '../components/StatsBar';
import { ShareChat } from '../components/ShareChat';
import {
  VerifiedIcon,
  CopyIcon,
  HeartIcon,
  HeartFilledIcon,
  ExternalLink,
  GlobeIcon,
} from '../components/icons';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(price: number): string {
  if (price >= 1_000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

function formatLargeNumber(n: number | undefined | null): string {
  if (n == null) return '--';
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(0)}`;
}

function formatSupply(n: number | undefined | null): string {
  if (n == null) return '--';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const TokenDetail: React.FC = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  const navigate = useNavigate();
  const token = useLiveToken(tokenId || '');

  const isWatchlisted = useTokenStore((s) => s.isWatchlisted(tokenId || ''));
  const toggleWatchlist = useTokenStore((s) => s.toggleWatchlist);
  const addRecentlyViewed = useTokenStore((s) => s.addRecentlyViewedToken);

  const [copied, setCopied] = useState('');

  // Reviews
  const allReviews = useReviewStore((s) => s.reviews);
  const { avg: reviewAvg, count: reviewCount } = useMemo(() => {
    const cid = `token-${tokenId}`;
    const filtered = allReviews.filter((r) => r.collectionId === cid && r.tokenIndex === 0);
    if (!filtered.length) return { avg: 0, count: 0 };
    const sum = filtered.reduce((s, r) => s + r.rating, 0);
    return { avg: sum / filtered.length, count: filtered.length };
  }, [allReviews, tokenId]);

  // Related + category tokens
  const relatedTokens = useRelatedTokens(tokenId || '');
  // Sponsored tokens: pick tokens NOT related and NOT current
  const allTokens = useLiveTokens();
  const sponsoredTokens = useMemo(() => {
    if (!tokenId) return [];
    const relatedIds = new Set(relatedTokens.map((t) => t.id));
    return allTokens.filter((t) => t.id !== tokenId && !relatedIds.has(t.id));
  }, [tokenId, relatedTokens, allTokens]);

  const categoryDef = token
    ? TOKEN_CATEGORY_DEFS.find((c) => c.id === token.category)
    : undefined;

  // Track recently viewed
  useEffect(() => {
    if (token) {
      addRecentlyViewed({
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        logo: token.logo,
        viewedAt: Date.now(),
      });
    }
  }, [token?.id]);

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  // Not found
  if (!token) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Tokens', to: '/tokens' },
            { label: 'Not Found' },
          ]}
        />
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-os-text-secondary text-lg">Token not found</p>
          <button onClick={() => navigate('/tokens')} className="btn btn-md btn-primary">
            Browse Tokens
          </button>
        </div>
      </div>
    );
  }

  const canisterUrl = `https://dashboard.internetcomputer.org/canister/${token.canisterId}`;
  const icpSwapUrl = `https://app.icpswap.com/swap?input=ryjl3-tyaaa-aaaaa-aaaba-cai&output=${token.canisterId}`;

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-4 sm:py-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Tokens', to: '/tokens' },
          { label: categoryDef?.name || 'Token', to: `/tokens?category=${token.category}` },
          { label: token.name },
        ]}
      />

      {/* ===== ABOVE THE FOLD: 2-column grid ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 lg:gap-8 mt-2">
        {/* Left: Token Branding + Info */}
        <div className="space-y-5">
          {/* Token hero */}
          <div className="flex items-start gap-5">
            <img
              src={token.logo}
              alt={token.symbol}
              className="w-24 h-24 lg:w-28 lg:h-28 rounded-full border-4 border-os-border/20 shadow-lg shrink-0"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_LOGO; }}
            />
            <div className="min-w-0 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tighter">
                  {token.name}
                </h1>
                {token.verified && <VerifiedIcon size={20} />}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-os-text-secondary">{token.symbol}</span>
                <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-os-primary/10 text-os-primary">
                  {categoryDef?.name || token.category}
                </span>
              </div>

              {/* Star rating summary */}
              {reviewCount > 0 && (
                <button
                  onClick={() =>
                    document.getElementById('token-reviews')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="flex items-center gap-2 mt-2"
                >
                  <StarRating rating={reviewAvg} size={16} />
                  <span className="text-sm text-os-primary hover:underline">
                    {reviewCount} rating{reviewCount !== 1 ? 's' : ''}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-os-text-secondary leading-relaxed">{token.description}</p>

          {/* Bullet Points */}
          <div className="border-t border-os-border/30 pt-4">
            <TokenBulletPoints token={token} />
          </div>

          {/* Watchlist + External link bar */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => toggleWatchlist(token.id)}
              className="flex items-center gap-1.5 text-sm text-os-text-secondary hover:text-white transition-colors"
            >
              {isWatchlisted ? (
                <HeartFilledIcon size={16} className="text-os-secondary" />
              ) : (
                <HeartIcon size={16} />
              )}
              <span>{isWatchlisted ? 'Watchlisted' : 'Add to Watchlist'}</span>
            </button>
            <a
              href={canisterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-os-text-secondary hover:text-white transition-colors"
            >
              <ExternalLink size={14} />
              <span>View on IC</span>
            </a>
          </div>
        </div>

        {/* Right: Sticky Info Box */}
        <div className="lg:sticky lg:top-[88px] lg:self-start space-y-4">
          {/* Price card */}
          <div className="rounded-2xl border border-os-border bg-os-surface overflow-hidden">
            <div className="px-5 py-4 border-b border-os-border/30">
              <p className="text-xs text-os-text-secondary mb-1">Current price</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-white tracking-tight">
                  {formatPrice(token.price)}
                </span>
                <PriceChangeBadge change={token.change24h} size="md" />
              </div>
              <p className="text-sm text-os-text-secondary mt-1">
                {token.priceICP.toFixed(token.priceICP >= 1 ? 2 : 6)} ICP
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-px bg-os-border/20">
              {[
                { label: 'Market Cap', value: formatLargeNumber(token.marketCap) },
                { label: '24h Volume', value: formatLargeNumber(token.volume24h) },
                { label: 'Circulating', value: formatSupply(token.circulatingSupply) },
                { label: 'Max Supply', value: token.maxSupply ? formatSupply(token.maxSupply) : (token.totalSupply ? formatSupply(token.totalSupply) : '--') },
              ].map((stat) => (
                <div key={stat.label} className="bg-os-surface px-4 py-3">
                  <p className="text-[11px] text-os-text-secondary">{stat.label}</p>
                  <p className="text-sm font-bold text-white mt-0.5">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="p-4 space-y-3">
              <a
                href={icpSwapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-lg btn-primary w-full flex items-center justify-center gap-2"
              >
                Swap on ICPSwap
                <ExternalLink size={14} />
              </a>

              <button
                onClick={() => toggleWatchlist(token.id)}
                className={`btn btn-lg w-full ${
                  isWatchlisted
                    ? 'bg-os-secondary/10 border border-os-secondary/30 text-os-secondary'
                    : 'btn-secondary'
                }`}
              >
                {isWatchlisted ? (
                  <span className="flex items-center gap-2 justify-center">
                    <HeartFilledIcon size={16} /> Watchlisted
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <HeartIcon size={16} /> Add to Watchlist
                  </span>
                )}
              </button>

              {/* ATH / ATL */}
              <div className="space-y-1.5 pt-2 border-t border-os-border/30">
                {token.allTimeHigh != null && (
                  <div className="flex justify-between text-xs">
                    <span className="text-os-text-secondary">All-Time High</span>
                    <span className="text-os-green font-semibold">{formatPrice(token.allTimeHigh)}</span>
                  </div>
                )}
                {token.allTimeLow != null && (
                  <div className="flex justify-between text-xs">
                    <span className="text-os-text-secondary">All-Time Low</span>
                    <span className="text-os-secondary font-semibold">{formatPrice(token.allTimeLow)}</span>
                  </div>
                )}
                {token.launchDate && (
                  <div className="flex justify-between text-xs">
                    <span className="text-os-text-secondary">Launch Date</span>
                    <span className="text-white font-medium">{formatDate(token.launchDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social links */}
          {(token.website || token.twitter || token.discord || token.github) && (
            <div className="flex items-center gap-2 flex-wrap">
              {token.website && (
                <a
                  href={token.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-os-surface border border-os-border/40 text-xs text-os-text-secondary hover:text-white transition-colors"
                >
                  <GlobeIcon size={12} /> Website
                </a>
              )}
              {token.twitter && (
                <a
                  href={`https://x.com/${token.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-os-surface border border-os-border/40 text-xs text-os-text-secondary hover:text-white transition-colors"
                >
                  𝕏 Twitter
                </a>
              )}
              {token.discord && (
                <a
                  href={token.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-os-surface border border-os-border/40 text-xs text-os-text-secondary hover:text-white transition-colors"
                >
                  Discord
                </a>
              )}
              {token.github && (
                <a
                  href={token.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-os-surface border border-os-border/40 text-xs text-os-text-secondary hover:text-white transition-colors"
                >
                  GitHub
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== BELOW THE FOLD: Amazon-style sections ===== */}

      {/* 1. From the Brand — A+ Content */}
      <section className="mt-12 border-t border-os-border/30 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">From the Brand</h2>
        <BrandContent token={token} />
      </section>

      {/* 2. Sponsored Banner */}
      {sponsoredTokens.length > 0 && (
        <section className="mt-12 border-t border-os-border/30 pt-8">
          <SponsoredTokens tokens={sponsoredTokens} variant="banner" />
        </section>
      )}

      {/* 2. Price History (Candlestick Chart) */}
      <section className="mt-12 border-t border-os-border/30 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Price History</h2>
        <div className="bg-os-surface border border-os-border rounded-2xl p-5">
          <CandlestickChart
            currentPrice={token.price}
            allTimeLow={token.allTimeLow}
            allTimeHigh={token.allTimeHigh}
            launchDate={token.launchDate}
          />
            <div className="mt-4">
              <StatsBar stats={[
                { label: 'Price', value: formatPrice(token.price) },
                { label: '24h Change', value: token.change24h != null ? `${token.change24h >= 0 ? '+' : ''}${token.change24h.toFixed(2)}%` : '--', color: (token.change24h ?? 0) >= 0 ? 'text-os-green' : 'text-os-secondary' },
                { label: '24h Volume', value: formatLargeNumber(token.volume24h) },
                { label: 'Market Cap', value: formatLargeNumber(token.marketCap) },
                ...(token.allTimeHigh != null ? [{ label: 'ATH', value: formatPrice(token.allTimeHigh), color: 'text-os-green' }] : []),
                ...(token.allTimeLow != null ? [{ label: 'ATL', value: formatPrice(token.allTimeLow), color: 'text-os-secondary' }] : []),
              ]} />
            </div>
        </div>
      </section>

      {/* 3. Share Chat */}
      <section className="mt-12 border-t border-os-border/30 pt-8">
        <ShareChat threadId={`token-${token.id}`} />
      </section>

      {/* 4. Frequently Bought Together */}
      {relatedTokens.length >= 2 && (
        <section className="mt-12 border-t border-os-border/30 pt-8">
          <TokenFrequentlyBought token={token} relatedTokens={relatedTokens} />
        </section>
      )}

      {/* 4. Tokenomics */}
      {(token.totalSupply || token.circulatingSupply || token.tokenomicsDescription) && (
        <section className="mt-12 border-t border-os-border/30 pt-8">
          <h2 className="text-xl font-bold text-white mb-4">Tokenomics</h2>
          <div className="bg-os-surface border border-os-border rounded-2xl p-5">
            <TokenomicsChart
              totalSupply={token.totalSupply}
              circulatingSupply={token.circulatingSupply}
              maxSupply={token.maxSupply}
              description={token.tokenomicsDescription}
            />
          </div>
        </section>
      )}

      {/* Project Details */}
      <section className="mt-12 border-t border-os-border/30 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Project Details</h2>
        <div className="bg-os-surface border border-os-border rounded-2xl overflow-hidden">
          <div className="divide-y divide-os-border/30">
            {[
              { label: 'Token Standard', value: token.standard },
              {
                label: 'Canister ID',
                value: `${token.canisterId.slice(0, 8)}...${token.canisterId.slice(-5)}`,
                mono: true,
                color: 'text-os-primary',
                copyable: token.canisterId,
              },
              { label: 'Network', value: 'Internet Computer', color: 'text-os-green' },
              ...(token.launchDate
                ? [{ label: 'Launch Date', value: formatDate(token.launchDate) }]
                : []),
              {
                label: 'Category',
                value: categoryDef?.name || token.category,
                link: `/tokens?category=${token.category}`,
              },
              {
                label: 'Verified',
                value: token.verified ? 'Yes' : 'No',
                color: token.verified ? 'text-os-green' : 'text-os-text-secondary',
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between items-center px-5 py-3 hover:bg-os-card/20 transition-colors"
              >
                <span className="text-sm text-os-text-secondary">{row.label}</span>
                {'link' in row && row.link ? (
                  <button
                    onClick={() => navigate(row.link!)}
                    className="text-sm text-os-primary hover:text-os-primary-hover transition-colors"
                  >
                    {row.value}
                  </button>
                ) : 'copyable' in row && row.copyable ? (
                  <button
                    onClick={() => handleCopy(row.copyable!, row.label)}
                    className={`flex items-center gap-1 text-sm ${row.color || 'text-white'} ${row.mono ? 'font-mono' : ''} hover:opacity-80 transition-opacity`}
                  >
                    {row.value}
                    <CopyIcon size={10} />
                    {copied === row.label && (
                      <span className="text-os-green text-[10px] ml-1">Copied!</span>
                    )}
                  </button>
                ) : (
                  <span
                    className={`text-sm ${row.color || 'text-white'} ${row.mono ? 'font-mono' : ''} font-medium`}
                  >
                    {row.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Sponsored Sidebar */}
      {sponsoredTokens.length > 0 && (
        <section className="mt-12 border-t border-os-border/30 pt-8">
          <SponsoredTokens tokens={sponsoredTokens} variant="sidebar" label="Sponsored products related to this item" />
        </section>
      )}

      {/* 10. Compare Similar Tokens */}
      {relatedTokens.length > 0 && (
        <section className="mt-12 border-t border-os-border/30 pt-8">
          <h2 className="text-xl font-bold text-white mb-4">Compare Similar Tokens</h2>
          <div className="bg-os-surface border border-os-border rounded-2xl p-5">
            <TokenComparisonTable
              currentToken={token}
              comparables={relatedTokens}
            />
          </div>
        </section>
      )}

      {/* 11. Customers Also Viewed */}
      <section className="mt-12 border-t border-os-border/30 pt-8">
        <TokenRecommendations
          type="also-viewed"
          currentTokenId={token.id}
          category={token.category}
        />
      </section>

      {/* 12. Top Rated in Category */}
      <section className="mt-12 border-t border-os-border/30 pt-8">
        <TokenRecommendations
          type="top-rated"
          currentTokenId={token.id}
          category={token.category}
        />
      </section>

      {/* 13. New Releases */}
      <section className="mt-12 border-t border-os-border/30 pt-8">
        <TokenRecommendations
          type="new-releases"
          currentTokenId={token.id}
        />
      </section>

      {/* 14. Related Tokens */}
      {relatedTokens.length > 0 && (
        <div className="mt-12 border-t border-os-border/30 pt-8">
          <TokenCarousel
            title="Related Tokens"
            tokens={relatedTokens}
            showViewAll
            viewAllLink="/tokens"
          />
        </div>
      )}

      {/* 15. Recently Viewed Tokens */}
      <div className="mt-12 border-t border-os-border/30 pt-8">
        <RecentlyViewedTokens />
      </div>

      {/* 16. Customer Reviews */}
      <section id="token-reviews" className="mt-12 border-t border-os-border/30 pt-8 pb-20 lg:pb-0">
        <h2 className="text-xl font-bold text-white mb-4">Customer Reviews</h2>
        <div className="space-y-6">
          <ReviewList collectionId={`token-${token.id}`} tokenIndex={0} />
          <ReviewForm collectionId={`token-${token.id}`} tokenIndex={0} />
        </div>
      </section>
    </div>
  );
};

export default TokenDetail;
