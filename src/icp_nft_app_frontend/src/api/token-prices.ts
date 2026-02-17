// ---------------------------------------------------------------------------
// GeckoTerminal API — live ICP token discovery + pricing
// ---------------------------------------------------------------------------

const GT_BASE = 'https://api.geckoterminal.com/api/v2/networks/icp';

// ---------------------------------------------------------------------------
// All known ICP token canister IDs (discovered from GeckoTerminal pools)
// ---------------------------------------------------------------------------

export const ALL_ICP_CANISTER_IDS: string[] = [
  // -- Core / Layer 1 --
  'ryjl3-tyaaa-aaaaa-aaaba-cai', // ICP

  // -- Wrapped Assets --
  'mxzaz-hqaaa-aaaar-qaada-cai', // ckBTC
  'ss2fx-dyaaa-aaaar-qacoq-cai', // ckETH
  'cngnf-vqaaa-aaaar-qag4q-cai', // ckUSDT
  'xevnm-gaaaa-aaaar-qafnq-cai', // ckUSDC

  // -- DeFi --
  'o7oak-iyaaa-aaaaq-aadzq-cai', // KONG
  'qbizb-wiaaa-aaaaq-aabwq-cai', // SONIC
  'ca6gz-lqaaa-aaaaq-aacwa-cai', // ICS
  'jcmow-hyaaa-aaaaq-aadlq-cai', // WTN
  'hdbec-7yaaa-aaaam-qcw5a-cai', // OPENAPP

  // -- SNS / DAO --
  '2ouva-viaaa-aaaaq-aaamq-cai', // CHAT
  'lkwrt-vyaaa-aaaaq-aadhq-cai', // OGY
  'druyg-tyaaa-aaaaq-aactq-cai', // PANDA
  'atbfz-diaaa-aaaaq-aacyq-cai', // YUKU
  'mih44-vaaaa-aaaaq-aaekq-cai', // NFIDW
  'np5km-uyaaa-aaaaq-aadrq-cai', // DOGMI

  // -- AI --
  'xsi2v-cyaaa-aaaaq-aabfq-cai', // DCD
  'oj6if-riaaa-aaaaq-aaeha-cai', // ALICE

  // -- Gaming --
  'zfcdd-tqaaa-aaaaq-aaaga-cai', // DKP

  // -- Real-World Assets --
  'tyyy3-4aaaa-aaaaq-aab7a-cai', // GLDGov
  '6c7su-kiaaa-aaaar-qaira-cai', // GLDT
  'ly36x-wiaaa-aaaai-aqj7q-cai', // VCHF
  'vurva-zqaaa-aaaak-quezq-cai', // MAPTF

  // -- Meme --
  '7pail-xaaaa-aaaas-aabmq-cai', // BOB
  'rh2pm-ryaaa-aaaan-qeniq-cai', // EXE
  '7xkvf-zyaaa-aaaal-ajvra-cai', // PARTY
  'pcj6u-uaaaa-aaaak-aewnq-cai', // CLOUD
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LiveTokenData {
  canisterId: string;
  name: string;
  symbol: string;
  imageUrl: string;
  price: number;
  marketCap: number;
  volume24h: number;
  fdv: number;
}

// ---------------------------------------------------------------------------
// Fetch batches of tokens via the multi-token endpoint
// ---------------------------------------------------------------------------

async function fetchMultiBatch(canisterIds: string[]): Promise<LiveTokenData[]> {
  const addresses = canisterIds.join('%2C');
  const res = await fetch(`${GT_BASE}/tokens/multi/${addresses}`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) throw new Error(`GeckoTerminal ${res.status}`);

  const json = await res.json();
  const results: LiveTokenData[] = [];

  for (const item of json.data ?? []) {
    const attr = item.attributes;
    if (!attr?.address) continue;

    results.push({
      canisterId: attr.address,
      name: attr.name || '',
      symbol: attr.symbol || '',
      imageUrl: attr.image_url || '',
      price: parseFloat(attr.price_usd) || 0,
      marketCap: parseFloat(attr.market_cap_usd) || 0,
      volume24h: parseFloat(attr.volume_usd?.h24) || 0,
      fdv: parseFloat(attr.fdv_usd) || 0,
    });
  }

  return results;
}

/**
 * Fetch live data for ALL known ICP tokens.
 * Batches into groups of 30 (GeckoTerminal limit).
 */
export async function fetchAllTokenData(): Promise<LiveTokenData[]> {
  const batchSize = 30;
  const results: LiveTokenData[] = [];

  for (let i = 0; i < ALL_ICP_CANISTER_IDS.length; i += batchSize) {
    const batch = ALL_ICP_CANISTER_IDS.slice(i, i + batchSize);
    try {
      const data = await fetchMultiBatch(batch);
      results.push(...data);
    } catch {
      // If a batch fails, skip it — keep whatever we already have
    }
  }

  return results;
}
