/**
 * WebSocket Provider Infrastructure for Somnia Testnet Integration
 * 
 * This module provides WebSocket connectivity to the Somnia testnet using ethers.js
 * with connection health monitoring and automatic reconnection capabilities.
 */

import { ethers } from 'ethers';
import { BlockchainError, NetworkConnectionError } from './errors';

export interface WebSocketConfig {
  wsUrl: string;
  chainId: number;
  keepAliveInterval: number;
  maxReconnectAttempts: number;
  reconnectDelay: number;
}

export interface NetworkStatus {
  connected: boolean;
  chainId: number;
  blockNumber: number;
  gasPrice: string;
  lastUpdated: Date;
}

export class WebSocketProviderFactory {
  private provider: ethers.WebSocketProvider | null = null;
  private config: WebSocketConfig;
  private keepAliveTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private isReconnecting = false;
  private eventListeners: Map<string, (...args: any[]) => void> = new Map();

  constructor(config: WebSocketConfig) {
    this.config = config;
  }

  /**
   * Creates and establishes a WebSocket connection to Somnia testnet
   */
  async connect(): Promise<ethers.WebSocketProvider> {
    try {
      console.log(`Connecting to Somnia WebSocket: ${this.config.wsUrl}`);

      this.provider = new ethers.WebSocketProvider(this.config.wsUrl);

      // Wait for the connection to be ready
      await this.provider._waitUntilReady();

      // Verify we're connected to the correct network
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== this.config.chainId) {
        throw new BlockchainError(
          `Network mismatch: expected ${this.config.chainId}, got ${network.chainId}`,
          'NETWORK_MISMATCH'
        );
      }

      console.log(`WebSocket connected to Somnia testnet (Chain ID: ${network.chainId})`);

      // Set up connection health monitoring
      this.startHealthMonitoring();

      // Set up error handling
      this.setupErrorHandling();

      // Reset reconnection attempts on successful connection
      this.reconnectAttempts = 0;
      this.isReconnecting = false;

      return this.provider;
    } catch (error: any) {
      console.error('Failed to connect WebSocket:', error);
      
      // Check if this is a network connectivity issue
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || 
          error.message?.includes('connect') || error.message?.includes('network')) {
        throw new NetworkConnectionError(
          `Network connection failed: ${error.message}`
        );
      }
      
