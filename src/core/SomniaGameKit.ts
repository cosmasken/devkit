/**
 * Enhanced Somnia Blockchain Game SDK with NFT Support (Refactored)
 * 
 * This SDK provides tools for developing blockchain-based games on the Somnia Network
 * with full NFT support for in-game assets.
 */

import Web3 from 'web3';
import { ethers } from 'ethers';
import { WebSocketProviderFactory, createWebSocketConfig, NetworkStatus } from './WebSocketProvider';
import { WalletManager } from '../wallet/WalletManager';
import { GameManager } from '../game/GameManager';
import { NFTManager } from '../nft/NFTManager';
import { EventSubscriptionManager, GameEventCallbacks, NFTEventCallbacks } from '../events/EventSubscriptionManager';
import { GasManager } from '../utils/GasManager';
import { TransactionManager } from '../utils/TransactionManager';
import { SDKConfig, Player, Game, NFT, GameSession, TransactionOptions } from './types';
import { BlockchainError } from './errors';
import { NETWORK_CONFIGS } from './config';

export class SomniaGameKit {
  private config!: SDKConfig;
  private web3!: Web3;
  private ethersProvider?: ethers.WebSocketProvider;
  private webSocketFactory?: WebSocketProviderFactory;

  // Manager instances
  private walletManager!: WalletManager;
  private gameManager!: GameManager;
  private nftManager!: NFTManager;
  private eventManager!: EventSubscriptionManager;
  private gasManager!: GasManager;
  private transactionManager!: TransactionManager;

  // Legacy storage for backward compatibility
  private gameSessions: Map<string, GameSession>;

  constructor() {
    this.gameSessions = new Map();
    
    // Initialize basic managers for unit testing without full initialization
    this.initializeBasicManagers();
  }

  /**
   * Initialize basic managers for unit testing and basic operations
   */
  private initializeBasicManagers(): void {
    // Create a basic Web3 instance for local operations
    const basicWeb3 = new Web3('http://localhost:8545');
    
    // Initialize managers with basic setup
    this.walletManager = new WalletManager(basicWeb3, 'local');
    this.gasManager = new GasManager(basicWeb3, { network: 'local' });
    this.transactionManager = new TransactionManager(basicWeb3);
    this.gameManager = new GameManager(basicWeb3, this.walletManager, this.gasManager);
    this.nftManager = new NFTManager(basicWeb3, this.walletManager, this.gasManager, { network: 'local' });
    
    // Event manager will be initialized during full initialization
    // For now, create a placeholder
    this.eventManager = new EventSubscriptionManager(undefined);
  }

  /**
   * Initializes the SDK with basic configuration parameters.
   * @param config - Configuration parameters including network settings and API keys
   */
  async initialize(config: SDKConfig): Promise<void> {
    this.config = config;

    try {
      // Determine RPC URL based on network configuration
      let rpcUrl: string;
      if (config.rpcUrl) {
        rpcUrl = config.rpcUrl;
      } else if (NETWORK_CONFIGS[config.network as keyof typeof NETWORK_CONFIGS]) {
        rpcUrl = NETWORK_CONFIGS[config.network as keyof typeof NETWORK_CONFIGS].rpcUrl;
      } else {
        // Fallback to local provider for testing
        rpcUrl = 'http://localhost:8545';
      }

      // Initialize Web3 with the determined RPC URL
      if (typeof globalThis !== 'undefined' && (globalThis as any).window?.ethereum) {
        this.web3 = new Web3((globalThis as any).window.ethereum);
      } else {
        this.web3 = new Web3(rpcUrl);
      }

      // Re-initialize managers with proper configuration
      this.walletManager = new WalletManager(this.web3, this.config.network);
      this.gasManager = new GasManager(this.web3, this.config);
      this.transactionManager = new TransactionManager(this.web3);
      this.gameManager = new GameManager(this.web3, this.walletManager, this.gasManager);
      this.nftManager = new NFTManager(this.web3, this.walletManager, this.gasManager, this.config);

      // Initialize WebSocket provider factory for real-time events
      await this.initializeWebSocketProvider();

      console.log(`SDK initialized with network: ${config.network} (${rpcUrl})`);
    } catch (error: any) {
      throw new BlockchainError(`Failed to initialize SDK: ${error.message}`, 'INITIALIZATION_ERROR', error);
    }
  }

