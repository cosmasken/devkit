// src/GameLeaderboard.ts
import { ethers } from 'ethers';

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

export class GameLeaderboard {
  private contract: ethers.Contract;
  private provider: ethers.providers.Provider;
  private signer: ethers.Signer | null = null;

  constructor(
    contractAddress: string, 
    provider: ethers.providers.Provider, 
    signer?: ethers.Signer
  ) {
    // ABI for GameLeaderboard contract
    const abi = [
      // Leaderboard management
      "function createLeaderboard(string name, string description, uint256 gameId) public",
      "function updateLeaderboard(uint256 leaderboardId, string name, string description) public",
      "function activateLeaderboard(uint256 leaderboardId) public",
      "function deactivateLeaderboard(uint256 leaderboardId) public",
      "function leaderboards(uint256 leaderboardId) view returns (string name, string description, uint256 gameId, bool active, uint256 createdAt, uint256 updatedAt)",
      
      // Score submission
      "function submitScore(uint256 leaderboardId, uint256 score) public",
      
      // Queries
      "function getLeaderboard(uint256 leaderboardId) view returns (string name, string description, uint256 gameId, bool active, uint256 createdAt, uint256 updatedAt)",
      "function getTopScores(uint256 leaderboardId, uint256 count) view returns (tuple(address player, uint256 score, uint256 timestamp)[])",
      "function getPlayerRank(uint256 leaderboardId, address player) view returns (uint256)",
      "function getPlayerScore(uint256 leaderboardId, address player) view returns (uint256)",
      "function getLeaderboardCount() view returns (uint256)",
      "function getLeaderboardsByGame(uint256 gameId) view returns (uint256[])",
      
      // Events
      "event LeaderboardCreated(uint256 indexed leaderboardId, string name, uint256 gameId)",
      "event ScoreSubmitted(uint256 indexed leaderboardId, address player, uint256 score)",
      "event LeaderboardUpdated(uint256 indexed leaderboardId, string name, string description)",
      "event LeaderboardActivated(uint256 indexed leaderboardId)",
      "event LeaderboardDeactivated(uint256 indexed leaderboardId)"
    ];
    
    this.provider = provider;
    this.contract = new ethers.Contract(contractAddress, abi, provider);
    
    if (signer) {
      this.signer = signer;
      this.contract = this.contract.connect(signer);
    }
  }

