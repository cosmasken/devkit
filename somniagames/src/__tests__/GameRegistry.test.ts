// src/__tests__/GameRegistry.test.ts
import { GameRegistry } from '../GameRegistry';
import { ethers } from 'ethers';

// Mock contract methods
const mockContract = {
  games: jest.fn(),
  getGamesByCreator: jest.fn(),
  gameCount: jest.fn(),
  createGame: jest.fn(),
  updateGame: jest.fn(),
  updateGameMetadata: jest.fn(),
  updateGameVersion: jest.fn(),
  activateGame: jest.fn(),
  deactivateGame: jest.fn(),
  joinGame: jest.fn(),
  leaveGame: jest.fn(),
  getGamePlayers: jest.fn(),
  isPlayerInGame: jest.fn(),
  getActiveGames: jest.fn(),
  getActiveGamesCount: jest.fn(),
  connect: jest.fn().mockReturnThis()
};

// Mock ethers.Contract constructor
jest.mock('ethers', () => {
  const originalEthers = jest.requireActual('ethers');
  return {
    ...originalEthers,
    ethers: {
      ...originalEthers.ethers,
      Contract: jest.fn().mockImplementation(() => mockContract),
      utils: {
        ...originalEthers.ethers.utils,
        isAddress: jest.fn().mockImplementation((address) => {
          return typeof address === 'string' && address.startsWith('0x') && address.length === 42;
        })
      }
    }
  };
});

