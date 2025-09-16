// src/__tests__/GameLeaderboard.test.ts
import { GameLeaderboard } from '../GameLeaderboard';
import { ethers } from 'ethers';

// Mock contract methods
const mockContract = {
  createLeaderboard: jest.fn(),
  updateLeaderboard: jest.fn(),
  activateLeaderboard: jest.fn(),
  deactivateLeaderboard: jest.fn(),
  leaderboards: jest.fn(),
  submitScore: jest.fn(),
  getLeaderboard: jest.fn(),
  getTopScores: jest.fn(),
  getPlayerRank: jest.fn(),
  getPlayerScore: jest.fn(),
  getLeaderboardCount: jest.fn(),
  getLeaderboardsByGame: jest.fn(),
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

describe('GameLeaderboard', () => {
  let gameLeaderboard: GameLeaderboard;
  let mockProvider: any;
  let mockSigner: any;

  beforeEach(() => {
    mockProvider = {};
    mockSigner = {
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
    };
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a new instance of GameLeaderboard for each test
    gameLeaderboard = new GameLeaderboard(
      '0x1234567890123456789012345678901234567890',
      mockProvider,
      mockSigner
    );
  });

  describe('constructor', () => {
    it('should create an instance with provider only', () => {
      const leaderboard = new GameLeaderboard(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      expect(leaderboard).toBeInstanceOf(GameLeaderboard);
      expect(mockSigner.getAddress).not.toHaveBeenCalled();
    });

    it('should create an instance with provider and signer', () => {
      const leaderboard = new GameLeaderboard(
        '0x1234567890123456789012345678901234567890',
        mockProvider,
        mockSigner
      );
      
      expect(leaderboard).toBeInstanceOf(GameLeaderboard);
    });
  });

  describe('createLeaderboard', () => {
    it('should throw error when no signer is provided', async () => {
      const leaderboardWithoutSigner = new GameLeaderboard(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(leaderboardWithoutSigner.createLeaderboard('Test Leaderboard', 'A test leaderboard', 1))
        .rejects.toThrow('Signer required to create leaderboard');
    });

    it('should throw error for invalid game ID', async () => {
      await expect(gameLeaderboard.createLeaderboard('Test Leaderboard', 'A test leaderboard', 0))
        .rejects.toThrow('Game ID must be a positive integer');
    });

    it('should create a leaderboard successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xabc123' })
      };
      
      mockContract.createLeaderboard.mockResolvedValue(mockTx);
      
      const result = await gameLeaderboard.createLeaderboard('Test Leaderboard', 'A test leaderboard', 1);
      
      expect(result).toEqual({ transactionHash: '0xabc123' });
      expect(mockContract.createLeaderboard).toHaveBeenCalledWith('Test Leaderboard', 'A test leaderboard', 1);
    });

    it('should handle contract errors', async () => {
      mockContract.createLeaderboard.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameLeaderboard.createLeaderboard('Test Leaderboard', 'A test leaderboard', 1))
        .rejects.toThrow('Failed to create leaderboard: Contract error');
    });
  });

  describe('updateLeaderboard', () => {
    it('should throw error when no signer is provided', async () => {
      const leaderboardWithoutSigner = new GameLeaderboard(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(leaderboardWithoutSigner.updateLeaderboard(1, 'Updated Leaderboard', 'An updated leaderboard'))
        .rejects.toThrow('Signer required to update leaderboard');
    });

    it('should throw error for invalid leaderboard ID', async () => {
      await expect(gameLeaderboard.updateLeaderboard(0, 'Updated Leaderboard', 'An updated leaderboard'))
        .rejects.toThrow('Leaderboard ID must be a positive integer');
    });

    it('should update a leaderboard successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xdef456' })
      };
      
      mockContract.updateLeaderboard.mockResolvedValue(mockTx);
      
      const result = await gameLeaderboard.updateLeaderboard(1, 'Updated Leaderboard', 'An updated leaderboard');
      
      expect(result).toEqual({ transactionHash: '0xdef456' });
      expect(mockContract.updateLeaderboard).toHaveBeenCalledWith(1, 'Updated Leaderboard', 'An updated leaderboard');
    });

    it('should handle contract errors', async () => {
      mockContract.updateLeaderboard.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameLeaderboard.updateLeaderboard(1, 'Updated Leaderboard', 'An updated leaderboard'))
        .rejects.toThrow('Failed to update leaderboard: Contract error');
    });
  });

  describe('activateLeaderboard', () => {
    it('should throw error when no signer is provided', async () => {
      const leaderboardWithoutSigner = new GameLeaderboard(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(leaderboardWithoutSigner.activateLeaderboard(1))
        .rejects.toThrow('Signer required to activate leaderboard');
    });

    it('should throw error for invalid leaderboard ID', async () => {
      await expect(gameLeaderboard.activateLeaderboard(0))
        .rejects.toThrow('Leaderboard ID must be a positive integer');
    });

    it('should activate a leaderboard successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xghi789' })
      };
      
      mockContract.activateLeaderboard.mockResolvedValue(mockTx);
      
      const result = await gameLeaderboard.activateLeaderboard(1);
      
      expect(result).toEqual({ transactionHash: '0xghi789' });
      expect(mockContract.activateLeaderboard).toHaveBeenCalledWith(1);
    });

    it('should handle contract errors', async () => {
      mockContract.activateLeaderboard.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameLeaderboard.activateLeaderboard(1))
        .rejects.toThrow('Failed to activate leaderboard: Contract error');
    });
  });

  describe('deactivateLeaderboard', () => {
    it('should throw error when no signer is provided', async () => {
      const leaderboardWithoutSigner = new GameLeaderboard(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(leaderboardWithoutSigner.deactivateLeaderboard(1))
        .rejects.toThrow('Signer required to deactivate leaderboard');
    });

    it('should throw error for invalid leaderboard ID', async () => {
      await expect(gameLeaderboard.deactivateLeaderboard(0))
        .rejects.toThrow('Leaderboard ID must be a positive integer');
    });

    it('should deactivate a leaderboard successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xjkl012' })
      };
      
      mockContract.deactivateLeaderboard.mockResolvedValue(mockTx);
      
      const result = await gameLeaderboard.deactivateLeaderboard(1);
      
      expect(result).toEqual({ transactionHash: '0xjkl012' });
      expect(mockContract.deactivateLeaderboard).toHaveBeenCalledWith(1);
    });

    it('should handle contract errors', async () => {
      mockContract.deactivateLeaderboard.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameLeaderboard.deactivateLeaderboard(1))
        .rejects.toThrow('Failed to deactivate leaderboard: Contract error');
    });
  });

  describe('getLeaderboard', () => {
    it('should throw error for invalid leaderboard ID', async () => {
      await expect(gameLeaderboard.getLeaderboard(0))
        .rejects.toThrow('Leaderboard ID must be a positive integer');
    });

    it('should return leaderboard information for valid ID', async () => {
      const mockLeaderboard = {
        name: 'Test Leaderboard',
        description: 'A test leaderboard',
        gameId: ethers.BigNumber.from(1),
        active: true,
        createdAt: ethers.BigNumber.from(1234567890),
        updatedAt: ethers.BigNumber.from(1234567900)
      };
      
      mockContract.getLeaderboard.mockResolvedValue(mockLeaderboard);
      
      const leaderboard = await gameLeaderboard.getLeaderboard(1);
      
      expect(leaderboard).toEqual({
        id: 1,
        name: 'Test Leaderboard',
        description: 'A test leaderboard',
        gameId: 1,
        active: true,
        createdAt: 1234567890,
        updatedAt: 1234567900
      });
    });

    it('should handle contract errors', async () => {
      mockContract.getLeaderboard.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameLeaderboard.getLeaderboard(1))
        .rejects.toThrow('Failed to get leaderboard: Contract error');
    });
  });

  describe('submitScore', () => {
    it('should throw error when no signer is provided', async () => {
      const leaderboardWithoutSigner = new GameLeaderboard(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(leaderboardWithoutSigner.submitScore(1, 1000))
        .rejects.toThrow('Signer required to submit score');
    });

    it('should throw error for invalid leaderboard ID', async () => {
      await expect(gameLeaderboard.submitScore(0, 1000))
        .rejects.toThrow('Leaderboard ID must be a positive integer');
    });

    it('should throw error for negative score', async () => {
      await expect(gameLeaderboard.submitScore(1, -1))
        .rejects.toThrow('Score must be non-negative');
    });

    it('should submit a score successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xmno345' })
      };
      
      mockContract.submitScore.mockResolvedValue(mockTx);
      
      const result = await gameLeaderboard.submitScore(1, 1000);
      
      expect(result).toEqual({ transactionHash: '0xmno345' });
      expect(mockContract.submitScore).toHaveBeenCalledWith(1, 1000);
    });

    it('should handle contract errors', async () => {
      mockContract.submitScore.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameLeaderboard.submitScore(1, 1000))
        .rejects.toThrow('Failed to submit score: Contract error');
    });
  });

  describe('getTopScores', () => {
    it('should throw error for invalid leaderboard ID', async () => {
      await expect(gameLeaderboard.getTopScores(0, 10))
        .rejects.toThrow('Leaderboard ID must be a positive integer');
    });

    it('should throw error for invalid count', async () => {
      await expect(gameLeaderboard.getTopScores(1, 0))
        .rejects.toThrow('Count must be between 1 and 100');
      
      await expect(gameLeaderboard.getTopScores(1, 101))
        .rejects.toThrow('Count must be between 1 and 100');
    });

    it('should return top scores for valid parameters', async () => {
      const mockScores = [
        {
          player: '0x1234567890123456789012345678901234567890',
          score: ethers.BigNumber.from(1000),
          timestamp: ethers.BigNumber.from(1234567890)
        },
        {
          player: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          score: ethers.BigNumber.from(900),
          timestamp: ethers.BigNumber.from(1234567895)
        }
      ];
      
      mockContract.getTopScores.mockResolvedValue(mockScores);
      
      const scores = await gameLeaderboard.getTopScores(1, 10);
      
      expect(scores).toEqual([
        {
          player: '0x1234567890123456789012345678901234567890',
          score: 1000,
          timestamp: 1234567890
        },
        {
          player: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          score: 900,
          timestamp: 1234567895
        }
      ]);
    });

    it('should handle contract errors', async () => {
      mockContract.getTopScores.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameLeaderboard.getTopScores(1, 10))
        .rejects.toThrow('Failed to get top scores: Contract error');
    });
  });

  describe('getPlayerRank', () => {
    it('should throw error for invalid leaderboard ID', async () => {
      await expect(gameLeaderboard.getPlayerRank(0, '0x1234567890123456789012345678901234567890'))
        .rejects.toThrow('Leaderboard ID must be a positive integer');
    });

    it('should throw error for invalid player address', async () => {
      await expect(gameLeaderboard.getPlayerRank(1, 'invalid-address'))
        .rejects.toThrow('Invalid player address');
    });

    it('should return player rank for valid parameters', async () => {
      mockContract.getPlayerRank.mockResolvedValue(ethers.BigNumber.from(1));
      
      const rank = await gameLeaderboard.getPlayerRank(
        1,
        '0x1234567890123456789012345678901234567890'
      );
      
      expect(rank).toBe(1);
    });

    it('should handle contract errors', async () => {
      mockContract.getPlayerRank.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameLeaderboard.getPlayerRank(
        1,
        '0x1234567890123456789012345678901234567890'
      )).rejects.toThrow('Failed to get player rank: Contract error');
    });
  });

  describe('getPlayerScore', () => {
    it('should throw error for invalid leaderboard ID', async () => {
      await expect(gameLeaderboard.getPlayerScore(0, '0x1234567890123456789012345678901234567890'))
        .rejects.toThrow('Leaderboard ID must be a positive integer');
    });

    it('should throw error for invalid player address', async () => {
      await expect(gameLeaderboard.getPlayerScore(1, 'invalid-address'))
        .rejects.toThrow('Invalid player address');
    });

    it('should return player score for valid parameters', async () => {
      mockContract.getPlayerScore.mockResolvedValue(ethers.BigNumber.from(1000));
      
      const score = await gameLeaderboard.getPlayerScore(
        1,
        '0x1234567890123456789012345678901234567890'
      );
      
      expect(score).toBe(1000);
    });

    it('should handle contract errors', async () => {
      mockContract.getPlayerScore.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameLeaderboard.getPlayerScore(
        1,
        '0x1234567890123456789012345678901234567890'
      )).rejects.toThrow('Failed to get player score: Contract error');
    });
  });

  describe('getLeaderboardCount', () => {
    it('should return leaderboard count', async () => {
      mockContract.getLeaderboardCount.mockResolvedValue(ethers.BigNumber.from(5));
      
      const count = await gameLeaderboard.getLeaderboardCount();
      
      expect(count).toBe(5);
    });

    it('should handle contract errors', async () => {
      mockContract.getLeaderboardCount.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameLeaderboard.getLeaderboardCount())
        .rejects.toThrow('Failed to get leaderboard count: Contract error');
    });
  });

  describe('getLeaderboardsByGame', () => {
    it('should throw error for invalid game ID', async () => {
      await expect(gameLeaderboard.getLeaderboardsByGame(0))
        .rejects.toThrow('Game ID must be a positive integer');
    });

    it('should return leaderboard IDs for valid game ID', async () => {
      mockContract.getLeaderboardsByGame.mockResolvedValue([
        ethers.BigNumber.from(1),
        ethers.BigNumber.from(2),
        ethers.BigNumber.from(3)
      ]);
      
      const leaderboardIds = await gameLeaderboard.getLeaderboardsByGame(1);
      
      expect(leaderboardIds).toEqual([1, 2, 3]);
    });

    it('should handle contract errors', async () => {
      mockContract.getLeaderboardsByGame.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameLeaderboard.getLeaderboardsByGame(1))
        .rejects.toThrow('Failed to get leaderboards by game: Contract error');
    });
  });
});