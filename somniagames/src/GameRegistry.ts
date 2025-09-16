// src/GameRegistry.ts
import { ethers } from 'ethers';
import { GameMetadata } from './index';
import { GameStateManager } from './websocket/GameStateManager';

export interface ExtendedGameMetadata extends GameMetadata {
  metadataURI: string;
  updatedAt: number;
  playerCount: number;
  version: number;
}

export class GameRegistry {
  private contract: ethers.Contract;
  private provider: ethers.providers.Provider;
  private signer: ethers.Signer | null = null;
  private gameStateManager: GameStateManager | null = null;

  constructor(
    contractAddress: string, 
    provider: ethers.providers.Provider, 
    signer?: ethers.Signer,
    wsUrl?: string
  ) {
    // Extended ABI for GameRegistry contract
    const abi = [
      // Existing functions
      "function createGame(string name, string description, string metadataURI) public",
      "function games(uint256 id) view returns (uint256 id, string name, string description, string metadataURI, address creator, uint256 createdAt, uint256 updatedAt, bool isActive, uint256 playerCount, uint256 version, address leaderboardAddress, address shopAddress)",
      "function getGamesByCreator(address creator) view returns (uint256[])",
      "function activateGame(uint256 gameId) public",
      "function deactivateGame(uint256 gameId) public",
      "function gameCount() view returns (uint256)",
      
      // New functions
      "function updateGame(uint256 gameId, string name, string description) public",
      "function updateGameMetadata(uint256 gameId, string metadataURI) public",
      "function updateGameVersion(uint256 gameId, uint256 version) public",
      "function setGameLeaderboard(uint256 gameId, address leaderboardAddress) public",
      "function setGameShop(uint256 gameId, address shopAddress) public",
      "function joinGame(uint256 gameId) public",
      "function leaveGame(uint256 gameId) public",
      "function getGamePlayers(uint256 gameId) view returns (address[])",
      "function isPlayerInGame(uint256 gameId, address player) view returns (bool)",
      "function getActiveGames(uint256 offset, uint256 limit) view returns (uint256[])",
      "function getActiveGamesCount() view returns (uint256)",
      "function getGameLeaderboard(uint256 gameId) view returns (address)",
      "function getGameShop(uint256 gameId) view returns (address)",
      
      // Events
      "event GameCreated(uint256 indexed gameId, string name, address indexed creator)",
      "event GameActivated(uint256 indexed gameId)",
      "event GameDeactivated(uint256 indexed gameId)",
      "event GameUpdated(uint256 indexed gameId, string name, string description)",
      "event GameMetadataUpdated(uint256 indexed gameId, string metadataURI)",
      "event PlayerJoined(uint256 indexed gameId, address player)",
      "event PlayerLeft(uint256 indexed gameId, address player)",
      "event GameVersionUpdated(uint256 indexed gameId, uint256 version)",
      "event GameLeaderboardSet(uint256 indexed gameId, address leaderboardAddress)",
      "event GameShopSet(uint256 indexed gameId, address shopAddress)"
    ];
    
    this.provider = provider;
    this.contract = new ethers.Contract(contractAddress, abi, provider);
    
    if (signer) {
      this.signer = signer;
      this.contract = this.contract.connect(signer);
    }

    // Initialize WebSocket connection if URL provided
    if (wsUrl) {
      this.gameStateManager = new GameStateManager(wsUrl);
    }
  }

