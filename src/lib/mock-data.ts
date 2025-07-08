import { LucideIcon, Wallet, BarChart3, Coins, ShoppingBag, PaintBucket, GamepadIcon, Blocks, Globe, Shield } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  upvotes: number;
  category: string;
  categoryId: string;
  primaryChain: string;
  isVerified: boolean;
  websiteUrl: string;
  docsUrl?: string;
  socials?: {
    twitter?: string;
    farcaster?: string;
    discord?: string;
  };
  contractAddresses?: string[];
  license?: string;
  auditReportUrl?: string;
  duneDashboardUrl?: string;
  defillamaSlug?: string;
  descriptionMd: string;
  whitepaperUrl?: string;
  roadmapMd?: string;
  mediaUrls?: string[];
  tokenomicsMd?: string;
  tags?: string[];
  lastUpdated: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "defi",
    name: "DeFi",
    description: "Decentralized Finance protocols and apps",
    icon: Wallet,
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "Data visualization and blockchain analytics",
    icon: BarChart3,
  },
  {
    id: "exchanges",
    name: "Exchanges",
    description: "Decentralized exchanges and trading platforms",
    icon: Coins,
  },
  {
    id: "marketplaces",
    name: "Marketplaces",
    description: "Buy and sell digital assets on chain",
    icon: ShoppingBag,
  },
  {
    id: "nft",
    name: "NFT & Digital Art",
    description: "Create, collect, and trade digital collectibles",
    icon: PaintBucket,
  },
  {
    id: "gaming",
    name: "Gaming",
    description: "Blockchain-based games and gaming platforms",
    icon: GamepadIcon,
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    description: "Foundational protocols and developer tools",
    icon: Blocks,
  },
  {
    id: "social",
    name: "Social",
    description: "Decentralized social networks and communities",
    icon: Globe,
  },
  {
    id: "security",
    name: "Security",
    description: "Protection, audit, and safety tools",
    icon: Shield,
  },
];

export const PROJECTS: Project[] = [
  {
    id: "uniswap",
    name: "Uniswap",
    tagline: "Decentralized trading protocol",
    logo: "/placeholder-logos/uniswap-logo.png",
    upvotes: 4823,
    category: "Exchanges",
    categoryId: "exchanges",
    primaryChain: "Ethereum",
    isVerified: true,
    websiteUrl: "https://uniswap.org",
    docsUrl: "https://docs.uniswap.org",
    socials: {
      twitter: "https://twitter.com/Uniswap",
      discord: "https://discord.com/invite/FCfyBSbCU5",
    },
    contractAddresses: [
      "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // UNI token
      "0xE592427A0AEce92De3Edee1F18E0157C05861564", // Router
    ],
    license: "GPL-3.0",
    auditReportUrl: "https://github.com/Uniswap/v3-core/tree/main/audits",
    duneDashboardUrl: "https://dune.com/hagaetc/uniswap-metrics",
    defillamaSlug: "uniswap",
    descriptionMd: `
# Uniswap Protocol

Uniswap is a decentralized trading protocol for automated market-making (AMM). It enables users to swap tokens, add liquidity, and create markets without intermediaries.

## Key Features

- Automated market-making with concentrated liquidity
- Low slippage and gas optimization
- Multiple fee tiers for different risk levels
- Non-custodial trades directly from your wallet
- Support for all ERC-20 tokens

## Versions

- **Uniswap v1:** Basic token swaps
- **Uniswap v2:** Advanced features, flash swaps
- **Uniswap v3:** Concentrated liquidity, multiple fee tiers
    `,
    whitepaperUrl: "https://uniswap.org/whitepaper-v3.pdf",
    tags: ["dex", "amm", "trading", "v3", "liquidity"],
    lastUpdated: "2023-08-01T12:00:00Z",
  },
  {
    id: "aave",
    name: "Aave",
    tagline: "Open-source liquidity protocol",
    logo: "/placeholder-logos/aave-logo.png",
    upvotes: 3512,
    category: "DeFi",
    categoryId: "defi",
    primaryChain: "Ethereum",
    isVerified: true,
    websiteUrl: "https://aave.com",
    docsUrl: "https://docs.aave.com",
    socials: {
      twitter: "https://twitter.com/aave",
      discord: "https://discord.com/invite/CvKUrqM",
    },
    contractAddresses: [
      "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", // AAVE token
    ],
    license: "AGPL-3.0",
    auditReportUrl: "https://docs.aave.com/developers/security-and-audits",
    duneDashboardUrl: "https://dune.com/queries/170498",
    defillamaSlug: "aave",
    descriptionMd: `
# Aave Protocol

Aave is a decentralized, open-source lending protocol where users can lend and borrow cryptocurrency without going through a centralized intermediary.

## Key Features

- Deposit assets to earn interest
- Borrow assets by using your deposits as collateral
- Choose between stable and variable interest rates
- Flash loans with no collateral for developers
- Credit delegation allows depositors to delegate borrowing power
    `,
    tags: ["lending", "borrowing", "interest", "defi", "v3"],
    lastUpdated: "2023-07-20T15:30:00Z",
  },
  {
    id: "opensea",
    name: "OpenSea",
    tagline: "The largest NFT marketplace",
    logo: "/placeholder-logos/opensea-logo.png",
    upvotes: 2935,
    category: "Marketplaces",
    categoryId: "marketplaces",
    primaryChain: "Ethereum",
    isVerified: true,
    websiteUrl: "https://opensea.io",
    docsUrl: "https://docs.opensea.io",
    socials: {
      twitter: "https://twitter.com/opensea",
      discord: "https://discord.com/invite/opensea",
    },
    contractAddresses: [
      "0x00000000006c3852cbEf3e08E8dF289169EdE581", // Seaport
    ],
    license: "Proprietary",
    descriptionMd: `
# OpenSea

OpenSea is the first and largest NFT marketplace where users can create, buy, and sell NFTs.

## Key Features

- Trade NFTs across multiple blockchains
- Gasless listings on Polygon and other L2s
- Create your own NFT collections with no coding
- Set royalties for secondary sales
- Bulk listing and purchasing options
    `,
    tags: ["nft", "marketplace", "collectibles", "art", "seaport"],
    lastUpdated: "2023-09-05T10:45:00Z",
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    tagline: "Ethereum scaling solution with L2 rollups",
    logo: "/placeholder-logos/arbitrum-logo.png",
    upvotes: 3105,
    category: "Infrastructure",
    categoryId: "infrastructure",
    primaryChain: "Arbitrum",
    isVerified: true,
    websiteUrl: "https://arbitrum.io",
    docsUrl: "https://docs.arbitrum.io",
    socials: {
      twitter: "https://twitter.com/arbitrum",
      discord: "https://discord.gg/arbitrum",
    },
    contractAddresses: [
      "0x912CE59144191C1204E64559FE8253a0e49E6548", // ARB token
    ],
    descriptionMd: `
# Arbitrum

Arbitrum is an Ethereum Layer 2 scaling solution that enables high-throughput, low-cost smart contracts while remaining trustlessly secure.

## Key Features

- Optimistic rollups for faster transaction processing
- EVM-compatible for seamless developer experience
- Significantly lower gas fees than Ethereum L1
- Security inherited from Ethereum
- Support for all Ethereum smart contracts and assets
    `,
    tags: ["layer2", "scaling", "rollups", "ethereum", "optimistic"],
    lastUpdated: "2023-07-15T14:20:00Z",
  },
];

export const FEATURED_PROJECTS = PROJECTS.slice(0, 3); 