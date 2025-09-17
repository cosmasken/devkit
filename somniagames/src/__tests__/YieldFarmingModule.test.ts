import { YieldFarmingModule } from '../src/modules/YieldFarmingModule';
import { WalletConnector } from '../src/WalletConnector';

// Mock wallet connector for testing
class MockWalletConnector extends WalletConnector {
  constructor() {
    super({ rpcUrl: 'http://localhost:8545', chainId: 1337 });
  }
  
  async connect(): Promise<void> {
    // Mock implementation
  }
  
  async getAddress(): Promise<string> {
    return '0x0000000000000000000000000000000000000000';
  }
}

describe('YieldFarmingModule', () => {
  let yieldFarmingModule: YieldFarmingModule;
  let mockWalletConnector: MockWalletConnector;

  beforeEach(() => {
    mockWalletConnector = new MockWalletConnector();
    yieldFarmingModule = new YieldFarmingModule(mockWalletConnector);
  });

  it('should initialize correctly', () => {
    expect(yieldFarmingModule).toBeInstanceOf(YieldFarmingModule);
  });

  it('should throw error when calling methods without initialization', async () => {
    await expect(yieldFarmingModule.getPoolInfo(0)).rejects.toThrow('YieldFarmingModule not initialized');
    await expect(yieldFarmingModule.getUserInfo(0, '0x0000000000000000000000000000000000000000')).rejects.toThrow('YieldFarmingModule not initialized');
    await expect(yieldFarmingModule.getPendingRewards(0, '0x0000000000000000000000000000000000000000')).rejects.toThrow('YieldFarmingModule not initialized');
  });
});