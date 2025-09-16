// src/__tests__/WalletIntegration.test.ts
import { WalletConnector } from '../WalletConnector';
import { ethers } from 'ethers';

// Mock console.error
console.error = jest.fn();

// Mock Ethereum provider
const mockEthereum = {
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn()
};

describe('Wallet Integration', () => {
  let walletConnector: WalletConnector;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up global window object
    (global as any).window = {
      ethereum: mockEthereum
    };
    
    walletConnector = new WalletConnector();
  });

  describe('Wallet Connection', () => {
    it('should connect to wallet successfully', async () => {
      // Mock successful connection
      mockEthereum.request
        .mockResolvedValueOnce([]); // eth_requestAccounts
      
      const success = await walletConnector.connect();
      
      expect(success).toBe(true);
      expect(mockEthereum.request).toHaveBeenCalledTimes(1);
      expect(mockEthereum.request).toHaveBeenNthCalledWith(1, { method: 'eth_requestAccounts' });
    });

    it('should fail to connect when wallet is not installed', async () => {
      // Remove ethereum from window
      (global as any).window = {};
      
      const success = await walletConnector.connect();
      
      expect(success).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Ethereum provider not found. Please install MetaMask.');
    });

    it('should handle connection rejection', async () => {
      // Mock user rejecting connection
      mockEthereum.request.mockRejectedValue(new Error('User rejected request'));
      
      const success = await walletConnector.connect();
      
      expect(success).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Account Management', () => {
    it('should get account address when connected', async () => {
      // Mock successful connection
      mockEthereum.request
        .mockResolvedValueOnce([]); // eth_requestAccounts
      
      await walletConnector.connect();
      
      // Mock the signer getAddress method
      const mockSigner = {
        getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
      };
      
      // Use reflection to set the private signer property
      (walletConnector as any).signer = mockSigner;
      
      const account = await walletConnector.getAccount();
      
      expect(account).toBe('0x1234567890123456789012345678901234567890');
      expect(mockSigner.getAddress).toHaveBeenCalled();
    });

    it('should return null when not connected', async () => {
      const account = await walletConnector.getAccount();
      expect(account).toBeNull();
    });

    it('should handle account retrieval error', async () => {
      // Mock successful connection
      mockEthereum.request
        .mockResolvedValueOnce([]); // eth_requestAccounts
      
      await walletConnector.connect();
      
      // Mock the signer getAddress method to throw an error
      const mockSigner = {
        getAddress: jest.fn().mockRejectedValue(new Error('Failed to get address'))
      };
      
      // Use reflection to set the private signer property
      (walletConnector as any).signer = mockSigner;
      
      const account = await walletConnector.getAccount();
      
      expect(account).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Provider and Signer', () => {
    it('should return null provider and signer when not connected', () => {
      expect(walletConnector.getProvider()).toBeNull();
      expect(walletConnector.getSigner()).toBeNull();
    });

    it('should return provider and signer after successful connection', async () => {
      // Mock successful connection
      mockEthereum.request
        .mockResolvedValueOnce([]);
      
      await walletConnector.connect();
      
      expect(walletConnector.getProvider()).toBeInstanceOf(ethers.providers.Web3Provider);
      expect(walletConnector.getSigner()).toBeInstanceOf(Object); // Signer instance
    });
  });
});