/**
 * Tests for WebSocket Provider Infrastructure
 */

import { WebSocketProviderFactory, createWebSocketConfig } from '../src/core/WebSocketProvider';
import { BlockchainError } from '../src/index';

describe('WebSocketProvider', () => {
  describe('createWebSocketConfig', () => {
    it('should create config for somnia-testnet', () => {
      const config = createWebSocketConfig('somnia-testnet');
      
      expect(config.wsUrl).toBe('wss://dream-rpc.somnia.network/ws');
      expect(config.chainId).toBe(50312);
      expect(config.keepAliveInterval).toBe(30000);
      expect(config.maxReconnectAttempts).toBe(5);
      expect(config.reconnectDelay).toBe(1000);
    });

    it('should create config for somnia-mainnet', () => {
      const config = createWebSocketConfig('somnia-mainnet');
      
      expect(config.wsUrl).toBe('wss://api.infra.mainnet.somnia.network/ws');
      expect(config.chainId).toBe(54321);
      expect(config.keepAliveInterval).toBe(30000);
    });

    it('should create config for local network', () => {
      const config = createWebSocketConfig('local');
      
      expect(config.wsUrl).toBe('ws://localhost:8545');
      expect(config.chainId).toBe(1337);
      expect(config.maxReconnectAttempts).toBe(3);
    });

    it('should throw error for unsupported network', () => {
      expect(() => createWebSocketConfig('unsupported')).toThrow(BlockchainError);
      expect(() => createWebSocketConfig('unsupported')).toThrow('Unsupported network: unsupported');
    });
  });

  describe('WebSocketProviderFactory', () => {
    let factory: WebSocketProviderFactory;
    let config: any;

    beforeEach(() => {
      config = {
        wsUrl: 'ws://localhost:8545',
        chainId: 1337,
        keepAliveInterval: 5000,
        maxReconnectAttempts: 3,
        reconnectDelay: 1000
      };
      factory = new WebSocketProviderFactory(config);
    });

    afterEach(async () => {
      if (factory) {
        await factory.disconnect();
      }
    });

    it('should initialize with correct config', () => {
      expect(factory).toBeDefined();
      expect(factory.isConnected()).toBe(false);
      expect(factory.getProvider()).toBeNull();
    });

    it('should handle connection failure gracefully', async () => {
      // This test will fail to connect to localhost:8545 but should handle it gracefully
      await expect(factory.connect()).rejects.toThrow(BlockchainError);
      expect(factory.isConnected()).toBe(false);
    }, 10000); // 10 second timeout

    it('should provide network status when not connected', async () => {
      await expect(factory.getNetworkStatus()).rejects.toThrow(BlockchainError);
      await expect(factory.getNetworkStatus()).rejects.toThrow('WebSocket provider not initialized');
    });

    it('should handle event listeners when not connected', () => {
      expect(() => factory.addEventListener('test', () => {})).toThrow(BlockchainError);
      expect(() => factory.addEventListener('test', () => {})).toThrow('WebSocket provider not initialized');
    });

    it('should handle disconnect when not connected', async () => {
      // Should not throw error when disconnecting without connection
      await expect(factory.disconnect()).resolves.not.toThrow();
    });
  });
});