describe('GameRegistry', () => {
  let gameRegistry: GameRegistry;
  let mockProvider: any;
  let mockSigner: any;

  beforeEach(() => {
    mockProvider = {};
    mockSigner = {
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
    };
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a new instance of GameRegistry for each test
    gameRegistry = new GameRegistry(
      '0x1234567890123456789012345678901234567890',
      mockProvider,
      mockSigner
    );
  });

  describe('constructor', () => {
    it('should create an instance with provider only', () => {
      const registry = new GameRegistry(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      expect(registry).toBeInstanceOf(GameRegistry);
      expect(mockSigner.getAddress).not.toHaveBeenCalled();
    });

    it('should create an instance with provider and signer', () => {
      const registry = new GameRegistry(
        '0x1234567890123456789012345678901234567890',
        mockProvider,
        mockSigner
      );
      
      expect(registry).toBeInstanceOf(GameRegistry);
    });
  });

  describe('getGame', () => {
    it('should throw error for invalid game ID', async () => {
      await expect(gameRegistry.getGame(0)).rejects.toThrow('Game ID must be a positive integer');
      await expect(gameRegistry.getGame(-1)).rejects.toThrow('Game ID must be a positive integer');
    });

    it('should return extended game metadata for valid game ID', async () => {
      const mockGame = {
        id: ethers.BigNumber.from(1),
        name: 'Test Game',
        description: 'A test game',
        metadataURI: 'https://example.com/metadata.json',
        creator: '0x1234567890123456789012345678901234567890',
        createdAt: ethers.BigNumber.from(1234567890),
        updatedAt: ethers.BigNumber.from(1234567900),
        isActive: true,
        playerCount: ethers.BigNumber.from(5),
        version: ethers.BigNumber.from(2)
      };
      
      mockContract.games.mockResolvedValue(mockGame);
      
      const game = await gameRegistry.getGame(1);
      
      expect(game).toEqual({
        id: 1,
        name: 'Test Game',
        description: 'A test game',
        metadataURI: 'https://example.com/metadata.json',
        creator: '0x1234567890123456789012345678901234567890',
        createdAt: 1234567890,
        updatedAt: 1234567900,
        isActive: true,
        playerCount: 5,
        version: 2
      });
    });

    it('should handle contract errors', async () => {
      mockContract.games.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameRegistry.getGame(1)).rejects.toThrow('Failed to get game with ID 1: Contract error');
    });
  });

  describe('getGamesByCreator', () => {
    it('should throw error for invalid address', async () => {
      await expect(gameRegistry.getGamesByCreator('invalid-address')).rejects.toThrow('Invalid Ethereum address');
    });

    it('should return game IDs for valid address', async () => {
      mockContract.getGamesByCreator.mockResolvedValue([
        ethers.BigNumber.from(1),
        ethers.BigNumber.from(2),
        ethers.BigNumber.from(3)
      ]);
      
      const gameIds = await gameRegistry.getGamesByCreator('0x1234567890123456789012345678901234567890');
      
      expect(gameIds).toEqual([1, 2, 3]);
    });

    it('should handle contract errors', async () => {
      mockContract.getGamesByCreator.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameRegistry.getGamesByCreator('0x1234567890123456789012345678901234567890'))
        .rejects.toThrow('Failed to get games for creator 0x1234567890123456789012345678901234567890: Contract error');
    });
  });

  describe('getGameCount', () => {
    it('should return game count', async () => {
      mockContract.gameCount.mockResolvedValue(ethers.BigNumber.from(42));
      
      const count = await gameRegistry.getGameCount();
      
      expect(count).toBe(42);
    });

    it('should handle contract errors', async () => {
      mockContract.gameCount.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameRegistry.getGameCount()).rejects.toThrow('Failed to get game count: Contract error');
    });
  });

  describe('createGame', () => {
    it('should throw error when no signer is provided', async () => {
      const registryWithoutSigner = new GameRegistry(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(registryWithoutSigner.createGame('Test Game', 'A test game'))
        .rejects.toThrow('Signer required to create game');
    });

    it('should create a game successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xabc123' })
      };
      
      mockContract.createGame.mockResolvedValue(mockTx);
      
      const result = await gameRegistry.createGame('Test Game', 'A test game', 'https://example.com/metadata.json');
      
      expect(result).toEqual({ transactionHash: '0xabc123' });
      expect(mockContract.createGame).toHaveBeenCalledWith('Test Game', 'A test game', 'https://example.com/metadata.json');
    });
  });

  describe('updateGame', () => {
    it('should throw error when no signer is provided', async () => {
      const registryWithoutSigner = new GameRegistry(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(registryWithoutSigner.updateGame(1, 'Updated Game', 'Updated description'))
        .rejects.toThrow('Signer required to update game');
    });

    it('should throw error for invalid game ID', async () => {
      await expect(gameRegistry.updateGame(0, 'Updated Game', 'Updated description'))
        .rejects.toThrow('Game ID must be a positive integer');
    });

    it('should update a game successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xdef456' })
      };
      
      mockContract.updateGame.mockResolvedValue(mockTx);
      
      const result = await gameRegistry.updateGame(1, 'Updated Game', 'Updated description');
      
      expect(result).toEqual({ transactionHash: '0xdef456' });
      expect(mockContract.updateGame).toHaveBeenCalledWith(1, 'Updated Game', 'Updated description');
    });

    it('should handle contract errors', async () => {
      mockContract.updateGame.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameRegistry.updateGame(1, 'Updated Game', 'Updated description'))
        .rejects.toThrow('Failed to update game with ID 1: Contract error');
    });
  });

  describe('updateGameMetadata', () => {
    it('should throw error when no signer is provided', async () => {
      const registryWithoutSigner = new GameRegistry(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(registryWithoutSigner.updateGameMetadata(1, 'https://example.com/new-metadata.json'))
        .rejects.toThrow('Signer required to update game metadata');
    });

    it('should throw error for invalid game ID', async () => {
      await expect(gameRegistry.updateGameMetadata(0, 'https://example.com/new-metadata.json'))
        .rejects.toThrow('Game ID must be a positive integer');
    });

    it('should update game metadata successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xghi789' })
      };
      
      mockContract.updateGameMetadata.mockResolvedValue(mockTx);
      
      const result = await gameRegistry.updateGameMetadata(1, 'https://example.com/new-metadata.json');
      
      expect(result).toEqual({ transactionHash: '0xghi789' });
      expect(mockContract.updateGameMetadata).toHaveBeenCalledWith(1, 'https://example.com/new-metadata.json');
    });

    it('should handle contract errors', async () => {
      mockContract.updateGameMetadata.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameRegistry.updateGameMetadata(1, 'https://example.com/new-metadata.json'))
        .rejects.toThrow('Failed to update game metadata with ID 1: Contract error');
    });
  });

  describe('updateGameVersion', () => {
    it('should throw error when no signer is provided', async () => {
      const registryWithoutSigner = new GameRegistry(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(registryWithoutSigner.updateGameVersion(1, 2))
        .rejects.toThrow('Signer required to update game version');
    });

    it('should throw error for invalid game ID', async () => {
      await expect(gameRegistry.updateGameVersion(0, 2))
        .rejects.toThrow('Game ID must be a positive integer');
    });

    it('should throw error for invalid version', async () => {
      await expect(gameRegistry.updateGameVersion(1, 0))
        .rejects.toThrow('Version must be a positive integer');
    });

    it('should update game version successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xjkl012' })
      };
      
      mockContract.updateGameVersion.mockResolvedValue(mockTx);
      
      const result = await gameRegistry.updateGameVersion(1, 3);
      
      expect(result).toEqual({ transactionHash: '0xjkl012' });
      expect(mockContract.updateGameVersion).toHaveBeenCalledWith(1, 3);
    });

    it('should handle contract errors', async () => {
      mockContract.updateGameVersion.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameRegistry.updateGameVersion(1, 3))
        .rejects.toThrow('Failed to update game version with ID 1: Contract error');
    });
  });

  describe('activateGame', () => {
    it('should throw error when no signer is provided', async () => {
      const registryWithoutSigner = new GameRegistry(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(registryWithoutSigner.activateGame(1))
        .rejects.toThrow('Signer required to activate game');
    });

    it('should throw error for invalid game ID', async () => {
      await expect(gameRegistry.activateGame(0)).rejects.toThrow('Game ID must be a positive integer');
      await expect(gameRegistry.activateGame(-1)).rejects.toThrow('Game ID must be a positive integer');
    });

    it('should activate a game successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xdef456' })
      };
      
      mockContract.activateGame.mockResolvedValue(mockTx);
      
      const result = await gameRegistry.activateGame(1);
      
      expect(result).toEqual({ transactionHash: '0xdef456' });
      expect(mockContract.activateGame).toHaveBeenCalledWith(1);
    });

    it('should handle contract errors', async () => {
      mockContract.activateGame.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameRegistry.activateGame(1)).rejects.toThrow('Failed to activate game with ID 1: Contract error');
    });
  });

  describe('deactivateGame', () => {
    it('should throw error when no signer is provided', async () => {
      const registryWithoutSigner = new GameRegistry(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(registryWithoutSigner.deactivateGame(1))
        .rejects.toThrow('Signer required to deactivate game');
    });

    it('should throw error for invalid game ID', async () => {
      await expect(gameRegistry.deactivateGame(0)).rejects.toThrow('Game ID must be a positive integer');
      await expect(gameRegistry.deactivateGame(-1)).rejects.toThrow('Game ID must be a positive integer');
    });

    it('should deactivate a game successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xghi789' })
      };
      
      mockContract.deactivateGame.mockResolvedValue(mockTx);
      
      const result = await gameRegistry.deactivateGame(1);
      
      expect(result).toEqual({ transactionHash: '0xghi789' });
      expect(mockContract.deactivateGame).toHaveBeenCalledWith(1);
    });

    it('should handle contract errors', async () => {
      mockContract.deactivateGame.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameRegistry.deactivateGame(1)).rejects.toThrow('Failed to deactivate game with ID 1: Contract error');
    });
  });

  describe('joinGame', () => {
    it('should throw error when no signer is provided', async () => {
      const registryWithoutSigner = new GameRegistry(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(registryWithoutSigner.joinGame(1))
        .rejects.toThrow('Signer required to join game');
    });

    it('should throw error for invalid game ID', async () => {
      await expect(gameRegistry.joinGame(0)).rejects.toThrow('Game ID must be a positive integer');
    });

    it('should join a game successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xmno345' })
      };
      
      mockContract.joinGame.mockResolvedValue(mockTx);
      
      const result = await gameRegistry.joinGame(1);
      
      expect(result).toEqual({ transactionHash: '0xmno345' });
      expect(mockContract.joinGame).toHaveBeenCalledWith(1);
    });

    it('should handle contract errors', async () => {
      mockContract.joinGame.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameRegistry.joinGame(1)).rejects.toThrow('Failed to join game with ID 1: Contract error');
    });
  });

  describe('leaveGame', () => {
    it('should throw error when no signer is provided', async () => {
      const registryWithoutSigner = new GameRegistry(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(registryWithoutSigner.leaveGame(1))
        .rejects.toThrow('Signer required to leave game');
    });

    it('should throw error for invalid game ID', async () => {
      await expect(gameRegistry.leaveGame(0)).rejects.toThrow('Game ID must be a positive integer');
    });

    it('should leave a game successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xpqr678' })
      };
      
      mockContract.leaveGame.mockResolvedValue(mockTx);
      
      const result = await gameRegistry.leaveGame(1);
      
      expect(result).toEqual({ transactionHash: '0xpqr678' });
      expect(mockContract.leaveGame).toHaveBeenCalledWith(1);
    });

    it('should handle contract errors', async () => {
      mockContract.leaveGame.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameRegistry.leaveGame(1)).rejects.toThrow('Failed to leave game with ID 1: Contract error');
    });
  });

  describe('getGamePlayers', () => {
    it('should throw error for invalid game ID', async () => {
      await expect(gameRegistry.getGamePlayers(0)).rejects.toThrow('Game ID must be a positive integer');
    });

    it('should return players for valid game ID', async () => {
      const mockPlayers = [
        '0x1234567890123456789012345678901234567890',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
      ];
      
      mockContract.getGamePlayers.mockResolvedValue(mockPlayers);
      
      const players = await gameRegistry.getGamePlayers(1);
      
      expect(players).toEqual(mockPlayers);
    });

    it('should handle contract errors', async () => {
      mockContract.getGamePlayers.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameRegistry.getGamePlayers(1))
        .rejects.toThrow('Failed to get players for game with ID 1: Contract error');
    });
  });

  describe('isPlayerInGame', () => {
    it('should throw error for invalid game ID', async () => {
      await expect(gameRegistry.isPlayerInGame(0, '0x1234567890123456789012345678901234567890'))
        .rejects.toThrow('Game ID must be a positive integer');
    });

    it('should throw error for invalid address', async () => {
      await expect(gameRegistry.isPlayerInGame(1, 'invalid-address'))
        .rejects.toThrow('Invalid Ethereum address');
    });

    it('should return player status', async () => {
      mockContract.isPlayerInGame.mockResolvedValue(true);
      
      const isPlayer = await gameRegistry.isPlayerInGame(1, '0x1234567890123456789012345678901234567890');
      
      expect(isPlayer).toBe(true);
    });

    it('should handle contract errors', async () => {
      mockContract.isPlayerInGame.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameRegistry.isPlayerInGame(1, '0x1234567890123456789012345678901234567890'))
        .rejects.toThrow('Failed to check if player is in game with ID 1: Contract error');
    });
  });

  describe('getActiveGames', () => {
    it('should throw error for invalid offset', async () => {
      await expect(gameRegistry.getActiveGames(-1, 10))
        .rejects.toThrow('Offset must be a non-negative integer');
    });

    it('should throw error for invalid limit', async () => {
      await expect(gameRegistry.getActiveGames(0, 0))
        .rejects.toThrow('Limit must be between 1 and 100');
      await expect(gameRegistry.getActiveGames(0, 101))
        .rejects.toThrow('Limit must be between 1 and 100');
    });

    it('should return active games', async () => {
      mockContract.getActiveGames.mockResolvedValue([
        ethers.BigNumber.from(1),
        ethers.BigNumber.from(3),
        ethers.BigNumber.from(5)
      ]);
      
      const games = await gameRegistry.getActiveGames(0, 10);
      
      expect(games).toEqual([1, 3, 5]);
    });

    it('should handle contract errors', async () => {
      mockContract.getActiveGames.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameRegistry.getActiveGames(0, 10))
        .rejects.toThrow('Failed to get active games: Contract error');
    });
  });

  describe('getActiveGamesCount', () => {
    it('should return active games count', async () => {
      mockContract.getActiveGamesCount.mockResolvedValue(ethers.BigNumber.from(25));
      
      const count = await gameRegistry.getActiveGamesCount();
      
      expect(count).toBe(25);
    });

    it('should handle contract errors', async () => {
      mockContract.getActiveGamesCount.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameRegistry.getActiveGamesCount())
        .rejects.toThrow('Failed to get active games count: Contract error');
    });
  });
});