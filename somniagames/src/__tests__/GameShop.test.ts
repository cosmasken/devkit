// src/__tests__/GameShop.test.ts
import { GameShop } from '../GameShop';
import { ethers } from 'ethers';

// Mock contract methods
const mockContract = {
  createItem: jest.fn(),
  updateItem: jest.fn(),
  restockItem: jest.fn(),
  activateItem: jest.fn(),
  deactivateItem: jest.fn(),
  purchaseItem: jest.fn(),
  items: jest.fn(),
  purchases: jest.fn(),
  getItem: jest.fn(),
  getItemsByGame: jest.fn(),
  getPurchaseHistory: jest.fn(),
  getItemCount: jest.fn(),
  getPurchaseCount: jest.fn(),
  updatePlatformFee: jest.fn(),
  updateFeeRecipient: jest.fn(),
  platformFee: jest.fn(),
  feeRecipient: jest.fn(),
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

describe('GameShop', () => {
  let gameShop: GameShop;
  let mockProvider: any;
  let mockSigner: any;

  beforeEach(() => {
    mockProvider = {};
    mockSigner = {
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
    };
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a new instance of GameShop for each test
    gameShop = new GameShop(
      '0x1234567890123456789012345678901234567890',
      mockProvider,
      mockSigner
    );
  });

  describe('constructor', () => {
    it('should create an instance with provider only', () => {
      const shop = new GameShop(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      expect(shop).toBeInstanceOf(GameShop);
      expect(mockSigner.getAddress).not.toHaveBeenCalled();
    });

    it('should create an instance with provider and signer', () => {
      const shop = new GameShop(
        '0x1234567890123456789012345678901234567890',
        mockProvider,
        mockSigner
      );
      
      expect(shop).toBeInstanceOf(GameShop);
    });
  });

  describe('createItem', () => {
    it('should throw error when no signer is provided', async () => {
      const shopWithoutSigner = new GameShop(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(shopWithoutSigner.createItem(
        'Test Item',
        'A test item',
        'https://example.com/item.json',
        100,
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        1
      )).rejects.toThrow('Signer required to create item');
    });

    it('should throw error for invalid game ID', async () => {
      await expect(gameShop.createItem(
        'Test Item',
        'A test item',
        'https://example.com/item.json',
        100,
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        0
      )).rejects.toThrow('Game ID must be a positive integer');
    });

    it('should throw error for invalid price', async () => {
      await expect(gameShop.createItem(
        'Test Item',
        'A test item',
        'https://example.com/item.json',
        0,
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        1
      )).rejects.toThrow('Price must be positive');
      
      await expect(gameShop.createItem(
        'Test Item',
        'A test item',
        'https://example.com/item.json',
        -1,
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        1
      )).rejects.toThrow('Price must be positive');
    });

    it('should throw error for invalid token address', async () => {
      await expect(gameShop.createItem(
        'Test Item',
        'A test item',
        'https://example.com/item.json',
        100,
        'invalid-address',
        1
      )).rejects.toThrow('Invalid token address');
    });

    it('should create an item successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xabc123' })
      };
      
      mockContract.createItem.mockResolvedValue(mockTx);
      
      const result = await gameShop.createItem(
        'Test Item',
        'A test item',
        'https://example.com/item.json',
        100,
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        1
      );
      
      expect(result).toEqual({ transactionHash: '0xabc123' });
      expect(mockContract.createItem).toHaveBeenCalledWith(
        'Test Item',
        'A test item',
        'https://example.com/item.json',
        100,
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        1,
        -1
      );
    });

    it('should handle contract errors', async () => {
      mockContract.createItem.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameShop.createItem(
        'Test Item',
        'A test item',
        'https://example.com/item.json',
        100,
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        1
      )).rejects.toThrow('Failed to create item: Contract error');
    });
  });

  describe('updateItem', () => {
    it('should throw error when no signer is provided', async () => {
      const shopWithoutSigner = new GameShop(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(shopWithoutSigner.updateItem(1, 'Updated Item', 'An updated item', 150))
        .rejects.toThrow('Signer required to update item');
    });

    it('should throw error for invalid item ID', async () => {
      await expect(gameShop.updateItem(0, 'Updated Item', 'An updated item', 150))
        .rejects.toThrow('Item ID must be a positive integer');
    });

    it('should throw error for invalid price', async () => {
      await expect(gameShop.updateItem(1, 'Updated Item', 'An updated item', 0))
        .rejects.toThrow('Price must be positive');
      
      await expect(gameShop.updateItem(1, 'Updated Item', 'An updated item', -1))
        .rejects.toThrow('Price must be positive');
    });

    it('should update an item successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xdef456' })
      };
      
      mockContract.updateItem.mockResolvedValue(mockTx);
      
      const result = await gameShop.updateItem(1, 'Updated Item', 'An updated item', 150);
      
      expect(result).toEqual({ transactionHash: '0xdef456' });
      expect(mockContract.updateItem).toHaveBeenCalledWith(1, 'Updated Item', 'An updated item', 150);
    });

    it('should handle contract errors', async () => {
      mockContract.updateItem.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameShop.updateItem(1, 'Updated Item', 'An updated item', 150))
        .rejects.toThrow('Failed to update item: Contract error');
    });
  });

  describe('restockItem', () => {
    it('should throw error when no signer is provided', async () => {
      const shopWithoutSigner = new GameShop(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(shopWithoutSigner.restockItem(1, 10))
        .rejects.toThrow('Signer required to restock item');
    });

    it('should throw error for invalid item ID', async () => {
      await expect(gameShop.restockItem(0, 10))
        .rejects.toThrow('Item ID must be a positive integer');
    });

    it('should throw error for invalid quantity', async () => {
      await expect(gameShop.restockItem(1, 0))
        .rejects.toThrow('Quantity must be positive');
      
      await expect(gameShop.restockItem(1, -1))
        .rejects.toThrow('Quantity must be positive');
    });

    it('should restock an item successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xghi789' })
      };
      
      mockContract.restockItem.mockResolvedValue(mockTx);
      
      const result = await gameShop.restockItem(1, 10);
      
      expect(result).toEqual({ transactionHash: '0xghi789' });
      expect(mockContract.restockItem).toHaveBeenCalledWith(1, 10);
    });

    it('should handle contract errors', async () => {
      mockContract.restockItem.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameShop.restockItem(1, 10))
        .rejects.toThrow('Failed to restock item: Contract error');
    });
  });

  describe('activateItem', () => {
    it('should throw error when no signer is provided', async () => {
      const shopWithoutSigner = new GameShop(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(shopWithoutSigner.activateItem(1))
        .rejects.toThrow('Signer required to activate item');
    });

    it('should throw error for invalid item ID', async () => {
      await expect(gameShop.activateItem(0))
        .rejects.toThrow('Item ID must be a positive integer');
    });

    it('should activate an item successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xjkl012' })
      };
      
      mockContract.activateItem.mockResolvedValue(mockTx);
      
      const result = await gameShop.activateItem(1);
      
      expect(result).toEqual({ transactionHash: '0xjkl012' });
      expect(mockContract.activateItem).toHaveBeenCalledWith(1);
    });

    it('should handle contract errors', async () => {
      mockContract.activateItem.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameShop.activateItem(1))
        .rejects.toThrow('Failed to activate item: Contract error');
    });
  });

  describe('deactivateItem', () => {
    it('should throw error when no signer is provided', async () => {
      const shopWithoutSigner = new GameShop(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(shopWithoutSigner.deactivateItem(1))
        .rejects.toThrow('Signer required to deactivate item');
    });

    it('should throw error for invalid item ID', async () => {
      await expect(gameShop.deactivateItem(0))
        .rejects.toThrow('Item ID must be a positive integer');
    });

    it('should deactivate an item successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xmno345' })
      };
      
      mockContract.deactivateItem.mockResolvedValue(mockTx);
      
      const result = await gameShop.deactivateItem(1);
      
      expect(result).toEqual({ transactionHash: '0xmno345' });
      expect(mockContract.deactivateItem).toHaveBeenCalledWith(1);
    });

    it('should handle contract errors', async () => {
      mockContract.deactivateItem.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameShop.deactivateItem(1))
        .rejects.toThrow('Failed to deactivate item: Contract error');
    });
  });

  describe('getItem', () => {
    it('should throw error for invalid item ID', async () => {
      await expect(gameShop.getItem(0))
        .rejects.toThrow('Item ID must be a positive integer');
    });

    it('should return item information for valid ID', async () => {
      const mockItem = {
        id: ethers.BigNumber.from(1),
        name: 'Test Item',
        description: 'A test item',
        metadataURI: 'https://example.com/item.json',
        price: ethers.BigNumber.from(100),
        tokenAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        gameId: ethers.BigNumber.from(1),
        quantity: ethers.BigNumber.from(5),
        maxQuantity: ethers.BigNumber.from(10),
        createdAt: ethers.BigNumber.from(1234567890),
        updatedAt: ethers.BigNumber.from(1234567900),
        active: true
      };
      
      mockContract.getItem.mockResolvedValue(mockItem);
      
      const item = await gameShop.getItem(1);
      
      expect(item).toEqual({
        id: 1,
        name: 'Test Item',
        description: 'A test item',
        metadataURI: 'https://example.com/item.json',
        price: 100,
        tokenAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        gameId: 1,
        quantity: 5,
        maxQuantity: 10,
        createdAt: 1234567890,
        updatedAt: 1234567900,
        active: true
      });
    });

    it('should handle contract errors', async () => {
      mockContract.getItem.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameShop.getItem(1))
        .rejects.toThrow('Failed to get item: Contract error');
    });
  });

  describe('getItemsByGame', () => {
    it('should throw error for invalid game ID', async () => {
      await expect(gameShop.getItemsByGame(0, 10))
        .rejects.toThrow('Game ID must be a positive integer');
    });

    it('should throw error for invalid limit', async () => {
      await expect(gameShop.getItemsByGame(1, 0))
        .rejects.toThrow('Limit must be between 1 and 100');
      
      await expect(gameShop.getItemsByGame(1, 101))
        .rejects.toThrow('Limit must be between 1 and 100');
    });

    it('should return item IDs for valid parameters', async () => {
      mockContract.getItemsByGame.mockResolvedValue([
        ethers.BigNumber.from(1),
        ethers.BigNumber.from(2),
        ethers.BigNumber.from(3)
      ]);
      
      const itemIds = await gameShop.getItemsByGame(1, 10);
      
      expect(itemIds).toEqual([1, 2, 3]);
    });

    it('should handle contract errors', async () => {
      mockContract.getItemsByGame.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameShop.getItemsByGame(1, 10))
        .rejects.toThrow('Failed to get items by game: Contract error');
    });
  });

  describe('getPurchaseHistory', () => {
    it('should throw error for invalid buyer address', async () => {
      await expect(gameShop.getPurchaseHistory('invalid-address', 10))
        .rejects.toThrow('Invalid buyer address');
    });

    it('should throw error for invalid limit', async () => {
      await expect(gameShop.getPurchaseHistory(
        '0x1234567890123456789012345678901234567890',
        0
      )).rejects.toThrow('Limit must be between 1 and 100');
      
      await expect(gameShop.getPurchaseHistory(
        '0x1234567890123456789012345678901234567890',
        101
      )).rejects.toThrow('Limit must be between 1 and 100');
    });

    it('should return purchase history for valid parameters', async () => {
      const mockPurchases = [
        {
          itemId: ethers.BigNumber.from(1),
          buyer: '0x1234567890123456789012345678901234567890',
          quantity: ethers.BigNumber.from(2),
          totalPrice: ethers.BigNumber.from(200),
          timestamp: ethers.BigNumber.from(1234567890)
        },
        {
          itemId: ethers.BigNumber.from(2),
          buyer: '0x1234567890123456789012345678901234567890',
          quantity: ethers.BigNumber.from(1),
          totalPrice: ethers.BigNumber.from(150),
          timestamp: ethers.BigNumber.from(1234567895)
        }
      ];
      
      mockContract.getPurchaseHistory.mockResolvedValue(mockPurchases);
      
      const purchases = await gameShop.getPurchaseHistory(
        '0x1234567890123456789012345678901234567890',
        10
      );
      
      expect(purchases).toEqual([
        {
          itemId: 1,
          buyer: '0x1234567890123456789012345678901234567890',
          quantity: 2,
          totalPrice: 200,
          timestamp: 1234567890
        },
        {
          itemId: 2,
          buyer: '0x1234567890123456789012345678901234567890',
          quantity: 1,
          totalPrice: 150,
          timestamp: 1234567895
        }
      ]);
    });

    it('should handle contract errors', async () => {
      mockContract.getPurchaseHistory.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameShop.getPurchaseHistory(
        '0x1234567890123456789012345678901234567890',
        10
      )).rejects.toThrow('Failed to get purchase history: Contract error');
    });
  });

  describe('getItemCount', () => {
    it('should return item count', async () => {
      mockContract.getItemCount.mockResolvedValue(ethers.BigNumber.from(5));
      
      const count = await gameShop.getItemCount();
      
      expect(count).toBe(5);
    });

    it('should handle contract errors', async () => {
      mockContract.getItemCount.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameShop.getItemCount())
        .rejects.toThrow('Failed to get item count: Contract error');
    });
  });

  describe('getPurchaseCount', () => {
    it('should return purchase count', async () => {
      mockContract.getPurchaseCount.mockResolvedValue(ethers.BigNumber.from(10));
      
      const count = await gameShop.getPurchaseCount();
      
      expect(count).toBe(10);
    });

    it('should handle contract errors', async () => {
      mockContract.getPurchaseCount.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameShop.getPurchaseCount())
        .rejects.toThrow('Failed to get purchase count: Contract error');
    });
  });

  describe('updatePlatformFee', () => {
    it('should throw error when no signer is provided', async () => {
      const shopWithoutSigner = new GameShop(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(shopWithoutSigner.updatePlatformFee(100))
        .rejects.toThrow('Signer required to update platform fee');
    });

    it('should throw error for invalid platform fee', async () => {
      await expect(gameShop.updatePlatformFee(-1))
        .rejects.toThrow('Platform fee must be between 0 and 1000 basis points (0-10%)');
      
      await expect(gameShop.updatePlatformFee(1001))
        .rejects.toThrow('Platform fee must be between 0 and 1000 basis points (0-10%)');
    });

    it('should update platform fee successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xpqr678' })
      };
      
      mockContract.updatePlatformFee.mockResolvedValue(mockTx);
      
      const result = await gameShop.updatePlatformFee(100);
      
      expect(result).toEqual({ transactionHash: '0xpqr678' });
      expect(mockContract.updatePlatformFee).toHaveBeenCalledWith(100);
    });

    it('should handle contract errors', async () => {
      mockContract.updatePlatformFee.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameShop.updatePlatformFee(100))
        .rejects.toThrow('Failed to update platform fee: Contract error');
    });
  });

  describe('updateFeeRecipient', () => {
    it('should throw error when no signer is provided', async () => {
      const shopWithoutSigner = new GameShop(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(shopWithoutSigner.updateFeeRecipient('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'))
        .rejects.toThrow('Signer required to update fee recipient');
    });

    it('should throw error for invalid fee recipient address', async () => {
      await expect(gameShop.updateFeeRecipient('invalid-address'))
        .rejects.toThrow('Invalid fee recipient address');
    });

    it('should update fee recipient successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xstu901' })
      };
      
      mockContract.updateFeeRecipient.mockResolvedValue(mockTx);
      
      const result = await gameShop.updateFeeRecipient('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
      
      expect(result).toEqual({ transactionHash: '0xstu901' });
      expect(mockContract.updateFeeRecipient).toHaveBeenCalledWith('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
    });

    it('should handle contract errors', async () => {
      mockContract.updateFeeRecipient.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameShop.updateFeeRecipient('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'))
        .rejects.toThrow('Failed to update fee recipient: Contract error');
    });
  });

  describe('getPlatformFee', () => {
    it('should return platform fee', async () => {
      mockContract.platformFee.mockResolvedValue(ethers.BigNumber.from(100));
      
      const fee = await gameShop.getPlatformFee();
      
      expect(fee).toBe(100);
    });

    it('should handle contract errors', async () => {
      mockContract.platformFee.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameShop.getPlatformFee())
        .rejects.toThrow('Failed to get platform fee: Contract error');
    });
  });

  describe('getFeeRecipient', () => {
    it('should return fee recipient', async () => {
      mockContract.feeRecipient.mockResolvedValue('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
      
      const recipient = await gameShop.getFeeRecipient();
      
      expect(recipient).toBe('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
    });

    it('should handle contract errors', async () => {
      mockContract.feeRecipient.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameShop.getFeeRecipient())
        .rejects.toThrow('Failed to get fee recipient: Contract error');
    });
  });

  describe('purchaseItem', () => {
    it('should throw error when no signer is provided', async () => {
      const shopWithoutSigner = new GameShop(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(shopWithoutSigner.purchaseItem(1, 2))
        .rejects.toThrow('Signer required to purchase item');
    });

    it('should throw error for invalid item ID', async () => {
      await expect(gameShop.purchaseItem(0, 2))
        .rejects.toThrow('Item ID must be a positive integer');
    });

    it('should throw error for invalid quantity', async () => {
      await expect(gameShop.purchaseItem(1, 0))
        .rejects.toThrow('Quantity must be positive');
      
      await expect(gameShop.purchaseItem(1, -1))
        .rejects.toThrow('Quantity must be positive');
    });

    it('should purchase an item successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xvwx234' })
      };
      
      mockContract.purchaseItem.mockResolvedValue(mockTx);
      
      const result = await gameShop.purchaseItem(1, 2);
      
      expect(result).toEqual({ transactionHash: '0xvwx234' });
      expect(mockContract.purchaseItem).toHaveBeenCalledWith(1, 2);
    });

    it('should handle contract errors', async () => {
      mockContract.purchaseItem.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameShop.purchaseItem(1, 2))
        .rejects.toThrow('Failed to purchase item: Contract error');
    });
  });
});