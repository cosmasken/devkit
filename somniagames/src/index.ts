// src/index.ts
export { GameRegistry } from './GameRegistry';
export { GameAsset } from './GameAsset';
export { GameToken } from './GameToken';
export { GameLeaderboard } from './GameLeaderboard';
export { GameShop } from './GameShop';
export { WalletConnector } from './WalletConnector';

export interface GameConfig {
  rpcUrl: string;
  chainId: number;
}

export interface GameMetadata {
  id: number;
  name: string;
  description: string;
  creator: string;
  createdAt: number;
  isActive: boolean;
}

export interface ExtendedGameMetadata extends GameMetadata {
  metadataURI: string;
  updatedAt: number;
  playerCount: number;
  version: number;
  leaderboardAddress: string;
  shopAddress: string;
}

export interface GameAssetMetadata {
  id: number;
  name: string;
  description: string;
  metadataURI: string;
  createdAt: number;
  updatedAt: number;
  gameId: number;
  rarity: number;
  level: number;
}

export interface LeaderboardInfo {
  id: number;
  name: string;
  description: string;
  gameId: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PlayerScore {
  player: string;
  score: number;
  timestamp: number;
}

export interface ShopItem {
  id: number;
  name: string;
  description: string;
  metadataURI: string;
  price: number;
  tokenAddress: string;
  gameId: number;
  quantity: number;
  maxQuantity: number;
  createdAt: number;
  updatedAt: number;
  active: boolean;
}

export interface PurchaseRecord {
  itemId: number;
  buyer: string;
  quantity: number;
  totalPrice: number;
  timestamp: number;
}