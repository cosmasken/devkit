// src/template-integration.ts
import { GameRegistry, GameAsset, GameToken, GameLeaderboard, GameShop } from '@somniagames/sdk';

/**
 * Template Integration Service
 * This service handles the integration between game templates and the SomniaGames SDK
 */

export interface GameTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  players: number;
  previewImage: string;
  features: string[];
  defaultSettings: Record<string, any>;
  assets: Array<{
    name: string;
    type: string;
    rarity: number;
  }>;
  economy: {
    entryFee: number;
    rewardPool: number;
    tokenName: string;
    tokenSymbol: string;
  };
}

/**
 * Tic Tac Toe Template Implementation
 */
export class TicTacToeTemplate {
  private gameRegistry: GameRegistry | null = null;
  private gameAsset: GameAsset | null = null;
  private gameToken: GameToken | null = null;
  private gameLeaderboard: GameLeaderboard | null = null;

  constructor(
    registry: GameRegistry,
    asset: GameAsset,
    token: GameToken,
    leaderboard: GameLeaderboard
  ) {
    this.gameRegistry = registry;
    this.gameAsset = asset;
    this.gameToken = token;
    this.gameLeaderboard = leaderboard;
  }

  /**
   * Initialize the Tic Tac Toe game with default settings
   */
  async initializeGame(
    signerAddress: string,
    gameName: string,
    gameDescription: string
  ) {
    if (!this.gameRegistry) {
      throw new Error('GameRegistry not initialized');
    }

    // Create the game
    const tx = await this.gameRegistry.createGame(
      gameName,
      gameDescription,
      'https://somniagames.com/templates/tictactoe/metadata.json'
    );

    // Extract game ID from transaction (in a real implementation)
    const gameId = 1; // This would be extracted from the transaction

    // Create game assets (X and O tokens, win badges)
    if (this.gameAsset) {
      await this.gameAsset.createAsset(
        signerAddress,
        'X Token',
        'Tic Tac Toe X Token',
        'https://somniagames.com/assets/tictactoe/x-token.json',
        gameId,
        1
      );

      await this.gameAsset.createAsset(
        signerAddress,
        'O Token',
        'Tic Tac Toe O Token',
        'https://somniagames.com/assets/tictactoe/o-token.json',
        gameId,
        1
      );

      await this.gameAsset.createAsset(
        signerAddress,
        'Win Badge',
        'Tic Tac Toe Win Badge',
        'https://somniagames.com/assets/tictactoe/win-badge.json',
        gameId,
        2
      );
    }

    // Create leaderboard for tracking wins
    if (this.gameLeaderboard) {
      await this.gameLeaderboard.createLeaderboard(
        'Tic Tac Toe Wins',
        'Leaderboard for Tic Tac Toe victories',
        gameId
      );
    }

    return { gameId, transaction: tx };
  }

  /**
   * Record a win for a player
   */
  async recordWin(
    gameId: number,
    winnerAddress: string,
    moves: number
  ) {
    // Award NFT win badge
    if (this.gameAsset) {
      // In a real implementation, we would mint a win badge NFT
      console.log(`Awarded win badge to ${winnerAddress}`);
    }

    // Update leaderboard
    if (this.gameLeaderboard) {
      // Score based on number of moves (fewer moves = higher score)
      const score = Math.max(100 - (moves * 5), 10);
      await this.gameLeaderboard.submitScore(1, score);
    }

    // Award tokens
    if (this.gameToken) {
      // Award 10 tokens for winning
      await this.gameToken.mint(winnerAddress, 10);
    }
  }

  /**
   * Get game state (in a real implementation, this would read from the blockchain)
   */
  getGameState() {
    // This is a simplified representation
    // In a real game, this would read the actual game state from the blockchain
    return {
      board: [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ],
      currentPlayer: 'X',
      gameOver: false,
      winner: null
    };
  }
}

/**
 * 2048 Game Template Implementation
 */