  /**
   * Create a new game
   * @param name Name of the game
   * @param description Description of the game
   * @param metadataURI URI to game metadata (optional)
   * @returns Transaction receipt
   */
  async createGame(name: string, description: string, metadataURI: string = ""): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to create game');
    }
    
    const tx = await this.contract.createGame(name, description, metadataURI);
    return await tx.wait();
  }

  /**
   * Get game information by ID
   * @param gameId ID of the game
   * @returns Game metadata
   */
  async getGame(gameId: number): Promise<ExtendedGameMetadata> {
    if (gameId <= 0) {
      throw new Error('Game ID must be a positive integer');
    }
    
    try {
      const game = await this.contract.games(gameId);
      
      return {
        id: game.id.toNumber(),
        name: game.name,
        description: game.description,
        metadataURI: game.metadataURI,
        creator: game.creator,
        createdAt: game.createdAt.toNumber(),
        updatedAt: game.updatedAt.toNumber(),
        isActive: game.isActive,
        playerCount: game.playerCount.toNumber(),
        version: game.version.toNumber()
      };
    } catch (error: any) {
      throw new Error(`Failed to get game with ID ${gameId}: ${error.message || error}`);
    }
  }

  /**
   * Update game information
   * @param gameId ID of the game to update
   * @param name New name of the game
   * @param description New description of the game
   * @returns Transaction receipt
   */
  async updateGame(gameId: number, name: string, description: string): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to update game');
    }
    
    if (gameId <= 0) {
      throw new Error('Game ID must be a positive integer');
    }
    
    try {
      const tx = await this.contract.updateGame(gameId, name, description);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to update game with ID ${gameId}: ${error.message || error}`);
    }
  }

  /**
   * Update game metadata URI
   * @param gameId ID of the game to update
   * @param metadataURI New URI to game metadata
   * @returns Transaction receipt
   */
  async updateGameMetadata(gameId: number, metadataURI: string): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to update game metadata');
    }
    
    if (gameId <= 0) {
      throw new Error('Game ID must be a positive integer');
    }
    
    try {
      const tx = await this.contract.updateGameMetadata(gameId, metadataURI);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to update game metadata with ID ${gameId}: ${error.message || error}`);
    }
  }

  /**
   * Update game version
   * @param gameId ID of the game to update
   * @param version New version number
   * @returns Transaction receipt
   */
  async updateGameVersion(gameId: number, version: number): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to update game version');
    }
    
    if (gameId <= 0) {
      throw new Error('Game ID must be a positive integer');
    }
    
    if (version <= 0) {
      throw new Error('Version must be a positive integer');
    }
    
    try {
      const tx = await this.contract.updateGameVersion(gameId, version);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to update game version with ID ${gameId}: ${error.message || error}`);
    }
  }

  /**
   * Set leaderboard contract address for a game
   * @param gameId ID of the game
   * @param leaderboardAddress Address of the leaderboard contract
   * @returns Transaction receipt
   */
  async setGameLeaderboard(gameId: number, leaderboardAddress: string): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to set game leaderboard');
    }
    
    if (gameId <= 0) {
      throw new Error('Game ID must be a positive integer');
    }
    
    if (!ethers.utils.isAddress(leaderboardAddress)) {
      throw new Error('Invalid leaderboard address');
    }
    
    try {
      const tx = await this.contract.setGameLeaderboard(gameId, leaderboardAddress);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to set game leaderboard for game ID ${gameId}: ${error.message || error}`);
    }
  }

  /**
   * Set shop contract address for a game
   * @param gameId ID of the game
   * @param shopAddress Address of the shop contract
   * @returns Transaction receipt
   */
  async setGameShop(gameId: number, shopAddress: string): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to set game shop');
    }
    
    if (gameId <= 0) {
      throw new Error('Game ID must be a positive integer');
    }
    
    if (!ethers.utils.isAddress(shopAddress)) {
      throw new Error('Invalid shop address');
    }
    
    try {
      const tx = await this.contract.setGameShop(gameId, shopAddress);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to set game shop for game ID ${gameId}: ${error.message || error}`);
    }
  }

  /**
   * Get game leaderboard address
   * @param gameId ID of the game
   * @returns Address of the leaderboard contract
   */
  async getGameLeaderboard(gameId: number): Promise<string> {
    if (gameId <= 0) {
      throw new Error('Game ID must be a positive integer');
    }
    
    try {
      return await this.contract.getGameLeaderboard(gameId);
    } catch (error: any) {
      throw new Error(`Failed to get game leaderboard for game ID ${gameId}: ${error.message || error}`);
    }
  }

  /**
   * Get game shop address
   * @param gameId ID of the game
   * @returns Address of the shop contract
   */
  async getGameShop(gameId: number): Promise<string> {
    if (gameId <= 0) {
      throw new Error('Game ID must be a positive integer');
    }
    
    try {
      return await this.contract.getGameShop(gameId);
    } catch (error: any) {
      throw new Error(`Failed to get game shop for game ID ${gameId}: ${error.message || error}`);
    }
  }

  /**
   * Get all games created by a specific address
   * @param creator Address of the creator
   * @returns Array of game IDs
   */
  async getGamesByCreator(creator: string): Promise<number[]> {
    if (!ethers.utils.isAddress(creator)) {
      throw new Error('Invalid Ethereum address');
    }
    
    try {
      const gameIds = await this.contract.getGamesByCreator(creator);
      return gameIds.map((id: ethers.BigNumber) => id.toNumber());
    } catch (error: any) {
      throw new Error(`Failed to get games for creator ${creator}: ${error.message || error}`);
    }
  }

  /**
   * Get the total number of games
   * @returns Total game count
   */
  async getGameCount(): Promise<number> {
    try {
      const count = await this.contract.gameCount();
      return count.toNumber();
    } catch (error: any) {
      throw new Error(`Failed to get game count: ${error.message || error}`);
    }
  }

  /**
   * Activate a game
   * @param gameId ID of the game to activate
   * @returns Transaction receipt
   */
  async activateGame(gameId: number): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to activate game');
    }
    
    if (gameId <= 0) {
      throw new Error('Game ID must be a positive integer');
    }
    
    try {
      const tx = await this.contract.activateGame(gameId);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to activate game with ID ${gameId}: ${error.message || error}`);
    }
  }

  /**
   * Deactivate a game
   * @param gameId ID of the game to deactivate
   * @returns Transaction receipt
   */
  async deactivateGame(gameId: number): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to deactivate game');
    }
    
    if (gameId <= 0) {
      throw new Error('Game ID must be a positive integer');
    }
    
    try {
      const tx = await this.contract.deactivateGame(gameId);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to deactivate game with ID ${gameId}: ${error.message || error}`);
    }
  }

  /**
   * Join a game as a player
   * @param gameId ID of the game to join
   * @returns Transaction receipt
   */
  async joinGame(gameId: number): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to join game');
    }
    
    if (gameId <= 0) {
      throw new Error('Game ID must be a positive integer');
    }
    
    try {
      const tx = await this.contract.joinGame(gameId);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to join game with ID ${gameId}: ${error.message || error}`);
    }
  }

  /**
   * Leave a game as a player
   * @param gameId ID of the game to leave
   * @returns Transaction receipt
   */
  async leaveGame(gameId: number): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to leave game');
    }
    
    if (gameId <= 0) {
      throw new Error('Game ID must be a positive integer');
    }
    
    try {
      const tx = await this.contract.leaveGame(gameId);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to leave game with ID ${gameId}: ${error.message || error}`);
    }
  }

  /**
   * Get all players in a game
   * @param gameId ID of the game
   * @returns Array of player addresses
   */
  async getGamePlayers(gameId: number): Promise<string[]> {
    if (gameId <= 0) {
      throw new Error('Game ID must be a positive integer');
    }
    
    try {
      const players = await this.contract.getGamePlayers(gameId);
      return players.map((player: string) => player);
    } catch (error: any) {
      throw new Error(`Failed to get players for game with ID ${gameId}: ${error.message || error}`);
    }
  }

  /**
   * Check if a player is in a game
   * @param gameId ID of the game
   * @param playerAddress Address of the player
   * @returns True if player is in game, false otherwise
   */
  async isPlayerInGame(gameId: number, playerAddress: string): Promise<boolean> {
    if (gameId <= 0) {
      throw new Error('Game ID must be a positive integer');
    }
    
    if (!ethers.utils.isAddress(playerAddress)) {
      throw new Error('Invalid Ethereum address');
    }
    
    try {
      return await this.contract.isPlayerInGame(gameId, playerAddress);
    } catch (error: any) {
      throw new Error(`Failed to check if player is in game with ID ${gameId}: ${error.message || error}`);
    }
  }

  /**
   * Get active games with pagination
   * @param offset Starting index
   * @param limit Number of games to return
   * @returns Array of active game IDs
   */
  async getActiveGames(offset: number = 0, limit: number = 10): Promise<number[]> {
    if (offset < 0) {
      throw new Error('Offset must be a non-negative integer');
    }
    
    if (limit <= 0 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
    
    try {
      const gameIds = await this.contract.getActiveGames(offset, limit);
      return gameIds.map((id: ethers.BigNumber) => id.toNumber());
    } catch (error: any) {
      throw new Error(`Failed to get active games: ${error.message || error}`);
    }
  }

  /**
   * Get total active games count
   * @returns Number of active games
   */
  async getActiveGamesCount(): Promise<number> {
    try {
      const count = await this.contract.getActiveGamesCount();
      return count.toNumber();
    } catch (error: any) {
      throw new Error(`Failed to get active games count: ${error.message || error}`);
    }
  }

  /**
   * Connect to WebSocket for real-time updates
   */
  async connectWebSocket(): Promise<void> {
    if (!this.gameStateManager) {
      throw new Error('WebSocket URL not provided in constructor');
    }
    await this.gameStateManager.connect();
  }

  /**
   * Subscribe to real-time game updates
   */
  subscribeToGameUpdates(gameId: number, callback: (gameState: any) => void): void {
    if (!this.gameStateManager) {
      throw new Error('WebSocket not initialized');
    }
    
    this.gameStateManager.subscribeToGame(gameId.toString());
    this.gameStateManager.on('gameStateUpdate', (id: string, state: any) => {
      if (id === gameId.toString()) {
        callback(state);
      }
    });
  }

  /**
   * Send player action via WebSocket
   */
  async sendPlayerAction(gameId: number, action: any): Promise<void> {
    if (!this.gameStateManager) {
      throw new Error('WebSocket not initialized');
    }

    const playerId = this.signer ? await this.signer.getAddress() : '';

    this.gameStateManager.sendPlayerAction({
      type: action.type,
      playerId,
      gameId: gameId.toString(),
      data: action.data,
      timestamp: Date.now()
    });
  }

  /**
   * Get current game state from WebSocket
   */
  getRealtimeGameState(gameId: number): any {
    if (!this.gameStateManager) {
      return null;
    }
    return this.gameStateManager.getGameState(gameId.toString());
  }
}