      throw new BlockchainError(
        `Failed to establish WebSocket connection: ${error.message}`,
        'WEBSOCKET_CONNECTION_ERROR',
        error
      );
    }
  }

  /**
   * Gets the current WebSocket provider instance
   */
  getProvider(): ethers.WebSocketProvider | null {
    return this.provider;
  }

  /**
   * Checks if the WebSocket connection is active
   */
  isConnected(): boolean {
    return this.provider !== null && this.provider.websocket && this.provider.websocket.readyState === 1; // WebSocket.OPEN
  }

  /**
   * Gets the current network status
   */
  async getNetworkStatus(): Promise<NetworkStatus> {
    if (!this.provider) {
      throw new BlockchainError('WebSocket provider not initialized', 'PROVIDER_NOT_INITIALIZED');
    }

    try {
      const [blockNumber, gasPrice, network] = await Promise.all([
        this.provider.getBlockNumber(),
        this.provider.getFeeData().then(fee => fee.gasPrice?.toString() || '0'),
        this.provider.getNetwork()
      ]);

      return {
        connected: this.isConnected(),
        chainId: Number(network.chainId),
        blockNumber,
        gasPrice,
        lastUpdated: new Date()
      };
    } catch (error: any) {
      throw new BlockchainError(
        `Failed to get network status: ${error.message}`,
        'NETWORK_STATUS_ERROR',
        error
      );
    }
  }

  /**
   * Starts the connection health monitoring with keepalive mechanism
   */
  private startHealthMonitoring(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
    }

    this.keepAliveTimer = setInterval(async () => {
      try {
        if (!this.provider || !this.isConnected()) {
          console.warn('WebSocket connection lost, attempting reconnection...');
          await this.reconnect();
          return;
        }

        // Perform a lightweight operation to check connection health
        await this.provider.getBlockNumber();
        console.log('WebSocket connection health check passed');
      } catch (error) {
        console.error('WebSocket health check failed:', error);
        await this.reconnect();
      }
    }, this.config.keepAliveInterval);

    // Prevent timer from keeping the process alive during tests
    this.keepAliveTimer.unref();
  }

  /**
   * Sets up error handling for the WebSocket connection
   */
  private setupErrorHandling(): void {
    if (!this.provider) return;

    // Use ethers.js event handling for network events
    this.provider.on('network', (newNetwork, oldNetwork) => {
      if (oldNetwork) {
        console.log('Network changed:', oldNetwork.chainId, '->', newNetwork.chainId);
      }
    });

    // Monitor for errors - ethers.js will handle WebSocket errors internally
    this.provider.on('error', (error: any) => {
      console.error('WebSocket provider error:', error);
      this.reconnect();
    });

    // Note: WebSocket connection monitoring is handled by the health check interval
    // ethers.js manages the underlying WebSocket connection lifecycle
  }

  /**
   * Attempts to reconnect to the WebSocket with exponential backoff
   */
  private async reconnect(): Promise<void> {
    if (this.isReconnecting || this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
        console.error('Maximum reconnection attempts reached');
        throw new BlockchainError(
          'Failed to reconnect after maximum attempts',
          'MAX_RECONNECT_ATTEMPTS_REACHED'
        );
      }
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts} in ${delay}ms`);

    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      // Clean up existing connection
      await this.disconnect();

      // Establish new connection
      await this.connect();

      // Re-register event listeners
      this.reregisterEventListeners();

      console.log('WebSocket reconnection successful');
    } catch (error) {
      console.error('Reconnection failed:', error);
      this.isReconnecting = false;

      // Try again if we haven't reached max attempts
      if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
        this.reconnectTimer = setTimeout(() => this.reconnect(), 1000);
        this.reconnectTimer.unref(); // Prevent keeping process alive
      }
    }
  }

  /**
   * Re-registers event listeners after reconnection
   */
  private reregisterEventListeners(): void {
    if (!this.provider) return;

    for (const [eventName, listener] of this.eventListeners) {
      this.provider.on(eventName, listener);
    }
  }

  /**
   * Registers an event listener and stores it for reconnection
   */
  addEventListener(eventName: string, listener: (...args: any[]) => void): void {
    if (!this.provider) {
      throw new BlockchainError('WebSocket provider not initialized', 'PROVIDER_NOT_INITIALIZED');
    }

    this.eventListeners.set(eventName, listener);
    this.provider.on(eventName, listener);
  }

  /**
   * Removes an event listener
   */
  removeEventListener(eventName: string): void {
    if (!this.provider) return;

    const listener = this.eventListeners.get(eventName);
    if (listener) {
      this.provider.off(eventName, listener);
      this.eventListeners.delete(eventName);
    }
  }

  /**
   * Disconnects the WebSocket connection and cleans up resources
   */
  async disconnect(): Promise<void> {
    console.log('Disconnecting WebSocket...');

    // Clear health monitoring timer
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }

    // Clear reconnection timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Remove all event listeners
    if (this.provider) {
      for (const [eventName, listener] of this.eventListeners) {
        this.provider.off(eventName, listener);
      }

      // Close the WebSocket connection
      if (this.provider.websocket && this.provider.websocket.readyState === 1) { // WebSocket.OPEN
        this.provider.websocket.close();
      }
    }

    this.provider = null;
    this.eventListeners.clear();
    this.reconnectAttempts = 0;
    this.isReconnecting = false;

    console.log('WebSocket disconnected');
  }
}

/**
 * Factory function to create WebSocket provider configurations for different networks
 */
export function createWebSocketConfig(network: string): WebSocketConfig {
  const configs: Record<string, WebSocketConfig> = {
    'somnia-testnet': {
      wsUrl: 'wss://dream-rpc.somnia.network/ws',
      chainId: 50312,
      keepAliveInterval: 30000, // 30 seconds
      maxReconnectAttempts: 5,
      reconnectDelay: 1000 // Start with 1 second, exponential backoff
    },
    'somnia-mainnet': {
      wsUrl: 'wss://api.infra.mainnet.somnia.network/ws',
      chainId: 54321,
      keepAliveInterval: 30000,
      maxReconnectAttempts: 5,
      reconnectDelay: 1000
    },
    'local': {
      wsUrl: 'ws://localhost:8545',
      chainId: 1337,
      keepAliveInterval: 30000,
      maxReconnectAttempts: 3,
      reconnectDelay: 1000
    }
  };

  const config = configs[network];
  if (!config) {
    throw new BlockchainError(`Unsupported network: ${network}`, 'UNSUPPORTED_NETWORK');
  }

  return config;
}