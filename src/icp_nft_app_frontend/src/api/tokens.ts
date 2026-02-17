import type { TokenEntry, TokenCategory } from '../types';

// ---------------------------------------------------------------------------
// Fallback SVG logo (used when official image fails to load)
// ---------------------------------------------------------------------------

const FALLBACK_LOGO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#334155"/><text x="50" y="65" text-anchor="middle" font-size="40" fill="#94a3b8" font-family="sans-serif">?</text></svg>',
)}`;

export { FALLBACK_LOGO };

// ---------------------------------------------------------------------------
// Category definitions
// ---------------------------------------------------------------------------

export const TOKEN_CATEGORY_DEFS: { id: TokenCategory; name: string; gradient: string }[] = [
  { id: 'layer-1', name: 'Layer 1', gradient: 'from-purple-500/30 to-blue-500/20' },
  { id: 'wrapped', name: 'Wrapped Assets', gradient: 'from-orange-500/30 to-yellow-500/20' },
  { id: 'sns-dao', name: 'SNS / DAO', gradient: 'from-blue-500/30 to-cyan-500/20' },
  { id: 'defi', name: 'DeFi', gradient: 'from-green-500/30 to-emerald-500/20' },
  { id: 'gaming', name: 'Gaming', gradient: 'from-pink-500/30 to-red-500/20' },
  { id: 'infrastructure', name: 'Infrastructure', gradient: 'from-gray-500/30 to-slate-500/20' },
  { id: 'ai', name: 'AI', gradient: 'from-violet-500/30 to-purple-500/20' },
  { id: 'entertainment', name: 'Entertainment', gradient: 'from-rose-500/30 to-pink-500/20' },
  { id: 'meme', name: 'Meme', gradient: 'from-yellow-500/30 to-orange-500/20' },
  { id: 'rwa', name: 'Real-World Assets', gradient: 'from-amber-500/30 to-yellow-500/20' },
];

// ---------------------------------------------------------------------------
// Token registry — 27 tokens with verified CoinGecko logos
// ---------------------------------------------------------------------------

const TOKENS: TokenEntry[] = [
  // ===== Layer 1 =============================================================
  {
    id: 'icp',
    name: 'Internet Computer',
    symbol: 'ICP',
    canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/14495/large/Internet_Computer_logo.png?1696514180',
    description:
      'The Internet Computer is a decentralized cloud blockchain designed to run applications, websites, and backend systems fully on-chain. Its architecture provides robust security, resilience, and built-in multi-chain support through Chain-key cryptography. The ICP token is used to pay for computation through a burn-based model and to participate in network governance through staking.',
    category: 'layer-1',
    website: 'https://internetcomputer.org',
    twitter: 'dfinity',
    github: 'https://github.com/dfinity',
    launchDate: '2021-05-10',
    verified: true,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'World computer running apps entirely on-chain',
      'Chain-key cryptography enables native multi-chain interoperability',
      'NNS governance lets ICP holders vote on network upgrades',
      'Reverse gas model — developers pay, users interact free',
    ],
    tokenomicsDescription:
      'ICP has an inflationary model for staking rewards offset by deflationary burns for computation. Staked ICP in neurons earns voting rewards proportional to dissolve delay.',
    useCases: ['Decentralized hosting', 'DeFi', 'NFTs', 'Enterprise dApps', 'Cross-chain bridges'],
    team: [{ name: 'DFINITY Foundation', role: 'Core Development' }],
    relatedTokenIds: ['ckbtc', 'cketh', 'ckusdt', 'ckusdc'],
  },

  // ===== Wrapped Assets ======================================================
  {
    id: 'ckbtc',
    name: 'Chain-key Bitcoin',
    symbol: 'ckBTC',
    canisterId: 'mxzaz-hqaaa-aaaar-qaada-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/33818/large/01_ckBTC_Token_HEX__4x.png?1703046026',
    description:
      'ckBTC is a digital twin of Bitcoin on the Internet Computer, backed 1:1 by real BTC held in a canister smart contract. It uses Chain-key cryptography to enable fast, cheap Bitcoin transactions without relying on bridges or custodians.',
    category: 'wrapped',
    website: 'https://internetcomputer.org',
    twitter: 'dfinity',
    verified: true,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      '1:1 backed by real Bitcoin — fully trustless, no bridges needed',
      'Fast 1-2 second finality vs 10+ minutes on Bitcoin L1',
      'Near-zero transaction fees compared to Bitcoin network',
      'Native integration with ICP DeFi protocols',
    ],
    tokenomicsDescription:
      'ckBTC supply mirrors real BTC deposits. Each ckBTC is backed by BTC held in a threshold-ECDSA-controlled canister. No inflation — supply equals deposits minus redemptions.',
    useCases: ['Fast BTC payments', 'DeFi collateral', 'Cross-chain swaps'],
    team: [{ name: 'DFINITY Foundation', role: 'Core Development' }],
    relatedTokenIds: ['icp', 'cketh', 'ckusdt', 'ckusdc'],
  },
  {
    id: 'cketh',
    name: 'Chain-key Ethereum',
    symbol: 'ckETH',
    canisterId: 'ss2fx-dyaaa-aaaar-qacoq-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/33958/large/01_ckETH_Token_HEX__4x.png?1703605084',
    description:
      'ckETH is a digital twin of Ethereum on the Internet Computer, backed 1:1 by real ETH. It uses Chain-key cryptography to enable fast, cheap Ethereum transactions on ICP without bridges or custodians.',
    category: 'wrapped',
    website: 'https://internetcomputer.org',
    twitter: 'dfinity',
    verified: true,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      '1:1 backed by real ETH — trustless, no bridges or wrapped tokens',
      'Sub-second finality vs 12+ seconds on Ethereum',
      'Negligible transaction fees compared to Ethereum gas',
      'Seamless integration with ICP DeFi ecosystem',
    ],
    useCases: ['Fast ETH payments', 'DeFi collateral', 'Cross-chain interoperability'],
    team: [{ name: 'DFINITY Foundation', role: 'Core Development' }],
    relatedTokenIds: ['icp', 'ckbtc', 'ckusdt', 'ckusdc'],
  },
  {
    id: 'ckusdt',
    name: 'Chain-key USDT',
    symbol: 'ckUSDT',
    canisterId: 'cngnf-vqaaa-aaaar-qag4q-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/39895/large/ckUSDT.png?1724395498',
    description:
      'ckUSDT is a digital twin of USDT on the Internet Computer Protocol network. Fully backed 1:1 by USDT, ckUSDT is powered by Chain-key technology which allows for cross-chain interoperability without centralized bridges.',
    category: 'wrapped',
    website: 'https://internetcomputer.org',
    twitter: 'dfinity',
    verified: true,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'Digital twin of USDT powered by Chain-key technology',
      'Fully backed 1:1 by USDT — no centralized bridge needed',
      'Instant transfers with near-zero fees on ICP',
      'Cross-chain interoperability without intermediaries',
    ],
    useCases: ['Stablecoin payments', 'DeFi liquidity', 'Cross-chain transfers'],
    team: [{ name: 'DFINITY Foundation', role: 'Core Development' }],
    relatedTokenIds: ['icp', 'ckusdc', 'ckbtc', 'cketh'],
  },
  {
    id: 'ckusdc',
    name: 'Chain-key USDC',
    symbol: 'ckUSDC',
    canisterId: 'xevnm-gaaaa-aaaar-qafnq-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/39896/large/ckUSDC.png?1724395539',
    description:
      'ckUSDC is a digital twin of USDC that operates on the Internet Computer. Fully backed 1:1 by USDC via Chain-key cryptography, enabling fast and cheap stablecoin transactions on ICP.',
    category: 'wrapped',
    website: 'https://internetcomputer.org',
    twitter: 'dfinity',
    verified: true,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'Digital twin of USDC operating on the Internet Computer',
      'Fully backed 1:1 by USDC via Chain-key cryptography',
      'Near-instant settlement with minimal fees',
      'Native stablecoin for ICP DeFi protocols',
    ],
    useCases: ['Stablecoin payments', 'DeFi liquidity', 'Trading pairs'],
    team: [{ name: 'DFINITY Foundation', role: 'Core Development' }],
    relatedTokenIds: ['icp', 'ckusdt', 'ckbtc', 'cketh'],
  },

  // ===== DeFi ================================================================
  {
    id: 'kong',
    name: 'KongSwap',
    symbol: 'KONG',
    canisterId: 'o7oak-iyaaa-aaaaq-aadzq-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/55197/large/kong_logo_%281%29.png?1744616967',
    description:
      'KongSwap is a decentralized exchange (DEX) launched in October 2024 on the Internet Computer Protocol (ICP), designed to revolutionize trading by enabling users to swap a variety of tokens directly from their wallets. As a SuperDEX, it features bridgeless cross-chain trading via Chain Fusion technology supporting Bitcoin, Ethereum, and Solana tokens natively.',
    category: 'defi',
    website: 'https://www.kongswap.io',
    twitter: 'KongSwapX',
    verified: true,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'SuperDEX with bridgeless cross-chain trading via Chain Fusion',
      'Supports native tokens from Bitcoin, Ethereum, and Solana',
      'Smart contracts handle up to 400GB of stable memory on-chain',
      'Advanced on-chain trading algorithms and prediction models',
    ],
    useCases: ['Token swaps', 'Cross-chain trading', 'Liquidity provision', 'Yield farming'],
    relatedTokenIds: ['sonic', 'ics', 'icp'],
  },
  {
    id: 'sonic',
    name: 'Sonic',
    symbol: 'SONIC',
    canisterId: 'qbizb-wiaaa-aaaaq-aabwq-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/20596/large/sonic.png?1696517502',
    description:
      'Sonic is one of the first decentralized exchanges on the Internet Computer, enabling token swaps, liquidity provision, and yield farming. Built for speed and low cost, Sonic leverages ICP\'s unique architecture for a seamless trading experience.',
    category: 'defi',
    website: 'https://www.sonic.ooo',
    twitter: 'sonic_ooo',
    verified: true,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'Pioneer DEX on the Internet Computer since 2021',
      'Automated market maker (AMM) with deep liquidity pools',
      'Fast swaps with sub-second finality and near-zero fees',
      'Integrated yield farming and liquidity mining rewards',
    ],
    useCases: ['Token swaps', 'Liquidity provision', 'Yield farming'],
    relatedTokenIds: ['kong', 'ics', 'icp'],
  },
  {
    id: 'ics',
    name: 'ICPSwap',
    symbol: 'ICS',
    canisterId: 'ca6gz-lqaaa-aaaaq-aacwa-cai',
    standard: 'ICRC-2',
    logo: 'https://coin-images.coingecko.com/coins/images/38155/large/ICS_200.png?1716694284',
    description:
      'ICPSwap Token (ICS) is the ICPSwap platform token. ICPSwap stands as the native, pioneering, and premier DEX within the ICP ecosystem, providing a comprehensive DeFi hub including token swaps, concentrated liquidity pools, staking, and a token launchpad.',
    category: 'defi',
    website: 'https://app.icpswap.com',
    twitter: 'ICPSwap',
    verified: true,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'Premier DEX within the ICP ecosystem — token swaps, farming, and staking',
      'Concentrated liquidity pools for capital-efficient trading',
      'Cross-chain token support via Chain-key integrations',
      'On-chain governance and community-driven development',
    ],
    useCases: ['Token swaps', 'Concentrated liquidity', 'Staking', 'Token launchpad'],
    relatedTokenIds: ['kong', 'sonic', 'icp'],
  },
  {
    id: 'wtn',
    name: 'WaterNeuron',
    symbol: 'WTN',
    canisterId: 'jcmow-hyaaa-aaaaq-aadlq-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/38340/large/waterneuron.jpeg?1717148399',
    description:
      'WaterNeuron is a liquid staking protocol designed for the Internet Computer (ICP) network. It allows users to stake their ICP tokens in a capital-efficient manner by issuing nICP tokens representing staked positions while maintaining DeFi liquidity.',
    category: 'defi',
    website: 'https://docs.waterneuron.fi',
    twitter: 'WaterNeuron',
    verified: true,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'Liquid staking protocol for ICP — stake without locking',
      'Issues nICP tokens representing staked ICP positions',
      'Earn staking rewards while maintaining DeFi liquidity',
      'Governed by WTN token holders through SNS DAO',
    ],
    useCases: ['Liquid staking', 'DeFi liquidity', 'Governance'],
    relatedTokenIds: ['icp', 'kong', 'ics'],
  },
  {
    id: 'openapp',
    name: 'Open Investment',
    symbol: 'OPENAPP',
    canisterId: 'hdbec-7yaaa-aaaam-qcw5a-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/53889/large/OPEN.png?1737456498',
    description:
      'Experience the ultimate financial revolution — escrow your digital assets to buy stock and commodity options. Trade, swap, and sell tokenised real-world assets on a user-friendly platform built on ICP for on-chain settlement.',
    category: 'defi',
    website: 'https://brei2-nqaaa-aaaao-qj4aa-cai.icp0.io',
    twitter: 'OpenInvestment_',
    verified: false,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'Escrow digital assets to trade stock and commodity options',
      'Tokenised real-world asset trading platform',
      'Swap, trade, and sell on a user-friendly interface',
      'Built on ICP for on-chain settlement',
    ],
    useCases: ['Options trading', 'Tokenized assets', 'DeFi'],
    relatedTokenIds: ['kong', 'ics', 'icp'],
  },

  // ===== SNS / DAO ===========================================================
  {
    id: 'chat',
    name: 'OpenChat',
    symbol: 'CHAT',
    canisterId: '2ouva-viaaa-aaaaq-aaamq-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/30511/large/unnamed.png?1696529362',
    description:
      'OpenChat is a fully decentralized messaging platform built entirely on the Internet Computer. It offers real-time chat, group conversations, community features, and token tipping — all running 100% on-chain with no centralized servers.',
    category: 'sns-dao',
    website: 'https://oc.app',
    twitter: 'OpenChat',
    verified: true,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'Fully on-chain messaging with end-to-end encryption',
      'Community groups with channels, polls, and governance',
      'Token tipping and crypto payments built into chat',
      'Governed by CHAT token holders via SNS DAO',
    ],
    useCases: ['Decentralized messaging', 'Community governance', 'Crypto tipping'],
    team: [{ name: 'OpenChat Team', role: 'Core Development' }],
    relatedTokenIds: ['icp', 'panda', 'alice'],
  },
  {
    id: 'ogy',
    name: 'ORIGYN',
    symbol: 'OGY',
    canisterId: 'lkwrt-vyaaa-aaaaq-aadhq-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/34501/large/origyn-logo-dark_%281%29.png?1705303959',
    description:
      'ORIGYN token (OGY) is the native token of the ORIGYN platform. OGY is the principal mechanism for the creation of ORIGYN certificates of authenticity and are required to interact with the platform for digital authentication of luxury goods, art, and collectibles.',
    category: 'sns-dao',
    website: 'https://www.origyn.com',
    discord: 'https://discord.com/invite/2N4fyWNGgx',
    verified: true,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'Digital certificates of authenticity for luxury goods and art',
      'Biometric-level identification for physical and digital items',
      'Enterprise-grade NFT infrastructure on ICP',
      'Partnerships with luxury brands and cultural institutions',
    ],
    useCases: ['Digital authentication', 'Luxury goods verification', 'Enterprise NFTs'],
    team: [{ name: 'ORIGYN Foundation', role: 'Core Development' }],
    relatedTokenIds: ['gldt', 'gldgov', 'icp'],
  },
  {
    id: 'panda',
    name: 'ICPanda',
    symbol: 'PANDA',
    canisterId: 'druyg-tyaaa-aaaaq-aactq-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/36222/large/200x200_logo.png?1710965445',
    description:
      'A decentralized Panda meme brand built on the Internet Computer. ICPanda combines community-driven DAO governance with NFT collections and growing DeFi integrations across the ICP ecosystem.',
    category: 'sns-dao',
    website: 'https://panda.fans',
    twitter: 'ICPandaDAO',
    verified: false,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'Decentralized panda meme brand on the Internet Computer',
      'Community-driven SNS DAO governance',
      'NFT collections and ecosystem tools',
      'Growing DeFi integrations across ICP',
    ],
    useCases: ['Meme community', 'DAO governance', 'NFTs'],
    relatedTokenIds: ['chat', 'bob', 'exe'],
  },
  {
    id: 'yuku',
    name: 'Yuku',
    symbol: 'YUKU',
    canisterId: 'atbfz-diaaa-aaaaq-aacyq-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/35667/large/200x200.png?1709446416',
    description:
      'Yuku AI is a Web3 platform aiming to revolutionize digital experiences. Through NFT aggregation, a 3D Metaverse, and AI avatar technology, Yuku is pioneering immersive and interactive virtual environments on the Internet Computer.',
    category: 'sns-dao',
    website: 'https://yuku.app',
    twitter: 'yukuapp',
    verified: true,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'Web3 platform combining NFT marketplace and 3D metaverse',
      'AI avatar technology for immersive virtual experiences',
      'NFT aggregation across multiple ICP collections',
      'Governed by YUKU token holders through SNS DAO',
    ],
    useCases: ['NFT marketplace', 'Metaverse', 'AI avatars', 'DAO governance'],
    relatedTokenIds: ['ogy', 'chat', 'icp'],
  },
  {
    id: 'nfidw',
    name: 'NFID Wallet',
    symbol: 'NFIDW',
    canisterId: 'mih44-vaaaa-aaaaq-aaekq-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/53485/large/nfid-logo-cc-200.png?1736498218',
    description:
      'The easiest to use, hardest to lose, and only wallet governed by a DAO. Secure your assets with the most audited wallet on ICP and start exploring ICP applications in seconds.',
    category: 'sns-dao',
    website: 'https://nfid.one',
    twitter: 'NFIDWallet',
    verified: false,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'Most audited wallet on the Internet Computer',
      'Easy onboarding — start exploring ICP apps in seconds',
      'DAO-governed wallet with community-driven development',
      'Trusted by hundreds of thousands of ICP users',
    ],
    useCases: ['Wallet', 'Identity', 'DAO governance'],
    relatedTokenIds: ['icp', 'chat', 'yuku'],
  },
  {
    id: 'dogmi',
    name: 'DOGMI',
    symbol: 'DOGMI',
    canisterId: 'np5km-uyaaa-aaaaq-aadrq-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/37050/large/dogmi2.png?1713213048',
    description:
      'PHASMA is a hub for NFTs, curated art, and next-generation robotics innovation. By combining creative expression with cutting-edge technology, it provides a space where the community can explore, share, and build together on the Internet Computer.',
    category: 'sns-dao',
    website: 'https://phasma-lm0.caffeine.xyz',
    twitter: 'phasmafuture',
    discord: 'https://discord.gg/47ezrdRen5',
    verified: false,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'NFT-focused platform with curated art collections',
      'Next-generation robotics innovation hub',
      'Community-driven creative expression and technology',
      'Governed by SNS DAO on the Internet Computer',
    ],
    useCases: ['NFTs', 'Community', 'DAO governance'],
    relatedTokenIds: ['panda', 'bob', 'exe'],
  },

  // ===== AI ==================================================================
  {
    id: 'dcd',
    name: 'DecideAI',
    symbol: 'DCD',
    canisterId: 'xsi2v-cyaaa-aaaaq-aabfq-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/30619/large/DecideAI-200px.png?1696529481',
    description:
      'DecideAI (formerly Modclub) is a comprehensive content moderation platform with customizable rules, AI-powered decision-making tools for DAOs, and real-time moderation notifications and analytics.',
    category: 'ai',
    website: 'https://decideai.xyz',
    discord: 'https://discord.gg/JG2ZeRbn',
    verified: true,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'Content moderation platform with customizable rules',
      'AI-powered decision-making tools for DAOs',
      'Real-time moderation notifications and analytics',
      'Decentralized governance for moderation policies',
    ],
    useCases: ['Content moderation', 'AI governance', 'DAO tooling'],
    relatedTokenIds: ['alice', 'chat', 'icp'],
  },
  {
    id: 'alice',
    name: 'ALICE',
    symbol: 'ALICE',
    canisterId: 'oj6if-riaaa-aaaaq-aaeha-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/53485/large/alice_logo.png?1736498218',
    description:
      'The ALICE SNS DAO is an experimental, AI-driven decentralized autonomous organization designed to manage and grow the Bob ecosystem, including platforms like bob.fun, launch.bob.fun, and alice.fun. It features autonomous AI agents and decentralized governance.',
    category: 'ai',
    website: 'https://alice.fun',
    twitter: 'alicedotfun',
    verified: true,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'AI-driven DAO managing the Bob ecosystem on ICP',
      'Autonomous agents running bob.fun and alice.fun platforms',
      'Experimental decentralized AI governance model',
      'Part of the broader BOB token family',
    ],
    useCases: ['AI governance', 'Token launchpad', 'Automated trading'],
    relatedTokenIds: ['bob', 'dcd', 'icp'],
  },

  // ===== Gaming ==============================================================
  {
    id: 'dkp',
    name: 'Dragginz',
    symbol: 'DKP',
    canisterId: 'zfcdd-tqaaa-aaaaq-aaaga-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/30519/large/DKP_token_%28200x200%29.png?1696529370',
    description:
      'Dragginz is a free-to-play, 100% on-chain 3D MMO funded by the sale of non-game-breaking in-game items. Players hatch and raise baby Dragginz to accompany them on adventures. Built with Mimic, an open-source ICP game framework.',
    category: 'gaming',
    website: 'https://dragginz.io',
    twitter: 'dragginzgame',
    discord: 'https://discord.com/invite/dragginz',
    github: 'https://github.com/dragginzgame/mimic',
    verified: true,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'Free-to-play 3D MMO running 100% on-chain on ICP',
      'Hatch and raise baby Dragginz companions for adventures',
      'Non-game-breaking in-game item marketplace',
      'Built with Mimic — an open-source ICP game framework',
    ],
    useCases: ['Gaming', 'NFT items', 'On-chain MMO'],
    relatedTokenIds: ['party', 'exe', 'icp'],
  },

  // ===== RWA (Real-World Assets) =============================================
  {
    id: 'gldgov',
    name: 'Gold DAO',
    symbol: 'GLDGov',
    canisterId: 'tyyy3-4aaaa-aaaaq-aab7a-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/34455/large/Gold_DAO_Logo.png?1705030327',
    description:
      'Gold DAO is a real-world asset (RWA) project that tokenizes physical gold bars into Gold tokens and gold-backed stablecoins. GLDGov is the governance token for voting on protocol upgrades and treasury management.',
    category: 'rwa',
    website: 'https://www.gold-dao.org',
    twitter: 'gldrwa',
    verified: true,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'Governance token for Gold DAO — tokenized physical gold',
      'Vote on protocol upgrades and treasury management',
      'Real-world asset (RWA) backed by physical gold bars',
      'Part of the GLDT ecosystem for gold-backed stablecoins',
    ],
    useCases: ['DAO governance', 'Gold tokenization', 'RWA investment'],
    relatedTokenIds: ['gldt', 'ogy', 'icp'],
  },
  {
    id: 'gldt',
    name: 'Gold Token',
    symbol: 'GLDT',
    canisterId: '6c7su-kiaaa-aaaar-qaira-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/38162/large/GLDT_Token_200x200.png?1716702397',
    description:
      'The GLDT token is a digital asset that combines the stability of gold with the liquidity of digital currency. Each token is backed by physical gold in secure vaults, allowing you to store wealth in gold while using it for everyday digital purchases.',
    category: 'rwa',
    website: 'https://gldt.org',
    twitter: 'TheGoldDAO',
    verified: true,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'Digital asset combining gold stability with crypto liquidity',
      'Each token backed by physical gold in secure vaults',
      'Use gold value for everyday digital transactions',
      'Part of the Gold DAO ecosystem',
    ],
    useCases: ['Gold-backed store of value', 'Digital payments', 'RWA investment'],
    relatedTokenIds: ['gldgov', 'ogy', 'vchf'],
  },
  {
    id: 'vchf',
    name: 'VNX Swiss Franc',
    symbol: 'VCHF',
    canisterId: 'ly36x-wiaaa-aaaai-aqj7q-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/35085/large/VCHF_Logo_200px.png?1707335791',
    description:
      'VNX Swiss Franc (VCHF) is a token referencing Swiss Franc from a token generator licensed under the Blockchain Act in Liechtenstein. It provides professional-grade stablecoin functionality for institutional and retail use across multiple chains including ICP, Ethereum, and Solana.',
    category: 'rwa',
    website: 'https://vnx.li/vchf',
    discord: 'https://discord.com/invite/5jCaPYwr3f',
    verified: true,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'Token referencing Swiss Franc — regulated under Liechtenstein Blockchain Act',
      'Professional-grade stablecoin for institutional and retail use',
      'Multi-chain availability including ICP, Ethereum, and Solana',
      'Issued by VNX, a licensed token generator in Liechtenstein',
    ],
    useCases: ['Fiat-referenced stablecoin', 'Cross-border payments', 'DeFi collateral'],
    relatedTokenIds: ['gldt', 'gldgov', 'ckusdt'],
  },
  {
    id: 'maptf',
    name: 'MAP Technical Forecasting',
    symbol: 'MAPTF',
    canisterId: 'vurva-zqaaa-aaaak-quezq-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/40297/large/IMG_0165_200x200.png?1726131199',
    description:
      'MAPTF (Market Analysis, Prediction, and Technical Forecasting) is an ambitious initiative built on the ICP ecosystem to merge advanced market forecasting, inclusive tokenomics, and community-driven research tools.',
    category: 'rwa',
    website: 'https://oc.app/community/kbdko-mqaaa-aaaar-bbena-cai',
    twitter: 'Real_MAP_Tech',
    verified: false,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'Market analysis and technical forecasting platform on ICP',
      'Advanced AI-driven prediction models for financial markets',
      'Community-driven research and analysis tools',
      'Token-gated access to premium forecasting features',
    ],
    useCases: ['Market forecasting', 'Technical analysis', 'Research tooling'],
    relatedTokenIds: ['gldt', 'vchf', 'icp'],
  },

  // ===== Meme ================================================================
  {
    id: 'bob',
    name: 'BOB',
    symbol: 'BOB',
    canisterId: '7pail-xaaaa-aaaas-aabmq-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/37127/large/bob_logo_200x200.png?1713357389',
    description:
      'Blockchain-on-Blockchain (BOB) is a new blockchain built on top of ICP. BOB creates a secure digital record book that uses ICP mining capabilities. The bob.fun platform enables launching and trading meme tokens with an active community and DAO governance.',
    category: 'meme',
    website: 'https://bob.fun',
    twitter: 'bobdotfun',
    verified: true,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'Blockchain-on-Blockchain — a new chain built on top of ICP',
      'Secure digital record book using ICP mining capabilities',
      'bob.fun platform for launching and trading meme tokens',
      'Community-driven with active DAO governance',
    ],
    useCases: ['Meme token', 'Token launchpad', 'Community'],
    relatedTokenIds: ['alice', 'exe', 'party'],
  },
  {
    id: 'exe',
    name: 'Windoge98',
    symbol: 'EXE',
    canisterId: 'rh2pm-ryaaa-aaaan-qeniq-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/38424/large/windoge98logo.png?1717465277',
    description:
      'Windoge 98 is a nostalgic take on memecoins, designed as an ICRC-1 token on the Internet Computer. This token is a nod to the Windows 98 operating system, blending the world of retro computing with DeFi and DAO governance through MicroDAO.',
    category: 'meme',
    website: 'https://windoge98.com',
    twitter: 'windoge_98',
    verified: false,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'Nostalgic Windows 98 themed memecoin on ICP',
      'ICRC-1 token with active community and DAO',
      'MicroDAO governance for decentralized decision-making',
      'Playful branding with retro computing aesthetics',
    ],
    useCases: ['Meme token', 'Community', 'Governance'],
    relatedTokenIds: ['bob', 'party', 'cloud'],
  },
  {
    id: 'party',
    name: 'Party Token',
    symbol: 'PARTY',
    canisterId: '7xkvf-zyaaa-aaaal-ajvra-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/39414/large/partylogobg.png?1722175254',
    description:
      'The Partyhats ecosystem is a platform for blockchain-based games and applications built entirely on ICP. PARTY is the native meme and utility token powering the Partyhats ecosystem, including mining games, NFT collections, and community events.',
    category: 'meme',
    website: 'https://partyhats.xyz',
    twitter: 'PartyhatsNFT',
    verified: false,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'Native utility and meme token for Partyhats ecosystem',
      'Blockchain-based games and apps on ICP',
      'Mining games, NFT collections, and community events',
      'Part of a growing play-to-earn gaming ecosystem',
    ],
    useCases: ['Gaming', 'Meme token', 'NFTs'],
    relatedTokenIds: ['bob', 'exe', 'dkp'],
  },
  {
    id: 'cloud',
    name: 'Crypto Clouds',
    symbol: 'CLOUD',
    canisterId: 'pcj6u-uaaaa-aaaak-aewnq-cai',
    standard: 'ICRC-1',
    logo: 'https://coin-images.coingecko.com/coins/images/38803/large/cloud.jpg?1718839375',
    description:
      'CLOUD is the face of the crypto cloud, the Internet Computer. Designed to showcase ICP technology in a unique and ingenious way since November 2021, making it one of the earliest community tokens on ICP.',
    category: 'meme',
    website: 'https://ltb55-ryaaa-aaaap-qhv3a-cai.icp0.io',
    twitter: 'cryptocloudsicp',
    verified: false,
    price: 0,
    priceICP: 0,
    bulletPoints: [
      'Showcasing Internet Computer technology in a unique way since 2021',
      'One of the earliest community tokens on ICP',
      'NFT collections and community-driven events',
      'Symbol of the decentralized cloud vision',
    ],
    useCases: ['Meme token', 'Community', 'NFTs'],
    relatedTokenIds: ['bob', 'exe', 'party'],
  },
];

// ---------------------------------------------------------------------------
// Lookup map (built once, O(1) access)
// ---------------------------------------------------------------------------

const TOKEN_MAP = new Map<string, TokenEntry>(TOKENS.map((t) => [t.id, t]));

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

export function getAllTokens(): TokenEntry[] {
  return TOKENS;
}

export function getToken(id: string): TokenEntry | undefined {
  return TOKEN_MAP.get(id);
}

export function getFeaturedTokens(): TokenEntry[] {
  return ['icp', 'ckbtc', 'kong', 'chat']
    .map((id) => TOKEN_MAP.get(id))
    .filter((t): t is TokenEntry => t != null);
}

export function getTokensByCategory(cat: TokenCategory): TokenEntry[] {
  return TOKENS.filter((t) => t.category === cat);
}

export function getRelatedTokens(id: string): TokenEntry[] {
  const token = TOKEN_MAP.get(id);
  if (!token?.relatedTokenIds) return [];
  return token.relatedTokenIds
    .map((rid) => TOKEN_MAP.get(rid))
    .filter((t): t is TokenEntry => t != null);
}
