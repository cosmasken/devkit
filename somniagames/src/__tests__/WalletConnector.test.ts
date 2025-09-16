// src/__tests__/WalletConnector.test.ts
import { WalletConnector } from '../WalletConnector';

// Mock window.ethereum
const mockEthereum = {
  request: jest.fn()
};

// Mock ethers providers and signer
const mockProvider = {
  getSigner: jest.fn()
};

const mockSigner = {
  getAddress: jest.fn()
};

// Mock ethers constructors
jest.mock('ethers', () => {
  const originalEthers = jest.requireActual('ethers');
  return {
    ...originalEthers,
    ethers: {
      ...originalEthers.ethers,
      providers: {
        ...originalEthers.ethers.providers,
        Web3Provider: jest.fn().mockImplementation(() => mockProvider)
      }
    }
  };
});

describe('WalletConnector', () => {
  let walletConnector: WalletConnector;

  beforeEach(() => {
    walletConnector = new WalletConnector();
    jest.clearAllMocks();
    
    // Setup window mock
    (global as any).window = {
      ethereum: undefined
    };
  });

  afterEach(() => {
    // Clean up window mock
    (global as any).window = undefined;
  });

  describe('connect', () => {
    it('should return false when window is undefined', async () => {
      (global as any).window = undefined;

      const result = await walletConnector.connect();
      
      expect(result).toBe(false);
    });

    it('should return false when window.ethereum is undefined', async () => {
      (global as any).window = {
        ethereum: undefined
      };

      const result = await walletConnector.connect();
      
      expect(result).toBe(false);
    });

    it('should connect successfully when ethereum is available', async () => {
      (global as any).window = {
        ethereum: mockEthereum
      };

      mockEthereum.request.mockResolvedValue([]);
      mockProvider.getSigner.mockReturnValue(mockSigner);
      mockSigner.getAddress.mockResolvedValue('0x1234567890123456789012345678901234567890');

      const result = await walletConnector.connect();
      
      expect(result).toBe(true);
      expect(mockEthereum.request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' });
    });

    it('should handle connection errors', async () => {
      (global as any).window = {
        ethereum: mockEthereum
      };

      mockEthereum.request.mockRejectedValue(new Error('User rejected request'));

      const result = await walletConnector.connect();
      
      expect(result).toBe(false);
    });
  });

  describe('getProvider', () => {
    it('should return null when not connected', () => {
      expect(walletConnector.getProvider()).toBeNull();
    });

    it('should return provider when connected', async () => {
      (global as any).window = {
        ethereum: mockEthereum
      };

      mockEthereum.request.mockResolvedValue([]);
      mockProvider.getSigner.mockReturnValue(mockSigner);
      mockSigner.getAddress.mockResolvedValue('0x1234567890123456789012345678901234567890');

      await walletConnector.connect();
      
      expect(walletConnector.getProvider()).toBe(mockProvider);
    });
  });

  describe('getSigner', () => {
    it('should return null when not connected', () => {
      expect(walletConnector.getSigner()).toBeNull();
    });

    it('should return signer when connected', async () => {
      (global as any).window = {
        ethereum: mockEthereum
      };

      mockEthereum.request.mockResolvedValue([]);
      mockProvider.getSigner.mockReturnValue(mockSigner);
      mockSigner.getAddress.mockResolvedValue('0x1234567890123456789012345678901234567890');

      await walletConnector.connect();
      
      expect(walletConnector.getSigner()).toBe(mockSigner);
    });
  });

  describe('getAccount', () => {
    it('should return null when not connected', async () => {
      const account = await walletConnector.getAccount();
      expect(account).toBeNull();
    });

    it('should return account address when connected', async () => {
      (global as any).window = {
        ethereum: mockEthereum
      };

      mockEthereum.request.mockResolvedValue([]);
      mockProvider.getSigner.mockReturnValue(mockSigner);
      mockSigner.getAddress.mockResolvedValue('0x1234567890123456789012345678901234567890');

      await walletConnector.connect();
      
      const account = await walletConnector.getAccount();
      expect(account).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should handle account retrieval errors', async () => {
      (global as any).window = {
        ethereum: mockEthereum
      };

      mockEthereum.request.mockResolvedValue([]);
      mockProvider.getSigner.mockReturnValue(mockSigner);
      mockSigner.getAddress.mockRejectedValue(new Error('Failed to get address'));

      await walletConnector.connect();
      
      const account = await walletConnector.getAccount();
      expect(account).toBeNull();
    });
  });
});