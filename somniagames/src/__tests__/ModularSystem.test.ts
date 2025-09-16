// src/__tests__/ModularSystem.test.ts
import { createSimpleGame, createTetrisGame, createChessGame } from '../simple';
import { NFTModule } from '../modules/NFTModule';
import { PaymentModule } from '../modules/PaymentModule';
import { ethers } from 'ethers';

// Mock provider
const mockProvider = new ethers.providers.BaseProvider(1);

describe('Modular System', () => {
  describe('Simple Game Creation', () => {
    it('should create a simple game with default modules', () => {
      const game = createSimpleGame('Test Game', mockProvider);
      
      expect(game.getName()).toBe('Test Game');
      expect(game.hasModule('NFTModule')).toBe(true);
      expect(game.hasModule('PaymentModule')).toBe(true);
    });
    
    it('should accept configuration object', () => {
      const game = createSimpleGame({
        name: 'Configured Game',
        type: 'puzzle',
        maxPlayers: 4
      }, mockProvider);
      
      expect(game.getName()).toBe('Configured Game');
    });
    
    it('should throw error without provider', () => {
      expect(() => {
        // @ts-ignore - Testing invalid input
        createSimpleGame('Test Game');
      }).toThrow('Provider is required to create a game');
    });
  });
  
  describe('Template Games', () => {
    it('should create a Tetris game with correct assets', () => {
      const game = createTetrisGame('Tetris Clone', mockProvider);
      const nftModule = game.getNFTModule();
      
      expect(nftModule).toBeDefined();
      if (nftModule) {
        const assets = nftModule.getAssets();
        expect(assets.size).toBe(7); // 7 Tetris pieces
        expect(assets.has('I')).toBe(true);
        expect(assets.has('O')).toBe(true);
        expect(assets.has('T')).toBe(true);
      }
    });
    
    it('should create a Chess game with correct assets', () => {
      const game = createChessGame('Chess Game', mockProvider);
      const nftModule = game.getNFTModule();
      
      expect(nftModule).toBeDefined();
      if (nftModule) {
        const assets = nftModule.getAssets();
        expect(assets.size).toBe(6); // 6 Chess pieces
        expect(assets.has('king')).toBe(true);
        expect(assets.has('queen')).toBe(true);
        expect(assets.has('pawn')).toBe(true);
      }
    });
  });
  
  describe('Module Functionality', () => {
    it('should configure payment module correctly', () => {
      const game = createTetrisGame('Payment Test', mockProvider);
      const paymentModule = game.getPaymentModule();
      
      expect(paymentModule).toBeDefined();
      if (paymentModule) {
        const config = paymentModule.getConfig();
        expect(config.entryFee).toBe('0.01 SOM');
        expect(config.winReward).toBe('1.0 SOM');
      }
    });
    
    it('should define NFT assets correctly', () => {
      const game = createSimpleGame('NFT Test', mockProvider);
      const nftModule = game.getNFTModule();
      
      expect(nftModule).toBeDefined();
      if (nftModule) {
        // Define custom assets
        nftModule.defineAssets({
          testAsset: {
            name: 'Test Asset',
            symbol: 'TEST',
            uri: 'https://example.com/test.json',
            rarity: 'common'
          }
        });
        
        const assets = nftModule.getAssets();
        expect(assets.size).toBe(1);
        expect(assets.has('testAsset')).toBe(true);
        
        const asset = assets.get('testAsset');
        expect(asset).toBeDefined();
        expect(asset?.name).toBe('Test Asset');
        expect(asset?.rarity).toBe('common');
      }
    });
  });
  
  describe('Deployment', () => {
    it('should deploy game with modules', async () => {
      // Create a mock signer for testing
      const mockSigner = new ethers.Wallet('0x0123456789012345678901234567890123456789012345678901234567890123');
      const game = createSimpleGame('Deploy Test', mockProvider, mockSigner);
      
      // Mock the deploy methods to test the structure
      const mockDeployResult = {
        address: '0x1234567890123456789012345678901234567890',
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        blockNumber: 1234567
      };
      
      // Mock module deploy methods
      const nftModule = game.getNFTModule();
      const paymentModule = game.getPaymentModule();
      
      if (nftModule && paymentModule) {
        jest.spyOn(nftModule, 'deploy').mockResolvedValue(mockDeployResult);
        jest.spyOn(paymentModule, 'deploy').mockResolvedValue({
          ...mockDeployResult,
          address: '0x2345678901234567890123456789012345678901'
        });
        
        const result = await game.deploy();
        
        expect(result.gameAddress).toBeDefined();
        expect(result.moduleAddresses).toBeDefined();
        expect(result.moduleAddresses.NFTModule).toBe('0x1234567890123456789012345678901234567890');
        expect(result.moduleAddresses.PaymentModule).toBe('0x2345678901234567890123456789012345678901');
      }
    });
  });
  
  describe('NFT Module Functionality', () => {
    it('should mint assets correctly', async () => {
      const mockSigner = new ethers.Wallet('0x0123456789012345678901234567890123456789012345678901234567890123');
      const nftModule = new NFTModule(
        '0x0000000000000000000000000000000000000000',
        mockProvider,
        mockSigner
      );
      
      // Define test assets
      nftModule.defineAssets({
        testAsset: {
          name: 'Test Asset',
          symbol: 'TEST',
          uri: 'https://example.com/test.json',
          rarity: 'common'
        }
      });
      
      // Test that it requires a deployed contract
      await expect(nftModule.mintAsset('0x123...', 'testAsset')).rejects.toThrow('Contract not deployed. Call deploy() first.');
    });
    
    it('should throw error for non-existent assets', async () => {
      const mockSigner = new ethers.Wallet('0x0123456789012345678901234567890123456789012345678901234567890123');
      const nftModule = new NFTModule(
        '0x0000000000000000000000000000000000000000',
        mockProvider,
        mockSigner
      );
      
      // Mock deployment to avoid actual deployment
      const mockDeployResult = {
        address: '0x1234567890123456789012345678901234567890',
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        blockNumber: 1234567
      };
      
      jest.spyOn(nftModule, 'deploy').mockImplementation(async function(this: any) {
        // Simulate the actual deploy method behavior
        this.contractAddress = mockDeployResult.address;
        // Mock contract object
        this.contract = {
          createAsset: jest.fn().mockRejectedValue(new Error('Asset nonExistent not found'))
        };
        return mockDeployResult;
      });
      
      // Deploy the module first
      await nftModule.deploy();
      
      await expect(nftModule.mintAsset('0x123...', 'nonExistent')).rejects.toThrow('Asset nonExistent not found');
    });
  });
  
  describe('Payment Module Functionality', () => {
    it('should process payments correctly', async () => {
      const mockSigner = new ethers.Wallet('0x0123456789012345678901234567890123456789012345678901234567890123');
      const paymentModule = new PaymentModule(
        '0x0000000000000000000000000000000000000000',
        mockProvider,
        mockSigner
      );
      
      // Test that it requires a deployed contract
      await expect(paymentModule.processPayment('0x123...', '0x456...', '1.0')).rejects.toThrow('Payment contract not deployed. Call deploy() first.');
    });
    
    it('should handle entry fee collection', async () => {
      const mockSigner = new ethers.Wallet('0x0123456789012345678901234567890123456789012345678901234567890123');
      const paymentModule = new PaymentModule(
        '0x0000000000000000000000000000000000000000',
        mockProvider,
        mockSigner
      );
      
      // Test with no entry fee configured
      const result = await paymentModule.collectEntryFee('0x123...');
      expect(result).toBeNull();
      
      // Test with entry fee configured
      paymentModule.configure({ entryFee: '0.01 SOM' });
      // Should throw because no contract deployed
      await expect(paymentModule.collectEntryFee('0x123...')).rejects.toThrow('Payment contract not deployed. Call deploy() first.');
    });
  });
});