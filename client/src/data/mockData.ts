export interface Project {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  logo: string;
  website: string;
  category: string;
  tags: string[];
  votes: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const categories: Category[] = [
  {
    id: 'lending',
    name: 'Lending',
    description: 'Platforms that allow users to lend and borrow crypto assets',
    icon: '💰',
  },
  {
    id: 'dexes',
    name: 'DEXes',
    description: 'Decentralized exchanges for trading crypto assets',
    icon: '📊',
  },
  {
    id: 'perpetuals',
    name: 'Perpetuals',
    description: 'Platforms for trading perpetual futures contracts',
    icon: '📈',
  },
  {
    id: 'games',
    name: 'Games',
    description: 'Blockchain-based games and gaming platforms',
    icon: '🎮',
  },
  {
    id: 'nfts',
    name: 'NFTs',
    description: 'Platforms for creating, buying, and selling NFTs',
    icon: '🖼️',
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Social media and communication platforms on blockchain',
    icon: '💬',
  },
];

export const projects: Project[] = [
  {
    id: 'aave',
    name: 'Aave',
    description: 'An open-source and non-custodial liquidity protocol for earning interest on deposits and borrowing assets',
    longDescription: `Aave is a decentralized non-custodial liquidity protocol where users can participate as depositors or borrowers. Depositors provide liquidity to the market to earn a passive income, while borrowers can borrow in an overcollateralized (perpetually) or undercollateralized (one-block liquidity) fashion.

Aave Protocol is unique in that it tokenizes deposits as aTokens, which accrue interest in real time. It also features access to highly innovative flash loans, which allow developers to borrow without collateral, given that the liquidity is returned to the protocol within one block transaction.

Additionally, Aave Protocol introduces the concept of delegated credit, allowing your credit line to be utilized by the address of your choice. The protocol is governed by AAVE token holders, who vote on proposals for protocol improvements and risk parameters.`,
    logo: '/images/aave-logo.png',
    website: 'https://aave.com',
    category: 'Lending',
    tags: ['Lending', 'DeFi', 'Interest', 'Borrowing'],
    votes: 1024,
    createdAt: '2022-01-01',
  },
  {
    id: 'uniswap',
    name: 'Uniswap',
    description: 'A protocol for trading and automated liquidity provision on Ethereum',
    longDescription: `Uniswap is a decentralized trading protocol, known for its role in facilitating automated trading of decentralized finance (DeFi) tokens.

Uniswap aims to keep token trading automated and completely open to anyone who holds tokens, while improving the efficiency of trading versus that on traditional exchanges.

Uniswap creates more efficiency by solving liquidity issues with automated solutions, avoiding the problems which plagued the first decentralized exchanges.

In September 2020, Uniswap created and awarded its own governance token, UNI, to past users of the protocol. This added both profitability potential and the ability for users to shape its future — an attractive aspect of decentralized entities.`,
    logo: '/images/uniswap-logo.png',
    website: 'https://uniswap.org',
    category: 'DEXes',
    tags: ['DEX', 'DeFi', 'AMM', 'Trading'],
    votes: 892,
    createdAt: '2022-01-05',
  },
  {
    id: 'dydx',
    name: 'dYdX',
    description: 'A powerful decentralized exchange for trading perpetual futures',
    longDescription: `dYdX is a decentralized exchange that supports margin trading, spot trading, lending, and borrowing.

It provides a powerful trading platform for experienced traders, with features including low fees, deep liquidity, and up to 20x leverage on perpetual futures trading.

What sets dYdX apart is its focus on a traditional trading interface with advanced features like a full order book, while maintaining the benefits of decentralization.

The dYdX protocol is governed by DYDX token holders, who can vote on protocol changes and earn rewards for participating in governance.`,
    logo: '/images/dydx-logo.png',
    website: 'https://dydx.exchange',
    category: 'Perpetuals',
    tags: ['Perpetuals', 'DeFi', 'Trading', 'Derivatives'],
    votes: 742,
    createdAt: '2022-01-10',
  },
  {
    id: 'axie',
    name: 'Axie Infinity',
    description: 'A blockchain-based game where players collect, breed, and battle fantasy creatures called Axies',
    longDescription: `Axie Infinity is a blockchain-based game where players collect, breed, and battle fantasy creatures called Axies.

The game follows a "play-to-earn" model, where players can earn cryptocurrency rewards (SLP and AXS tokens) through skilled gameplay and contributions to the ecosystem.

Each Axie is a non-fungible token (NFT) with different attributes and abilities. Players can breed their Axies to create new ones, which can be used in battles or sold on the marketplace.

The Axie Infinity universe also includes land-based gameplay, where players can purchase, develop, and monetize virtual plots of land.`,
    logo: '/images/axie-logo.png',
    website: 'https://axieinfinity.com',
    category: 'Games',
    tags: ['Gaming', 'NFT', 'Play-to-Earn', 'Metaverse'],
    votes: 623,
    createdAt: '2022-01-15',
  },
  {
    id: 'opensea',
    name: 'OpenSea',
    description: 'The largest marketplace for NFTs, where users can create, buy, and sell digital assets',
    longDescription: `OpenSea is the first and largest marketplace for non-fungible tokens (NFTs) and rare digital items.

It provides a platform where users can create, buy, and sell NFTs across various categories including art, collectibles, domain names, music, photography, sports, and virtual worlds.

The platform supports multiple blockchains including Ethereum, Polygon, Solana, and more, making it accessible to a wide range of users.

OpenSea offers creator tools that allow anyone to mint their own NFTs without any coding knowledge, and provides robust analytics for tracking the performance of collections and individual assets.`,
    logo: '/images/opensea-logo.png',
    website: 'https://opensea.io',
    category: 'NFTs',
    tags: ['NFT', 'Marketplace', 'Art', 'Collectibles'],
    votes: 521,
    createdAt: '2022-01-20',
  },
  {
    id: 'lens',
    name: 'Lens Protocol',
    description: 'A composable and decentralized social graph protocol built on Polygon',
    longDescription: `Lens Protocol is a composable and decentralized social graph protocol built on the Polygon blockchain.

It allows developers to build social applications where users own their content and connections, rather than the platforms they use.

The protocol uses NFTs to represent profiles, publications, and follows, giving users true ownership of their social data.

Lens aims to create an open social media ecosystem where user data is portable across different applications, and where creators have direct relationships with their communities without platform intermediaries.`,
    logo: '/images/lens-logo.png',
    website: 'https://lens.xyz',
    category: 'Social',
    tags: ['Social', 'Web3', 'Community', 'Content'],
    votes: 478,
    createdAt: '2022-01-25',
  },
];

export const getCategoryProjects = (categoryId: string): Project[] => {
  return projects.filter(
    (project) => project.category.toLowerCase() === categoryId.toLowerCase()
  );
};

export const getProjectById = (id: string): Project | undefined => {
  return projects.find((project) => project.id === id);
};

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find((category) => category.id === id);
}; 