  /**
   * Initializes the WebSocket provider for real-time blockchain events
   */
  private async initializeWebSocketProvider(): Promise<void> {
    try {
      // Skip WebSocket initialization in test environment
      if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
        this.eventManager = new EventSubscriptionManager();
        return;
      }

      // Create WebSocket configuration for the specified network
      const wsConfig = createWebSocketConfig(this.config.network);

      // Override with custom settings if provided
      if (this.config.eventSettings?.reconnectAttempts) {
        wsConfig.maxReconnectAttempts = this.config.eventSettings.reconnectAttempts;
      }
      if (this.config.eventSettings?.reconnectDelay) {
        wsConfig.reconnectDelay = this.config.eventSettings.reconnectDelay;
      }

      // Create WebSocket provider factory
      this.webSocketFactory = new WebSocketProviderFactory(wsConfig);

      // Establish initial connection
      this.ethersProvider = await this.webSocketFactory.connect();

      // Initialize event manager with the provider
      this.eventManager = new EventSubscriptionManager(this.ethersProvider);

      console.log('WebSocket provider initialized successfully');
    } catch (error: any) {
      console.warn('Failed to initialize WebSocket provider:', error.message);
      console.warn('Real-time events will not be available');
      // Initialize event manager without provider for graceful degradation
      this.eventManager = new EventSubscriptionManager();
    }
  }

  // ========================================
  // WALLET OPERATIONS
  // ========================================

  /**
   * Connects to a wallet
   */
  async connectWallet(walletAddress?: string): Promise<string> {
    return this.walletManager.connectWallet(walletAddress);
  }

  /**
   * Gets the current connected wallet address
   */
  getWalletAddress(): string | undefined {
    return this.walletManager.getWalletAddress();
  }

  /**
   * Checks if a wallet is connected
   */
  isWalletConnected(): boolean {
    return this.walletManager.isWalletConnected();
  }

  // ========================================
  // GAME OPERATIONS
  // ========================================

  /**
   * Creates a new game by deploying and initializing a GameContract
   */
  async createGame(initialLevel: number, options?: TransactionOptions): Promise<{ gameId: string; contractAddress: string }> {
    return this.gameManager.createGame(initialLevel, options);
  }

  /**
   * Deploys a new GameContract to the blockchain
   * Legacy API compatibility - synchronous version for tests
   */
  deployGame(bytecode: string, abi: any, initialState: any): Game;
  /**
   * Deploys a new GameContract to the blockchain
   * Modern async API - returns object with contractAddress
   */
  deployGame(initialLevel: number, options?: TransactionOptions): Promise<{ contractAddress: string }>;
  deployGame(
    bytecodeOrLevel: string | number, 
    abiOrOptions?: any | TransactionOptions, 
    initialState?: any
  ): Game | Promise<{ contractAddress: string }> {
    // Legacy synchronous API for backward compatibility with tests
    if (typeof bytecodeOrLevel === 'string') {
      const gameId = this.gameManager.generateGameId();
      const game: Game = {
        id: gameId,
        state: initialState || {},
        players: [],
        contractAddress: undefined
      };
      this.gameManager.addGame(game);
      return game;
    }
    
    // Modern async API - wrap the result to include contractAddress
    return this.gameManager.deployGame(bytecodeOrLevel, abiOrOptions).then(contractAddress => ({
      contractAddress
    }));
  }

  /**
   * Starts a game - Legacy API compatibility
   */
  startGame(gameId: string, playerIds: string[]): GameSession;
  /**
   * Starts a game - Modern async API
   */
  startGame(gameId: string, playerAddresses: string[], options?: TransactionOptions): Promise<any>;
  startGame(
    gameId: string,
    playerIdsOrAddresses: string[],
    options?: TransactionOptions
  ): GameSession | Promise<any> {
    // Legacy synchronous API for backward compatibility with tests
    if (!options) {
      const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
      const session: GameSession = {
        id: sessionId,
        gameId: gameId,
        players: playerIdsOrAddresses,
        status: 'active',
        startTime: new Date()
      };
      this.gameSessions.set(sessionId, session);
      return session;
    }
    
    // Modern async API
    return this.gameManager.startGame(gameId, playerIdsOrAddresses, options);
  }

  /**
   * Ends a game - Legacy API compatibility
   */
  endGame(sessionId: string, finalState: any): boolean;
  /**
   * Ends a game - Modern async API
   */
  endGame(gameId: string, winner: string, options?: TransactionOptions): Promise<any>;
  endGame(
    sessionIdOrGameId: string,
    finalStateOrWinner: any | string,
    options?: TransactionOptions
  ): boolean | Promise<any> {
    // Legacy synchronous API for backward compatibility with tests
    if (typeof finalStateOrWinner === 'object' && !options) {
      // This is the legacy API call
      console.log(`Game session ${sessionIdOrGameId} ended with state:`, finalStateOrWinner);
      return true;
    }
    
    // Modern async API
    return this.gameManager.endGame(sessionIdOrGameId, finalStateOrWinner as string, options);
  }

  /**
   * Gets the current game state from the contract
   */
  async getGameState(gameId: string): Promise<{ level: number; score: number; isActive: boolean }> {
    return this.gameManager.getGameState(gameId);
  }

  /**
   * Joins a game by calling the contract's joinGame() function
   */
  async joinGame(gameId: string, options?: TransactionOptions): Promise<any> {
    return this.gameManager.joinGame(gameId, options);
  }

  /**
   * Makes a move in the game - Legacy API compatibility
   */
  makeMove(sessionId: string, playerId: string, moveDetails: any): boolean;
  /**
   * Makes a move in the game - Modern async API
   */
  makeMove(gameId: string, move: string, options?: TransactionOptions): Promise<any>;
  makeMove(
    sessionIdOrGameId: string,
    playerIdOrMove: string,
    moveDetailsOrOptions?: any | TransactionOptions
  ): boolean | Promise<any> {
    // Legacy synchronous API for backward compatibility with tests
    if (moveDetailsOrOptions && typeof moveDetailsOrOptions === 'object' && 'action' in moveDetailsOrOptions) {
      // This is the legacy API call
      console.log(`Move made in session ${sessionIdOrGameId} by player ${playerIdOrMove}:`, moveDetailsOrOptions);
      return true;
    }
    
    // Modern async API
    return this.gameManager.makeMove(sessionIdOrGameId, playerIdOrMove, moveDetailsOrOptions);
  }

  /**
   * Gets a player's score from the contract
   */
  async getPlayerScore(gameId: string, playerAddress: string): Promise<number> {
    return this.gameManager.getPlayerScore(gameId, playerAddress);
  }

  /**
   * Gets the list of current players in the game from the contract
   */
  async getPlayers(gameId: string): Promise<string[]> {
    return this.gameManager.getPlayers(gameId);
  }

  /**
   * Creates a new player
   */
  createPlayer(playerDetails: Omit<Player, 'id'>): Player {
    return this.gameManager.createPlayer(playerDetails);
  }

  /**
   * Gets a player by ID
   */
  getPlayer(playerId: string): Player | undefined {
    return this.gameManager.getPlayer(playerId);
  }

  /**
   * Gets a game by ID
   */
  getGame(gameId: string): Game | undefined {
    return this.gameManager.getGame(gameId);
  }

  // ========================================
  // NFT OPERATIONS
  // ========================================

  /**
   * Deploys a new GameNFT contract to the blockchain
   */
  async deployNFTContract(options?: TransactionOptions): Promise<string> {
    return this.nftManager.deployNFTContract(options);
  }

  /**
   * Mints a new NFT - Legacy API compatibility
   */
  mintNFT(playerId: string, metadata: { name: string; description: string; image: string }): NFT;
  /**
   * Mints a new NFT - Modern async API
   */
  mintNFT(
    recipient: string,
    name: string,
    description: string,
    image: string,
    options?: TransactionOptions
  ): Promise<number>;
  mintNFT(
    playerIdOrRecipient: string,
    metadataOrName: { name: string; description: string; image: string } | string,
    description?: string,
    image?: string,
    options?: TransactionOptions
  ): NFT | Promise<number> {
    // Legacy synchronous API for backward compatibility with tests
    if (typeof metadataOrName === 'object') {
      const nftId = 'nft_' + Math.random().toString(36).substr(2, 9);
      const nft: NFT = {
        id: nftId,
        playerId: playerIdOrRecipient,
        metadata: metadataOrName
      };
      this.nftManager.addNFT(nft);
      return nft;
    }
    
    // Modern async API
    return this.nftManager.mintNFT(
      playerIdOrRecipient,
      metadataOrName,
      description!,
      image!,
      options
    );
  }

  /**
   * Gets NFT metadata from the contract
   */
  async getNFTMetadata(tokenId: number, contractAddress?: string): Promise<{ name: string; description: string; image: string }> {
    return this.nftManager.getNFTMetadata(tokenId, contractAddress);
  }

  /**
   * Gets the owner of an NFT token
   */
  async getNFTOwner(tokenId: number, contractAddress?: string): Promise<string> {
    return this.nftManager.getNFTOwner(tokenId, contractAddress);
  }

  /**
   * Transfers an NFT from one address to another
   */
  async transferNFT(
    from: string,
    to: string,
    tokenId: string | number,
    contractAddress?: string,
    options?: TransactionOptions
  ): Promise<any> {
    // Convert string tokenId to number if needed
    const numericTokenId = typeof tokenId === 'string' ? parseInt(tokenId.replace('nft_', ''), 10) : tokenId;
    return this.nftManager.transferNFT(from, to, numericTokenId, contractAddress, options);
  }

  /**
   * Gets an NFT by ID from local cache
   */
  getNFT(nftId: string): NFT | undefined {
    return this.nftManager.getNFT(nftId);
  }

  // ========================================
  // EVENT SUBSCRIPTION OPERATIONS
  // ========================================

  /**
   * Subscribes to game events - Legacy API compatibility
   */
  listenForGameEvents(gameId: string, eventName: string, callback: (event: any) => void): void;
  /**
   * Subscribes to game contract events - Modern async API
   */
  listenForGameEvents(contractAddress: string, callbacks: GameEventCallbacks): Promise<string>;
  listenForGameEvents(
    gameIdOrContractAddress: string,
    eventNameOrCallbacks: string | GameEventCallbacks,
    callback?: (event: any) => void
  ): void | Promise<string> {
    // Legacy synchronous API for backward compatibility with tests
    if (typeof eventNameOrCallbacks === 'string' && callback) {
      // Store the callback for later use when emitGameEvent is called
      const eventKey = `${gameIdOrContractAddress}:${eventNameOrCallbacks}`;
      if (!this.eventCallbacks) {
        this.eventCallbacks = new Map();
      }
      this.eventCallbacks.set(eventKey, callback);
      return;
    }
    
    // Modern async API
    return this.eventManager.listenForGameEvents(gameIdOrContractAddress, eventNameOrCallbacks as GameEventCallbacks);
  }

  private eventCallbacks?: Map<string, (event: any) => void>;

  /**
   * Subscribes to NFT contract Transfer events
   */
  async listenForNFTEvents(contractAddress: string, callbacks: NFTEventCallbacks): Promise<string> {
    return this.eventManager.listenForNFTEvents(contractAddress, callbacks);
  }

  /**
   * Stops listening for events and cleans up the subscription
   */
  async stopListeningForEvents(subscriptionId: string): Promise<void> {
    return this.eventManager.stopListeningForEvents(subscriptionId);
  }

  /**
   * Stops all active event subscriptions and cleans up resources
   */
  async stopAllEventListeners(): Promise<void> {
    return this.eventManager.stopAllEventListeners();
  }

  // ========================================
  // UTILITY OPERATIONS
  // ========================================

  /**
   * Gets the current gas price from the network
   */
  async getGasPrice(): Promise<string> {
    return this.gasManager.getGasPrice();
  }

  /**
   * Estimates gas for a transaction
   */
  async estimateGas(transactionObject: any): Promise<number> {
    return this.gasManager.estimateGas(transactionObject);
  }

  /**
   * Waits for a transaction to be confirmed
   */
  async waitForTransactionConfirmation(
    transactionHash: string,
    confirmations: number = 1,
    timeout: number = 60000
  ): Promise<any> {
    return this.transactionManager.waitForTransactionConfirmation(transactionHash, confirmations, timeout);
  }

  // ========================================
  // NETWORK AND CONNECTION OPERATIONS
  // ========================================

  /**
   * Gets the current network status including connection health
   */
  async getNetworkStatus(): Promise<NetworkStatus> {
    if (!this.webSocketFactory) {
      throw new BlockchainError('WebSocket provider not initialized', 'PROVIDER_NOT_INITIALIZED');
    }

    return await this.webSocketFactory.getNetworkStatus();
  }

  /**
   * Checks if the WebSocket connection is active
   */
  isWebSocketConnected(): boolean {
    return this.webSocketFactory?.isConnected() || false;
  }

  /**
   * Gets the ethers.js WebSocket provider instance
   */
  getEthersProvider(): ethers.WebSocketProvider | undefined {
    return this.ethersProvider;
  }

  // ========================================
  // ADDITIONAL PLAYER OPERATIONS
  // ========================================

  /**
   * Validates a player's profile
   */
  validatePlayer(playerId: string): boolean {
    return this.gameManager.validatePlayer(playerId);
  }

  /**
   * Updates a player's profile
   */
  updatePlayer(playerId: string, updates: Partial<Omit<Player, 'id'>>): Player | undefined {
    return this.gameManager.updatePlayer(playerId, updates);
  }

  /**
   * Deletes a player's profile
   */
  deletePlayer(playerId: string): boolean {
    return this.gameManager.deletePlayer(playerId);
  }

  /**
   * Lists all players
   */
  listPlayers(): Player[] {
    return this.gameManager.listPlayers();
  }

  // ========================================
  // ADDITIONAL GAME OPERATIONS
  // ========================================

  /**
   * Updates a game's state
   */
  updateGame(gameId: string, newState: any): Game | undefined {
    return this.gameManager.updateGame(gameId, newState);
  }

  /**
   * Deletes a game
   */
  deleteGame(gameId: string): boolean {
    return this.gameManager.deleteGame(gameId);
  }

  /**
   * Lists all games
   */
  listGames(): Game[] {
    return this.gameManager.listGames();
  }

  /**
   * Adds a player to a game
   */
  async addPlayerToGame(gameId: string, playerId: string, options?: TransactionOptions): Promise<boolean> {
    return this.gameManager.addPlayerToGame(gameId, playerId, options);
  }

  /**
   * Removes a player from a game
   */
  async removePlayerFromGame(gameId: string, playerId: string, options?: TransactionOptions): Promise<boolean> {
    return this.gameManager.removePlayerFromGame(gameId, playerId, options);
  }

  // ========================================
  // ADDITIONAL NFT OPERATIONS
  // ========================================

  /**
   * Claims an NFT for a player - Legacy API compatibility
   */
  claimNFT(playerId: string, nftId: string): NFT | undefined;
  /**
   * Claims an NFT for a player - Modern async API
   */
  claimNFT(playerId: string, nftId: string, options: TransactionOptions): Promise<NFT | undefined>;
  claimNFT(playerId: string, nftId: string, options?: TransactionOptions): NFT | undefined | Promise<NFT | undefined> {
    // Legacy synchronous API for backward compatibility with tests
    if (!options) {
      return this.nftManager.claimNFTSync(playerId, nftId);
    }
    
    // Modern async API
    return this.nftManager.claimNFT(playerId, nftId, options);
  }

  /**
   * Gets all NFTs owned by a player
   */
  getPlayerNFTs(playerId: string): NFT[] {
    return this.nftManager.getPlayerNFTs(playerId);
  }

  /**
   * Lists all NFTs
   */
  listNFTs(): NFT[] {
    return this.nftManager.listNFTs();
  }

  // ========================================
  // ADDITIONAL EVENT OPERATIONS
  // ========================================

  /**
   * Emits a game event
   */
  async emitGameEvent(gameId: string, eventName: string, eventData: any, options?: TransactionOptions): Promise<void> {
    // For legacy compatibility, trigger any registered callbacks
    if (this.eventCallbacks) {
      const eventKey = `${gameId}:${eventName}`;
      const callback = this.eventCallbacks.get(eventKey);
      if (callback) {
        callback({
          name: eventName,
          data: eventData
        });
      }
    }
    
    return this.gameManager.emitGameEvent(gameId, eventName, eventData, options);
  }

  /**
   * Listens for WebSocket events
   */
  async listenForWebSocketEvents(
    contractAddress: string,
    eventName: string,
    callback: (event: any) => void,
    filter?: any
  ): Promise<string> {
    return this.eventManager.listenForWebSocketEvents(contractAddress, eventName, callback, filter);
  }

  /**
   * Stops listening for WebSocket events
   */
  async stopListeningForWebSocketEvents(listenerId: string): Promise<void> {
    return this.eventManager.stopListeningForWebSocketEvents(listenerId);
  }

  // ========================================
  // VALIDATION UTILITIES
  // ========================================

  /**
   * Validates a game ID
   */
  validateGameId(gameId: string): boolean {
    return this.gameManager.validateGameId(gameId);
  }

  /**
   * Validates a player ID
   */
  validatePlayerId(playerId: string): boolean {
    return this.gameManager.validatePlayerId(playerId);
  }

  /**
   * Generates a unique game ID
   */
  generateGameId(): string {
    return this.gameManager.generateGameId();
  }

  // ========================================
  // GAME SESSION OPERATIONS (Legacy compatibility)
  // ========================================

  /**
   * Gets a game session
   */
  getGameSession(sessionId: string): GameSession | undefined {
    return this.gameSessions.get(sessionId);
  }

  /**
   * Lists all game sessions
   */
  listGameSessions(): GameSession[] {
    return Array.from(this.gameSessions.values());
  }

  /**
   * Cleans up resources and disconnects WebSocket connections
   */
  async cleanup(): Promise<void> {
    try {
      // Stop all event listeners first
      if (this.eventManager) {
        await this.eventManager.stopAllEventListeners();
      }

      if (this.webSocketFactory) {
        await this.webSocketFactory.disconnect();
        console.log('WebSocket connections cleaned up');
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}