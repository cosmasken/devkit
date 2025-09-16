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
      const game = createSimpleGame('Deploy Test', mockProvider);
      
      // Mock the deploy methods
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
});