export class Crypto2048Template {
  private gameRegistry: GameRegistry | null = null;
  private gameAsset: GameAsset | null = null;
  private gameToken: GameToken | null = null;
  private gameLeaderboard: GameLeaderboard | null = null;

  constructor(
    registry: GameRegistry,
    asset: GameAsset,
    token: GameToken,
    leaderboard: GameLeaderboard
  ) {
    this.gameRegistry = registry;
    this.gameAsset = asset;
    this.gameToken = token;
    this.gameLeaderboard = leaderboard;
  }

  /**
   * Initialize the 2048 game with default settings
   */
  async initializeGame(
    signerAddress: string,
    gameName: string,
    gameDescription: string
  ) {
    if (!this.gameRegistry) {
      throw new Error('GameRegistry not initialized');
    }

    // Create the game
    const tx = await this.gameRegistry.createGame(
      gameName,
      gameDescription,
      'https://somniagames.com/templates/2048/metadata.json'
    );

    // Extract game ID from transaction (in a real implementation)
    const gameId = 1; // This would be extracted from the transaction

    // Create game assets (tiles as NFTs)
    if (this.gameAsset) {
      await this.gameAsset.createAsset(
        signerAddress,
        '2 Tile',
        '2048 Game Tile - 2',
        'https://somniagames.com/assets/2048/tile-2.json',
        gameId,
        1
      );

      await this.gameAsset.createAsset(
        signerAddress,
        '4 Tile',
        '2048 Game Tile - 4',
        'https://somniagames.com/assets/2048/tile-4.json',
        gameId,
        1
      );

      await this.gameAsset.createAsset(
        signerAddress,
        '2048 Tile',
        '2048 Game Tile - 2048',
        'https://somniagames.com/assets/2048/tile-2048.json',
        gameId,
        3
      );

      await this.gameAsset.createAsset(
        signerAddress,
        'High Score Badge',
        '2048 High Score Achievement',
        'https://somniagames.com/assets/2048/high-score-badge.json',
        gameId,
        4
      );
    }

    // Create leaderboard for high scores
    if (this.gameLeaderboard) {
      await this.gameLeaderboard.createLeaderboard(
        '2048 High Scores',
        'Leaderboard for 2048 high scores',
        gameId
      );
    }

    return { gameId, transaction: tx };
  }

  /**
   * Record a high score
   */
  async recordHighScore(
    gameId: number,
    playerAddress: string,
    score: number
  ) {
    // Award high score badge for scores over 1000
    if (score > 1000 && this.gameAsset) {
      // In a real implementation, we would mint a high score badge NFT
      console.log(`Awarded high score badge to ${playerAddress}`);
    }

    // Update leaderboard
    if (this.gameLeaderboard) {
      await this.gameLeaderboard.submitScore(1, score);
    }

    // Award tokens based on score
    if (this.gameToken) {
      const tokens = Math.floor(score / 100);
      if (tokens > 0) {
        await this.gameToken.mint(playerAddress, tokens);
      }
    }
  }

  /**
   * Get game state (in a real implementation, this would read from the blockchain)
   */
  getGameState() {
    // This is a simplified representation
    // In a real game, this would read the actual game state from the blockchain
    return {
      board: [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      score: 0,
      gameOver: false,
      won: false
    };
  }
}

/**
 * Template Factory - creates template instances based on template ID
 */
export class TemplateFactory {
  static createTemplate(
    templateId: string,
    registry: GameRegistry,
    asset: GameAsset,
    token: GameToken,
    leaderboard: GameLeaderboard,
    shop: GameShop
  ) {
    switch (templateId) {
      case 'tictactoe':
        return new TicTacToeTemplate(registry, asset, token, leaderboard);
      case '2048game':
        return new Crypto2048Template(registry, asset, token, leaderboard);
      default:
        throw new Error(`Unknown template ID: ${templateId}`);
    }
  }
}