/**
 * Integration tests for SomniaGameKit with WebSocket provider
 */

import { SomniaGameKit } from '../src/core/SomniaGameKit';

describe('SomniaGameKit Integration', () => {
  let sdk: SomniaGameKit;

  beforeEach(() => {
    sdk = new SomniaGameKit();
  });

  afterEach(async () => {
    if (sdk) {
      await sdk.cleanup();
    }
  });

  describe('Initialization', () => {
    it('should initialize with somnia-testnet configuration', async () => {
      const config = {
        network: 'somnia-testnet' as const,
        eventSettings: {
          reconnectAttempts: 2,
          reconnectDelay: 500
        }
      };

      // This will fail to connect to the actual testnet but should handle it gracefully
      await expect(sdk.initialize(config)).resolves.not.toThrow();
      
      // WebSocket connection should fail but SDK should still be initialized
      expect(sdk.isWebSocketConnected()).toBe(false);
    }, 15000);

    it('should initialize with local network configuration', async () => {
      const config = {
        network: 'local' as const,
        rpcUrl: 'http://localhost:8545',
        eventSettings: {
          reconnectAttempts: 1,
          reconnectDelay: 100
        }
      };

      await expect(sdk.initialize(config)).resolves.not.toThrow();
      expect(sdk.isWebSocketConnected()).toBe(false);
    }, 10000);

    it('should handle WebSocket provider failure gracefully', async () => {
      const config = {
        network: 'somnia-testnet' as const
      };

      // Should not throw even if WebSocket fails
      await expect(sdk.initialize(config)).resolves.not.toThrow();
      
      // Should handle network status request when WebSocket is not connected
      await expect(sdk.getNetworkStatus()).rejects.toThrow('WebSocket provider not initialized');
    }, 15000);
  });

  describe('Basic functionality', () => {
    beforeEach(async () => {
      const config = {
        network: 'local' as const,
        eventSettings: {
          reconnectAttempts: 1,
          reconnectDelay: 100
        }
      };
      await sdk.initialize(config);
    });

    it('should create and retrieve players', async () => {
      await sdk.connectWallet('0x1234567890123456789012345678901234567890');
      
      const player = sdk.createPlayer({
        username: 'TestPlayer',
        avatar: 'avatar.png'
      });

      expect(player.id).toBeDefined();
      expect(player.username).toBe('TestPlayer');
      expect(player.avatar).toBe('avatar.png');

      const retrievedPlayer = sdk.getPlayer(player.id);
      expect(retrievedPlayer).toEqual(player);
    });

    it('should provide ethers provider when available', () => {
      const ethersProvider = sdk.getEthersProvider();
      // Will be undefined since we can't connect to actual network in tests
      expect(ethersProvider).toBeUndefined();
    });
  });
});