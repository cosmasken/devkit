// src/__tests__/GameAsset.test.ts
import { GameAsset } from '../GameAsset';
import { ethers } from 'ethers';

// Mock contract methods
const mockContract = {
  assets: jest.fn(),
  getAssetsByGame: jest.fn(),
  getAssetsByOwner: jest.fn(),
  getTotalSupply: jest.fn(),
  ownerOf: jest.fn(),
  balanceOf: jest.fn(),
  createAsset: jest.fn(),
  updateAsset: jest.fn(),
  updateAssetMetadata: jest.fn(),
  levelUpAsset: jest.fn(),
  transferFrom: jest.fn(),
  approve: jest.fn(),
  getApproved: jest.fn(),
  setApprovalForAll: jest.fn(),
  isApprovedForAll: jest.fn(),
  connect: jest.fn().mockReturnThis(),
  interface: {
    parseLog: jest.fn()
  }
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

describe('GameAsset', () => {
  let gameAsset: GameAsset;
  let mockProvider: any;
  let mockSigner: any;

  beforeEach(() => {
    mockProvider = {};
    mockSigner = {
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
    };
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a new instance of GameAsset for each test
    gameAsset = new GameAsset(
      '0x1234567890123456789012345678901234567890',
      mockProvider,
      mockSigner
    );
  });

  describe('constructor', () => {
    it('should create an instance with provider only', () => {
      const asset = new GameAsset(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      expect(asset).toBeInstanceOf(GameAsset);
      expect(mockSigner.getAddress).not.toHaveBeenCalled();
    });

    it('should create an instance with provider and signer', () => {
      const asset = new GameAsset(
        '0x1234567890123456789012345678901234567890',
        mockProvider,
        mockSigner
      );
      
      expect(asset).toBeInstanceOf(GameAsset);
    });
  });

  describe('getAsset', () => {
    it('should throw error for invalid asset ID', async () => {
      await expect(gameAsset.getAsset(0)).rejects.toThrow('Asset ID must be a positive integer');
      await expect(gameAsset.getAsset(-1)).rejects.toThrow('Asset ID must be a positive integer');
    });

    it('should return asset metadata for valid asset ID', async () => {
      const mockAsset = {
        name: 'Test Sword',
        description: 'A mighty sword',
        metadataURI: 'https://example.com/sword.json',
        createdAt: ethers.BigNumber.from(1234567890),
        updatedAt: ethers.BigNumber.from(1234567900),
        gameId: ethers.BigNumber.from(1),
        rarity: ethers.BigNumber.from(3),
        level: ethers.BigNumber.from(1)
      };
      
      mockContract.assets.mockResolvedValue(mockAsset);
      
      const asset = await gameAsset.getAsset(1);
      
      expect(asset).toEqual({
        id: 1,
        name: 'Test Sword',
        description: 'A mighty sword',
        metadataURI: 'https://example.com/sword.json',
        createdAt: 1234567890,
        updatedAt: 1234567900,
        gameId: 1,
        rarity: 3,
        level: 1
      });
    });

    it('should handle contract errors', async () => {
      mockContract.assets.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameAsset.getAsset(1)).rejects.toThrow('Failed to get asset with ID 1: Contract error');
    });
  });

  describe('createAsset', () => {
    it('should throw error when no signer is provided', async () => {
      const assetWithoutSigner = new GameAsset(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(assetWithoutSigner.createAsset(
        '0x1234567890123456789012345678901234567890',
        'Test Sword',
        'A mighty sword',
        'https://example.com/sword.json',
        1,
        3
      )).rejects.toThrow('Signer required to create asset');
    });

    it('should throw error for invalid owner address', async () => {
      await expect(gameAsset.createAsset(
        'invalid-address',
        'Test Sword',
        'A mighty sword',
        'https://example.com/sword.json',
        1,
        3
      )).rejects.toThrow('Invalid owner address');
    });

    it('should throw error for invalid rarity', async () => {
      await expect(gameAsset.createAsset(
        '0x1234567890123456789012345678901234567890',
        'Test Sword',
        'A mighty sword',
        'https://example.com/sword.json',
        1,
        0
      )).rejects.toThrow('Rarity must be between 1 and 5');
      
      await expect(gameAsset.createAsset(
        '0x1234567890123456789012345678901234567890',
        'Test Sword',
        'A mighty sword',
        'https://example.com/sword.json',
        1,
        6
      )).rejects.toThrow('Rarity must be between 1 and 5');
    });

    it('should throw error for invalid game ID', async () => {
      await expect(gameAsset.createAsset(
        '0x1234567890123456789012345678901234567890',
        'Test Sword',
        'A mighty sword',
        'https://example.com/sword.json',
        0,
        3
      )).rejects.toThrow('Game ID must be a positive integer');
    });

    it('should create an asset successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({
          logs: [{
            topics: ['0x1234567890123456789012345678901234567890123456789012345678901234', '0x0000000000000000000000000000000000000000000000000000000000000001'],
            data: '0x',
            address: '0x1234567890123456789012345678901234567890'
          }]
        })
      };
      
      // Mock the contract interface parseLog method
      mockContract.interface.parseLog.mockReturnValue({
        name: 'AssetCreated',
        args: {
          assetId: ethers.BigNumber.from(1)
        }
      });
      
      mockContract.createAsset.mockResolvedValue(mockTx);
      
      const result = await gameAsset.createAsset(
        '0x1234567890123456789012345678901234567890',
        'Test Sword',
        'A mighty sword',
        'https://example.com/sword.json',
        1,
        3
      );
      
      expect(result.receipt).toBeDefined();
      expect(result.assetId).toBe(1);
      expect(mockContract.createAsset).toHaveBeenCalledWith(
        '0x1234567890123456789012345678901234567890',
        'Test Sword',
        'A mighty sword',
        'https://example.com/sword.json',
        1,
        3
      );
    });

    it('should handle contract errors', async () => {
      mockContract.createAsset.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameAsset.createAsset(
        '0x1234567890123456789012345678901234567890',
        'Test Sword',
        'A mighty sword',
        'https://example.com/sword.json',
        1,
        3
      )).rejects.toThrow('Failed to create asset: Contract error');
    });
  });

  describe('updateAsset', () => {
    it('should throw error when no signer is provided', async () => {
      const assetWithoutSigner = new GameAsset(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(assetWithoutSigner.updateAsset(1, 'Updated Sword', 'An updated sword'))
        .rejects.toThrow('Signer required to update asset');
    });

    it('should throw error for invalid asset ID', async () => {
      await expect(gameAsset.updateAsset(0, 'Updated Sword', 'An updated sword'))
        .rejects.toThrow('Asset ID must be a positive integer');
    });

    it('should update an asset successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xabc123' })
      };
      
      mockContract.updateAsset.mockResolvedValue(mockTx);
      
      const result = await gameAsset.updateAsset(1, 'Updated Sword', 'An updated sword');
      
      expect(result).toEqual({ transactionHash: '0xabc123' });
      expect(mockContract.updateAsset).toHaveBeenCalledWith(1, 'Updated Sword', 'An updated sword');
    });

    it('should handle contract errors', async () => {
      mockContract.updateAsset.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameAsset.updateAsset(1, 'Updated Sword', 'An updated sword'))
        .rejects.toThrow('Failed to update asset with ID 1: Contract error');
    });
  });

  describe('updateAssetMetadata', () => {
    it('should throw error when no signer is provided', async () => {
      const assetWithoutSigner = new GameAsset(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(assetWithoutSigner.updateAssetMetadata(1, 'https://example.com/updated-sword.json'))
        .rejects.toThrow('Signer required to update asset metadata');
    });

    it('should throw error for invalid asset ID', async () => {
      await expect(gameAsset.updateAssetMetadata(0, 'https://example.com/updated-sword.json'))
        .rejects.toThrow('Asset ID must be a positive integer');
    });

    it('should update asset metadata successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xdef456' })
      };
      
      mockContract.updateAssetMetadata.mockResolvedValue(mockTx);
      
      const result = await gameAsset.updateAssetMetadata(1, 'https://example.com/updated-sword.json');
      
      expect(result).toEqual({ transactionHash: '0xdef456' });
      expect(mockContract.updateAssetMetadata).toHaveBeenCalledWith(1, 'https://example.com/updated-sword.json');
    });

    it('should handle contract errors', async () => {
      mockContract.updateAssetMetadata.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameAsset.updateAssetMetadata(1, 'https://example.com/updated-sword.json'))
        .rejects.toThrow('Failed to update asset metadata with ID 1: Contract error');
    });
  });

  describe('levelUpAsset', () => {
    it('should throw error when no signer is provided', async () => {
      const assetWithoutSigner = new GameAsset(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(assetWithoutSigner.levelUpAsset(1))
        .rejects.toThrow('Signer required to level up asset');
    });

    it('should throw error for invalid asset ID', async () => {
      await expect(gameAsset.levelUpAsset(0))
        .rejects.toThrow('Asset ID must be a positive integer');
    });

    it('should level up an asset successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xghi789' })
      };
      
      mockContract.levelUpAsset.mockResolvedValue(mockTx);
      
      const result = await gameAsset.levelUpAsset(1);
      
      expect(result).toEqual({ transactionHash: '0xghi789' });
      expect(mockContract.levelUpAsset).toHaveBeenCalledWith(1);
    });

    it('should handle contract errors', async () => {
      mockContract.levelUpAsset.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameAsset.levelUpAsset(1))
        .rejects.toThrow('Failed to level up asset with ID 1: Contract error');
    });
  });

  describe('getAssetsByGame', () => {
    it('should throw error for invalid game ID', async () => {
      await expect(gameAsset.getAssetsByGame(0)).rejects.toThrow('Game ID must be a positive integer');
    });

    it('should return asset IDs for valid game ID', async () => {
      mockContract.getAssetsByGame.mockResolvedValue([
        ethers.BigNumber.from(1),
        ethers.BigNumber.from(2),
        ethers.BigNumber.from(3)
      ]);
      
      const assetIds = await gameAsset.getAssetsByGame(1);
      
      expect(assetIds).toEqual([1, 2, 3]);
    });

    it('should handle contract errors', async () => {
      mockContract.getAssetsByGame.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameAsset.getAssetsByGame(1))
        .rejects.toThrow('Failed to get assets for game with ID 1: Contract error');
    });
  });

  describe('getAssetsByOwner', () => {
    it('should throw error for invalid address', async () => {
      await expect(gameAsset.getAssetsByOwner('invalid-address'))
        .rejects.toThrow('Invalid owner address');
    });

    it('should return asset IDs for valid owner address', async () => {
      mockContract.getAssetsByOwner.mockResolvedValue([
        ethers.BigNumber.from(1),
        ethers.BigNumber.from(2),
        ethers.BigNumber.from(3)
      ]);
      
      const assetIds = await gameAsset.getAssetsByOwner('0x1234567890123456789012345678901234567890');
      
      expect(assetIds).toEqual([1, 2, 3]);
    });

    it('should handle contract errors', async () => {
      mockContract.getAssetsByOwner.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameAsset.getAssetsByOwner('0x1234567890123456789012345678901234567890'))
        .rejects.toThrow('Failed to get assets for owner 0x1234567890123456789012345678901234567890: Contract error');
    });
  });

  describe('getTotalSupply', () => {
    it('should return total supply', async () => {
      mockContract.getTotalSupply.mockResolvedValue(ethers.BigNumber.from(42));
      
      const supply = await gameAsset.getTotalSupply();
      
      expect(supply).toBe(42);
    });

    it('should handle contract errors', async () => {
      mockContract.getTotalSupply.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameAsset.getTotalSupply())
        .rejects.toThrow('Failed to get total supply: Contract error');
    });
  });

  describe('getOwnerOf', () => {
    it('should throw error for invalid asset ID', async () => {
      await expect(gameAsset.getOwnerOf(0)).rejects.toThrow('Asset ID must be a positive integer');
    });

    it('should return owner address for valid asset ID', async () => {
      mockContract.ownerOf.mockResolvedValue('0x1234567890123456789012345678901234567890');
      
      const owner = await gameAsset.getOwnerOf(1);
      
      expect(owner).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should handle contract errors', async () => {
      mockContract.ownerOf.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameAsset.getOwnerOf(1))
        .rejects.toThrow('Failed to get owner of asset with ID 1: Contract error');
    });
  });

  describe('getBalanceOf', () => {
    it('should throw error for invalid address', async () => {
      await expect(gameAsset.getBalanceOf('invalid-address'))
        .rejects.toThrow('Invalid owner address');
    });

    it('should return balance for valid address', async () => {
      mockContract.balanceOf.mockResolvedValue(ethers.BigNumber.from(5));
      
      const balance = await gameAsset.getBalanceOf('0x1234567890123456789012345678901234567890');
      
      expect(balance).toBe(5);
    });

    it('should handle contract errors', async () => {
      mockContract.balanceOf.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameAsset.getBalanceOf('0x1234567890123456789012345678901234567890'))
        .rejects.toThrow('Failed to get balance for owner 0x1234567890123456789012345678901234567890: Contract error');
    });
  });

  describe('transferAsset', () => {
    it('should throw error when no signer is provided', async () => {
      const assetWithoutSigner = new GameAsset(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(assetWithoutSigner.transferAsset('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', 1))
        .rejects.toThrow('Signer required to transfer asset');
    });

    it('should throw error for invalid recipient address', async () => {
      await expect(gameAsset.transferAsset('invalid-address', 1))
        .rejects.toThrow('Invalid recipient address');
    });

    it('should throw error for invalid asset ID', async () => {
      await expect(gameAsset.transferAsset('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', 0))
        .rejects.toThrow('Asset ID must be a positive integer');
    });

    it('should transfer an asset successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xjkl012' })
      };
      
      mockContract.transferFrom.mockResolvedValue(mockTx);
      
      const result = await gameAsset.transferAsset('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', 1);
      
      expect(result).toEqual({ transactionHash: '0xjkl012' });
      expect(mockContract.transferFrom).toHaveBeenCalledWith(
        '0x1234567890123456789012345678901234567890',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        1
      );
    });

    it('should handle contract errors', async () => {
      mockContract.transferFrom.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameAsset.transferAsset('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', 1))
        .rejects.toThrow('Failed to transfer asset with ID 1: Contract error');
    });
  });

  describe('approve', () => {
    it('should throw error when no signer is provided', async () => {
      const assetWithoutSigner = new GameAsset(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(assetWithoutSigner.approve('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', 1))
        .rejects.toThrow('Signer required to approve asset transfer');
    });

    it('should throw error for invalid address', async () => {
      await expect(gameAsset.approve('invalid-address', 1))
        .rejects.toThrow('Invalid address to approve');
    });

    it('should throw error for invalid asset ID', async () => {
      await expect(gameAsset.approve('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', 0))
        .rejects.toThrow('Asset ID must be a positive integer');
    });

    it('should approve an address successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xmno345' })
      };
      
      mockContract.approve.mockResolvedValue(mockTx);
      
      const result = await gameAsset.approve('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', 1);
      
      expect(result).toEqual({ transactionHash: '0xmno345' });
      expect(mockContract.approve).toHaveBeenCalledWith(
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        1
      );
    });

    it('should handle contract errors', async () => {
      mockContract.approve.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameAsset.approve('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', 1))
        .rejects.toThrow('Failed to approve asset with ID 1: Contract error');
    });
  });

  describe('getApproved', () => {
    it('should throw error for invalid asset ID', async () => {
      await expect(gameAsset.getApproved(0)).rejects.toThrow('Asset ID must be a positive integer');
    });

    it('should return approved address for valid asset ID', async () => {
      mockContract.getApproved.mockResolvedValue('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
      
      const approved = await gameAsset.getApproved(1);
      
      expect(approved).toBe('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
    });

    it('should handle contract errors', async () => {
      mockContract.getApproved.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameAsset.getApproved(1))
        .rejects.toThrow('Failed to get approved address for asset with ID 1: Contract error');
    });
  });

  describe('setApprovalForAll', () => {
    it('should throw error when no signer is provided', async () => {
      const assetWithoutSigner = new GameAsset(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(assetWithoutSigner.setApprovalForAll('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', true))
        .rejects.toThrow('Signer required to set approval for all');
    });

    it('should throw error for invalid operator address', async () => {
      await expect(gameAsset.setApprovalForAll('invalid-address', true))
        .rejects.toThrow('Invalid operator address');
    });

    it('should set approval for all successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xpqr678' })
      };
      
      mockContract.setApprovalForAll.mockResolvedValue(mockTx);
      
      const result = await gameAsset.setApprovalForAll('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', true);
      
      expect(result).toEqual({ transactionHash: '0xpqr678' });
      expect(mockContract.setApprovalForAll).toHaveBeenCalledWith(
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        true
      );
    });

    it('should handle contract errors', async () => {
      mockContract.setApprovalForAll.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameAsset.setApprovalForAll('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', true))
        .rejects.toThrow('Failed to set approval for all: Contract error');
    });
  });

  describe('isApprovedForAll', () => {
    it('should throw error for invalid address', async () => {
      await expect(gameAsset.isApprovedForAll('invalid-address', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'))
        .rejects.toThrow('Invalid address');
      
      await expect(gameAsset.isApprovedForAll('0x1234567890123456789012345678901234567890', 'invalid-address'))
        .rejects.toThrow('Invalid address');
    });

    it('should return approval status', async () => {
      mockContract.isApprovedForAll.mockResolvedValue(true);
      
      const isApproved = await gameAsset.isApprovedForAll(
        '0x1234567890123456789012345678901234567890',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
      );
      
      expect(isApproved).toBe(true);
    });

    it('should handle contract errors', async () => {
      mockContract.isApprovedForAll.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameAsset.isApprovedForAll(
        '0x1234567890123456789012345678901234567890',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
      )).rejects.toThrow('Failed to check approval for all: Contract error');
    });
  });
});