// src/__tests__/GameToken.test.ts
import { GameToken } from '../GameToken';
import { ethers } from 'ethers';

// Mock contract methods
const mockContract = {
  name: jest.fn(),
  symbol: jest.fn(),
  decimals: jest.fn(),
  totalSupply: jest.fn(),
  balanceOf: jest.fn(),
  transfer: jest.fn(),
  allowance: jest.fn(),
  approve: jest.fn(),
  transferFrom: jest.fn(),
  claimDailyTokens: jest.fn(),
  mint: jest.fn(),
  burn: jest.fn(),
  updateDailyClaimAmount: jest.fn(),
  updateClaimCooldown: jest.fn(),
  pause: jest.fn(),
  unpause: jest.fn(),
  lastClaimTime: jest.fn(),
  dailyClaimAmount: jest.fn(),
  claimCooldown: jest.fn(),
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

describe('GameToken', () => {
  let gameToken: GameToken;
  let mockProvider: any;
  let mockSigner: any;

  beforeEach(() => {
    mockProvider = {};
    mockSigner = {
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
    };
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a new instance of GameToken for each test
    gameToken = new GameToken(
      '0x1234567890123456789012345678901234567890',
      mockProvider,
      mockSigner
    );
  });

  describe('constructor', () => {
    it('should create an instance with provider only', () => {
      const token = new GameToken(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      expect(token).toBeInstanceOf(GameToken);
      expect(mockSigner.getAddress).not.toHaveBeenCalled();
    });

    it('should create an instance with provider and signer', () => {
      const token = new GameToken(
        '0x1234567890123456789012345678901234567890',
        mockProvider,
        mockSigner
      );
      
      expect(token).toBeInstanceOf(GameToken);
    });
  });

  describe('getName', () => {
    it('should return token name', async () => {
      mockContract.name.mockResolvedValue('Game Token');
      
      const name = await gameToken.getName();
      
      expect(name).toBe('Game Token');
    });

    it('should handle contract errors', async () => {
      mockContract.name.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameToken.getName()).rejects.toThrow('Failed to get token name: Contract error');
    });
  });

  describe('getSymbol', () => {
    it('should return token symbol', async () => {
      mockContract.symbol.mockResolvedValue('GT');
      
      const symbol = await gameToken.getSymbol();
      
      expect(symbol).toBe('GT');
    });

    it('should handle contract errors', async () => {
      mockContract.symbol.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameToken.getSymbol()).rejects.toThrow('Failed to get token symbol: Contract error');
    });
  });

  describe('getDecimals', () => {
    it('should return token decimals', async () => {
      mockContract.decimals.mockResolvedValue(ethers.BigNumber.from(18));
      
      const decimals = await gameToken.getDecimals();
      
      expect(decimals).toBe(18);
    });

    it('should handle contract errors', async () => {
      mockContract.decimals.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameToken.getDecimals()).rejects.toThrow('Failed to get token decimals: Contract error');
    });
  });

  describe('getTotalSupply', () => {
    it('should return total supply', async () => {
      const supply = ethers.BigNumber.from('1000000000000000000000000');
      mockContract.totalSupply.mockResolvedValue(supply);
      
      const result = await gameToken.getTotalSupply();
      
      expect(result).toBe(supply);
    });

    it('should handle contract errors', async () => {
      mockContract.totalSupply.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameToken.getTotalSupply()).rejects.toThrow('Failed to get total supply: Contract error');
    });
  });

  describe('getBalanceOf', () => {
    it('should throw error for invalid address', async () => {
      await expect(gameToken.getBalanceOf('invalid-address'))
        .rejects.toThrow('Invalid account address');
    });

    it('should return balance for valid address', async () => {
      const balance = ethers.BigNumber.from('1000000000000000000');
      mockContract.balanceOf.mockResolvedValue(balance);
      
      const result = await gameToken.getBalanceOf('0x1234567890123456789012345678901234567890');
      
      expect(result).toBe(balance);
    });

    it('should handle contract errors', async () => {
      mockContract.balanceOf.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameToken.getBalanceOf('0x1234567890123456789012345678901234567890'))
        .rejects.toThrow('Failed to get balance for 0x1234567890123456789012345678901234567890: Contract error');
    });
  });

  describe('transfer', () => {
    it('should throw error when no signer is provided', async () => {
      const tokenWithoutSigner = new GameToken(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(tokenWithoutSigner.transfer(
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        ethers.BigNumber.from('1000000000000000000')
      )).rejects.toThrow('Signer required to transfer tokens');
    });

    it('should throw error for invalid recipient address', async () => {
      await expect(gameToken.transfer(
        'invalid-address',
        ethers.BigNumber.from('1000000000000000000')
      )).rejects.toThrow('Invalid recipient address');
    });

    it('should transfer tokens successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xabc123' })
      };
      
      mockContract.transfer.mockResolvedValue(mockTx);
      
      const amount = ethers.BigNumber.from('1000000000000000000');
      const result = await gameToken.transfer(
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        amount
      );
      
      expect(result).toEqual({ transactionHash: '0xabc123' });
      expect(mockContract.transfer).toHaveBeenCalledWith(
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        amount
      );
    });

    it('should handle contract errors', async () => {
      mockContract.transfer.mockRejectedValue(new Error('Contract error'));
      
      const amount = ethers.BigNumber.from('1000000000000000000');
      await expect(gameToken.transfer(
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        amount
      )).rejects.toThrow('Failed to transfer tokens: Contract error');
    });
  });

  describe('getAllowance', () => {
    it('should throw error for invalid address', async () => {
      await expect(gameToken.getAllowance('invalid-address', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'))
        .rejects.toThrow('Invalid address');
      
      await expect(gameToken.getAllowance('0x1234567890123456789012345678901234567890', 'invalid-address'))
        .rejects.toThrow('Invalid address');
    });

    it('should return allowance for valid addresses', async () => {
      const allowance = ethers.BigNumber.from('500000000000000000');
      mockContract.allowance.mockResolvedValue(allowance);
      
      const result = await gameToken.getAllowance(
        '0x1234567890123456789012345678901234567890',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
      );
      
      expect(result).toBe(allowance);
    });

    it('should handle contract errors', async () => {
      mockContract.allowance.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameToken.getAllowance(
        '0x1234567890123456789012345678901234567890',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
      )).rejects.toThrow('Failed to get allowance: Contract error');
    });
  });

  describe('approve', () => {
    it('should throw error when no signer is provided', async () => {
      const tokenWithoutSigner = new GameToken(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(tokenWithoutSigner.approve(
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        ethers.BigNumber.from('1000000000000000000')
      )).rejects.toThrow('Signer required to approve spender');
    });

    it('should throw error for invalid spender address', async () => {
      await expect(gameToken.approve(
        'invalid-address',
        ethers.BigNumber.from('1000000000000000000')
      )).rejects.toThrow('Invalid spender address');
    });

    it('should approve spender successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xdef456' })
      };
      
      mockContract.approve.mockResolvedValue(mockTx);
      
      const amount = ethers.BigNumber.from('1000000000000000000');
      const result = await gameToken.approve(
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        amount
      );
      
      expect(result).toEqual({ transactionHash: '0xdef456' });
      expect(mockContract.approve).toHaveBeenCalledWith(
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        amount
      );
    });

    it('should handle contract errors', async () => {
      mockContract.approve.mockRejectedValue(new Error('Contract error'));
      
      const amount = ethers.BigNumber.from('1000000000000000000');
      await expect(gameToken.approve(
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        amount
      )).rejects.toThrow('Failed to approve spender: Contract error');
    });
  });

  describe('transferFrom', () => {
    it('should throw error when no signer is provided', async () => {
      const tokenWithoutSigner = new GameToken(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(tokenWithoutSigner.transferFrom(
        '0x1234567890123456789012345678901234567890',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        ethers.BigNumber.from('1000000000000000000')
      )).rejects.toThrow('Signer required to transfer tokens');
    });

    it('should throw error for invalid address', async () => {
      await expect(gameToken.transferFrom(
        'invalid-address',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        ethers.BigNumber.from('1000000000000000000')
      )).rejects.toThrow('Invalid address');
      
      await expect(gameToken.transferFrom(
        '0x1234567890123456789012345678901234567890',
        'invalid-address',
        ethers.BigNumber.from('1000000000000000000')
      )).rejects.toThrow('Invalid address');
    });

    it('should transfer tokens from address successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xghi789' })
      };
      
      mockContract.transferFrom.mockResolvedValue(mockTx);
      
      const amount = ethers.BigNumber.from('1000000000000000000');
      const result = await gameToken.transferFrom(
        '0x1234567890123456789012345678901234567890',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        amount
      );
      
      expect(result).toEqual({ transactionHash: '0xghi789' });
      expect(mockContract.transferFrom).toHaveBeenCalledWith(
        '0x1234567890123456789012345678901234567890',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        amount
      );
    });

    it('should handle contract errors', async () => {
      mockContract.transferFrom.mockRejectedValue(new Error('Contract error'));
      
      const amount = ethers.BigNumber.from('1000000000000000000');
      await expect(gameToken.transferFrom(
        '0x1234567890123456789012345678901234567890',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        amount
      )).rejects.toThrow('Failed to transfer tokens: Contract error');
    });
  });

  describe('claimDailyTokens', () => {
    it('should throw error when no signer is provided', async () => {
      const tokenWithoutSigner = new GameToken(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(tokenWithoutSigner.claimDailyTokens())
        .rejects.toThrow('Signer required to claim daily tokens');
    });

    it('should claim daily tokens successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xjkl012' })
      };
      
      mockContract.claimDailyTokens.mockResolvedValue(mockTx);
      
      const result = await gameToken.claimDailyTokens();
      
      expect(result).toEqual({ transactionHash: '0xjkl012' });
      expect(mockContract.claimDailyTokens).toHaveBeenCalled();
    });

    it('should handle contract errors', async () => {
      mockContract.claimDailyTokens.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameToken.claimDailyTokens())
        .rejects.toThrow('Failed to claim daily tokens: Contract error');
    });
  });

  describe('mint', () => {
    it('should throw error when no signer is provided', async () => {
      const tokenWithoutSigner = new GameToken(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(tokenWithoutSigner.mint(
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        ethers.BigNumber.from('1000000000000000000')
      )).rejects.toThrow('Signer required to mint tokens');
    });

    it('should throw error for invalid recipient address', async () => {
      await expect(gameToken.mint(
        'invalid-address',
        ethers.BigNumber.from('1000000000000000000')
      )).rejects.toThrow('Invalid recipient address');
    });

    it('should mint tokens successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xmno345' })
      };
      
      mockContract.mint.mockResolvedValue(mockTx);
      
      const amount = ethers.BigNumber.from('1000000000000000000');
      const result = await gameToken.mint(
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        amount
      );
      
      expect(result).toEqual({ transactionHash: '0xmno345' });
      expect(mockContract.mint).toHaveBeenCalledWith(
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        amount
      );
    });

    it('should handle contract errors', async () => {
      mockContract.mint.mockRejectedValue(new Error('Contract error'));
      
      const amount = ethers.BigNumber.from('1000000000000000000');
      await expect(gameToken.mint(
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        amount
      )).rejects.toThrow('Failed to mint tokens: Contract error');
    });
  });

  describe('burn', () => {
    it('should throw error when no signer is provided', async () => {
      const tokenWithoutSigner = new GameToken(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(tokenWithoutSigner.burn(ethers.BigNumber.from('1000000000000000000')))
        .rejects.toThrow('Signer required to burn tokens');
    });

    it('should burn tokens successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xpqr678' })
      };
      
      mockContract.burn.mockResolvedValue(mockTx);
      
      const amount = ethers.BigNumber.from('1000000000000000000');
      const result = await gameToken.burn(amount);
      
      expect(result).toEqual({ transactionHash: '0xpqr678' });
      expect(mockContract.burn).toHaveBeenCalledWith(amount);
    });

    it('should handle contract errors', async () => {
      mockContract.burn.mockRejectedValue(new Error('Contract error'));
      
      const amount = ethers.BigNumber.from('1000000000000000000');
      await expect(gameToken.burn(amount))
        .rejects.toThrow('Failed to burn tokens: Contract error');
    });
  });

  describe('burnFrom', () => {
    it('should throw error when no signer is provided', async () => {
      const tokenWithoutSigner = new GameToken(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(tokenWithoutSigner.burnFrom(
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        ethers.BigNumber.from('1000000000000000000')
      )).rejects.toThrow('Signer required to burn tokens');
    });

    it('should throw error for invalid address', async () => {
      await expect(gameToken.burnFrom(
        'invalid-address',
        ethers.BigNumber.from('1000000000000000000')
      )).rejects.toThrow('Invalid address');
    });

    it('should burn tokens from address successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xstu901' })
      };
      
      mockContract.burn.mockResolvedValue(mockTx);
      
      const amount = ethers.BigNumber.from('1000000000000000000');
      const result = await gameToken.burnFrom(
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        amount
      );
      
      expect(result).toEqual({ transactionHash: '0xstu901' });
      expect(mockContract.burn).toHaveBeenCalledWith(
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        amount
      );
    });

    it('should handle contract errors', async () => {
      mockContract.burn.mockRejectedValue(new Error('Contract error'));
      
      const amount = ethers.BigNumber.from('1000000000000000000');
      await expect(gameToken.burnFrom(
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        amount
      )).rejects.toThrow('Failed to burn tokens: Contract error');
    });
  });

  describe('updateDailyClaimAmount', () => {
    it('should throw error when no signer is provided', async () => {
      const tokenWithoutSigner = new GameToken(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(tokenWithoutSigner.updateDailyClaimAmount(100))
        .rejects.toThrow('Signer required to update daily claim amount');
    });

    it('should throw error for negative amount', async () => {
      await expect(gameToken.updateDailyClaimAmount(-1))
        .rejects.toThrow('Daily claim amount must be non-negative');
    });

    it('should update daily claim amount successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xvwx234' })
      };
      
      mockContract.updateDailyClaimAmount.mockResolvedValue(mockTx);
      
      const result = await gameToken.updateDailyClaimAmount(100);
      
      expect(result).toEqual({ transactionHash: '0xvwx234' });
      expect(mockContract.updateDailyClaimAmount).toHaveBeenCalledWith(100);
    });

    it('should handle contract errors', async () => {
      mockContract.updateDailyClaimAmount.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameToken.updateDailyClaimAmount(100))
        .rejects.toThrow('Failed to update daily claim amount: Contract error');
    });
  });

  describe('updateClaimCooldown', () => {
    it('should throw error when no signer is provided', async () => {
      const tokenWithoutSigner = new GameToken(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(tokenWithoutSigner.updateClaimCooldown(3600))
        .rejects.toThrow('Signer required to update claim cooldown');
    });

    it('should throw error for negative cooldown', async () => {
      await expect(gameToken.updateClaimCooldown(-1))
        .rejects.toThrow('Claim cooldown must be non-negative');
    });

    it('should update claim cooldown successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xxyz567' })
      };
      
      mockContract.updateClaimCooldown.mockResolvedValue(mockTx);
      
      const result = await gameToken.updateClaimCooldown(3600);
      
      expect(result).toEqual({ transactionHash: '0xxyz567' });
      expect(mockContract.updateClaimCooldown).toHaveBeenCalledWith(3600);
    });

    it('should handle contract errors', async () => {
      mockContract.updateClaimCooldown.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameToken.updateClaimCooldown(3600))
        .rejects.toThrow('Failed to update claim cooldown: Contract error');
    });
  });

  describe('pause', () => {
    it('should throw error when no signer is provided', async () => {
      const tokenWithoutSigner = new GameToken(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(tokenWithoutSigner.pause())
        .rejects.toThrow('Signer required to pause contract');
    });

    it('should pause contract successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xabcd890' })
      };
      
      mockContract.pause.mockResolvedValue(mockTx);
      
      const result = await gameToken.pause();
      
      expect(result).toEqual({ transactionHash: '0xabcd890' });
      expect(mockContract.pause).toHaveBeenCalled();
    });

    it('should handle contract errors', async () => {
      mockContract.pause.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameToken.pause())
        .rejects.toThrow('Failed to pause contract: Contract error');
    });
  });

  describe('unpause', () => {
    it('should throw error when no signer is provided', async () => {
      const tokenWithoutSigner = new GameToken(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      
      await expect(tokenWithoutSigner.unpause())
        .rejects.toThrow('Signer required to unpause contract');
    });

    it('should unpause contract successfully', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({ transactionHash: '0xefgh123' })
      };
      
      mockContract.unpause.mockResolvedValue(mockTx);
      
      const result = await gameToken.unpause();
      
      expect(result).toEqual({ transactionHash: '0xefgh123' });
      expect(mockContract.unpause).toHaveBeenCalled();
    });

    it('should handle contract errors', async () => {
      mockContract.unpause.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameToken.unpause())
        .rejects.toThrow('Failed to unpause contract: Contract error');
    });
  });

  describe('getLastClaimTime', () => {
    it('should throw error for invalid address', async () => {
      await expect(gameToken.getLastClaimTime('invalid-address'))
        .rejects.toThrow('Invalid account address');
    });

    it('should return last claim time for valid address', async () => {
      mockContract.lastClaimTime.mockResolvedValue(ethers.BigNumber.from(1234567890));
      
      const timestamp = await gameToken.getLastClaimTime('0x1234567890123456789012345678901234567890');
      
      expect(timestamp).toBe(1234567890);
    });

    it('should handle contract errors', async () => {
      mockContract.lastClaimTime.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameToken.getLastClaimTime('0x1234567890123456789012345678901234567890'))
        .rejects.toThrow('Failed to get last claim time: Contract error');
    });
  });

  describe('getDailyClaimAmount', () => {
    it('should return daily claim amount', async () => {
      mockContract.dailyClaimAmount.mockResolvedValue(ethers.BigNumber.from(100));
      
      const amount = await gameToken.getDailyClaimAmount();
      
      expect(amount).toBe(100);
    });

    it('should handle contract errors', async () => {
      mockContract.dailyClaimAmount.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameToken.getDailyClaimAmount())
        .rejects.toThrow('Failed to get daily claim amount: Contract error');
    });
  });

  describe('getClaimCooldown', () => {
    it('should return claim cooldown', async () => {
      mockContract.claimCooldown.mockResolvedValue(ethers.BigNumber.from(3600));
      
      const cooldown = await gameToken.getClaimCooldown();
      
      expect(cooldown).toBe(3600);
    });

    it('should handle contract errors', async () => {
      mockContract.claimCooldown.mockRejectedValue(new Error('Contract error'));
      
      await expect(gameToken.getClaimCooldown())
        .rejects.toThrow('Failed to get claim cooldown: Contract error');
    });
  });
});