  /**
   * Create a new leaderboard
   * @param name Name of the leaderboard
   * @param description Description of the leaderboard
   * @param gameId ID of the game this leaderboard belongs to
   * @returns Transaction receipt
   */
  async createLeaderboard(name: string, description: string, gameId: number): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to create leaderboard');
    }
    
    if (gameId <= 0) {
      throw new Error('Game ID must be a positive integer');
    }
    
    try {
      const tx = await this.contract.createLeaderboard(name, description, gameId);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to create leaderboard: ${error.message || error}`);
    }
  }

  /**
   * Update leaderboard information
   * @param leaderboardId ID of the leaderboard to update
   * @param name New name of the leaderboard
   * @param description New description of the leaderboard
   * @returns Transaction receipt
   */
  async updateLeaderboard(leaderboardId: number, name: string, description: string): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to update leaderboard');
    }
    
    if (leaderboardId <= 0) {
      throw new Error('Leaderboard ID must be a positive integer');
    }
    
    try {
      const tx = await this.contract.updateLeaderboard(leaderboardId, name, description);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to update leaderboard: ${error.message || error}`);
    }
  }

  /**
   * Activate a leaderboard
   * @param leaderboardId ID of the leaderboard to activate
   * @returns Transaction receipt
   */
  async activateLeaderboard(leaderboardId: number): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to activate leaderboard');
    }
    
    if (leaderboardId <= 0) {
      throw new Error('Leaderboard ID must be a positive integer');
    }
    
    try {
      const tx = await this.contract.activateLeaderboard(leaderboardId);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to activate leaderboard: ${error.message || error}`);
    }
  }

  /**
   * Deactivate a leaderboard
   * @param leaderboardId ID of the leaderboard to deactivate
   * @returns Transaction receipt
   */
  async deactivateLeaderboard(leaderboardId: number): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to deactivate leaderboard');
    }
    
    if (leaderboardId <= 0) {
      throw new Error('Leaderboard ID must be a positive integer');
    }
    
    try {
      const tx = await this.contract.deactivateLeaderboard(leaderboardId);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to deactivate leaderboard: ${error.message || error}`);
    }
  }

  /**
   * Submit a score to a leaderboard
   * @param leaderboardId ID of the leaderboard
   * @param score Score to submit
   * @returns Transaction receipt
   */
  async submitScore(leaderboardId: number, score: number): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to submit score');
    }
    
    if (leaderboardId <= 0) {
      throw new Error('Leaderboard ID must be a positive integer');
    }
    
    if (score < 0) {
      throw new Error('Score must be non-negative');
    }
    
    try {
      const tx = await this.contract.submitScore(leaderboardId, score);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to submit score: ${error.message || error}`);
    }
  }

  /**
   * Get leaderboard information
   * @param leaderboardId ID of the leaderboard
   * @returns Leaderboard information
   */
  async getLeaderboard(leaderboardId: number): Promise<LeaderboardInfo> {
    if (leaderboardId <= 0) {
      throw new Error('Leaderboard ID must be a positive integer');
    }
    
    try {
      const leaderboard = await this.contract.getLeaderboard(leaderboardId);
      
      return {
        id: leaderboardId,
        name: leaderboard.name,
        description: leaderboard.description,
        gameId: leaderboard.gameId.toNumber(),
        active: leaderboard.active,
        createdAt: leaderboard.createdAt.toNumber(),
        updatedAt: leaderboard.updatedAt.toNumber()
      };
    } catch (error: any) {
      throw new Error(`Failed to get leaderboard: ${error.message || error}`);
    }
  }

  /**
   * Get top scores from a leaderboard
   * @param leaderboardId ID of the leaderboard
   * @param count Number of top scores to return (max 100)
   * @returns Array of top player scores
   */
  async getTopScores(leaderboardId: number, count: number = 10): Promise<PlayerScore[]> {
    if (leaderboardId <= 0) {
      throw new Error('Leaderboard ID must be a positive integer');
    }
    
    if (count <= 0 || count > 100) {
      throw new Error('Count must be between 1 and 100');
    }
    
    try {
      const scores = await this.contract.getTopScores(leaderboardId, count);
      
      return scores.map((score: any) => ({
        player: score.player,
        score: score.score.toNumber(),
        timestamp: score.timestamp.toNumber()
      }));
    } catch (error: any) {
      throw new Error(`Failed to get top scores: ${error.message || error}`);
    }
  }

  /**
   * Get player rank in a leaderboard
   * @param leaderboardId ID of the leaderboard
   * @param player Address of the player
   * @returns Player's rank (0 if not found)
   */
  async getPlayerRank(leaderboardId: number, player: string): Promise<number> {
    if (leaderboardId <= 0) {
      throw new Error('Leaderboard ID must be a positive integer');
    }
    
    if (!ethers.utils.isAddress(player)) {
      throw new Error('Invalid player address');
    }
    
    try {
      const rank = await this.contract.getPlayerRank(leaderboardId, player);
      return rank.toNumber();
    } catch (error: any) {
      throw new Error(`Failed to get player rank: ${error.message || error}`);
    }
  }

  /**
   * Get player score in a leaderboard
   * @param leaderboardId ID of the leaderboard
   * @param player Address of the player
   * @returns Player's score
   */
  async getPlayerScore(leaderboardId: number, player: string): Promise<number> {
    if (leaderboardId <= 0) {
      throw new Error('Leaderboard ID must be a positive integer');
    }
    
    if (!ethers.utils.isAddress(player)) {
      throw new Error('Invalid player address');
    }
    
    try {
      const score = await this.contract.getPlayerScore(leaderboardId, player);
      return score.toNumber();
    } catch (error: any) {
      throw new Error(`Failed to get player score: ${error.message || error}`);
    }
  }

  /**
   * Get total number of leaderboards
   * @returns Total leaderboard count
   */
  async getLeaderboardCount(): Promise<number> {
    try {
      const count = await this.contract.getLeaderboardCount();
      return count.toNumber();
    } catch (error: any) {
      throw new Error(`Failed to get leaderboard count: ${error.message || error}`);
    }
  }

  /**
   * Get leaderboards for a specific game
   * @param gameId ID of the game
   * @returns Array of leaderboard IDs
   */
  async getLeaderboardsByGame(gameId: number): Promise<number[]> {
    if (gameId <= 0) {
      throw new Error('Game ID must be a positive integer');
    }
    
    try {
      const leaderboardIds = await this.contract.getLeaderboardsByGame(gameId);
      return leaderboardIds.map((id: ethers.BigNumber) => id.toNumber());
    } catch (error: any) {
      throw new Error(`Failed to get leaderboards by game: ${error.message || error}`);
    }
  }
}