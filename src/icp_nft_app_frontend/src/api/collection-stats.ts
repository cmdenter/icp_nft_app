import type { ExtCollectionStats } from '../types';
import type { ExtListing, ExtTransaction } from './ext-market';

export function computeCollectionStats(
  listings: Map<number, ExtListing> | undefined,
  transactions: ExtTransaction[],
  totalSupply: number,
): ExtCollectionStats {
  const salesCount = transactions.length;
  const totalVolume = transactions.reduce((sum, tx) => sum + tx.price, 0);
  const averagePrice = salesCount > 0 ? totalVolume / salesCount : 0;

  let floorPrice = Infinity;
  const listedCount = listings?.size || 0;
  if (listings) {
    for (const listing of listings.values()) {
      if (listing.price < floorPrice) floorPrice = listing.price;
    }
  }
  if (floorPrice === Infinity) floorPrice = 0;

  const sellers = new Set<string>();
  const buyers = new Set<string>();
  for (const tx of transactions) {
    sellers.add(tx.seller);
    buyers.add(tx.buyer);
  }

  const highestSale = transactions.reduce((max, tx) => Math.max(max, tx.price), 0);

  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const twoDaysAgo = now - 48 * 60 * 60 * 1000;

  const recent = transactions.filter((tx) => tx.time >= oneDayAgo);
  const prior = transactions.filter((tx) => tx.time >= twoDaysAgo && tx.time < oneDayAgo);

  const last24hVolume = recent.reduce((sum, tx) => sum + tx.price, 0);
  const last24hSales = recent.length;

  const recentAvg = recent.length > 0 ? last24hVolume / recent.length : 0;
  const priorAvg = prior.length > 0 ? prior.reduce((s, t) => s + t.price, 0) / prior.length : 0;
  const priceChange24h = priorAvg > 0 ? ((recentAvg - priorAvg) / priorAvg) * 100 : 0;

  return {
    totalVolume,
    salesCount,
    averagePrice,
    floorPrice,
    listedCount,
    listedPercent: totalSupply > 0 ? (listedCount / totalSupply) * 100 : 0,
    uniqueSellers: sellers.size,
    uniqueBuyers: buyers.size,
    highestSale,
    last24hVolume,
    last24hSales,
    priceChange24h,
  };
}
