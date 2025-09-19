// Main SDK class
export { SomniaGameKit } from './core/SomniaGameKit';

// Modular managers (for advanced usage)
export { WalletManager } from './wallet/WalletManager';
export { GameManager } from './game/GameManager';
export { NFTManager } from './nft/NFTManager';
export { EventSubscriptionManager } from './events/EventSubscriptionManager';
export { GasManager } from './utils/GasManager';
export { TransactionManager } from './utils/TransactionManager';

// Core types
export type {
  SDKConfig,
  Player,
  Game,
  NFT,
  GameSession,
  GameEvent,
  EventCallback,
  TransactionOptions,
  WebSocketEventListener,
  NetworkConfig
} from './core/types';

// Event callback types
export type {
  GameEventCallbacks,
  NFTEventCallbacks
} from './events/EventSubscriptionManager';

// Error classes
export {
  BlockchainError,
  WalletConnectionError,
  ContractError,
  GasEstimationError
} from './core/errors';

// Network configurations
export { NETWORK_CONFIGS } from './core/config';

// Export contract artifacts and types
export {
  GAME_CONTRACT_ARTIFACT,
  GAME_NFT_ARTIFACT,
  GAME_CONTRACT_ABI,
  GAME_NFT_ABI,
  GAME_CONTRACT_BYTECODE,
  GAME_NFT_BYTECODE
} from './contracts';

export type {
  ContractArtifact,
  GameContractDeployParams,
  GameNFTDeployParams,
  DeployedContracts
} from './contracts';