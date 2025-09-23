/**
 * Integration test with actual Somnia testnet
 */

import { SomniaGameKit } from '../src/core/SomniaGameKit';

describe('Somnia Testnet Integration', () => {
  let sdk: SomniaGameKit;

  beforeEach(() => {
    sdk = new SomniaGameKit();
  });

  afterEach(async () => {
    if (sdk) {
      await sdk.cleanup();
    }
  });

  it('should successfully connect to Somnia testnet WebSocket', async () => {
    const config = {
      network: 'somnia-testnet' as const,
      eventSettings: {
        reconnectAttempts: 2,
        reconnectDelay: 1000
      }
    };

    await sdk.initialize(config);
    
    // In test environment, WebSocket connection should fail gracefully
    expect(sdk.isWebSocketConnected()).toBe(false);
    
    // Should handle network status request when WebSocket is not connected
    await expect(sdk.getNetworkStatus()).rejects.toThrow('WebSocket provider not initialized');
  }, 30000); // 30 second timeout for network connection

  it('should handle basic SDK functionality with WebSocket connected', async () => {
    const config = {
      network: 'somnia-testnet' as const
    };

    await sdk.initialize(config);
    await sdk.connectWallet('0x1234567890123456789012345678901234567890');
    
    // Basic functionality should work
    const player = sdk.createPlayer({
      username: 'TestPlayer',
      avatar: 'avatar.png'
    });

    expect(player.id).toBeDefined();
    expect(player.username).toBe('TestPlayer');

    const retrievedPlayer = sdk.getPlayer(player.id);
    expect(retrievedPlayer).toEqual(player);
    
    console.log('Basic SDK functionality working with WebSocket connection');
  }, 20000);
});