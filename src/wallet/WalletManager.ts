/**
 * Wallet Manager - Handles wallet connections and operations
 */

import Web3 from 'web3';
import { WalletConnectionError } from '../core/errors';

export class WalletManager {
  private web3: Web3;
  private network: string;
  private connectedAddress?: string;

  constructor(web3: Web3, network: string = 'local') {
    this.web3 = web3;
    this.network = network;
  }

  /**
   * Connects to a user's wallet
   */
  async connectWallet(walletAddress?: string): Promise<string> {
    try {
      if (walletAddress) {
        this.connectedAddress = walletAddress;
        return walletAddress;
      }

      // Try to connect to MetaMask or other injected wallet
      if (typeof globalThis !== 'undefined' && (globalThis as any).window?.ethereum) {
        const accounts = await (globalThis as any).window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts && accounts.length > 0) {
          this.connectedAddress = accounts[0];
          return accounts[0];
        }
      }

      // Fallback to first account from web3
      const accounts = await this.web3.eth.getAccounts();
      if (accounts && accounts.length > 0) {
        this.connectedAddress = accounts[0];
        return accounts[0];
      }

      throw new WalletConnectionError('No wallet accounts available');
    } catch (error: any) {
      throw new WalletConnectionError(`Failed to connect wallet: ${error.message}`);
    }
  }

  /**
   * Gets the currently connected wallet address
   */
  getConnectedAddress(): string | undefined {
    return this.connectedAddress;
  }

  /**
   * Checks if wallet is connected
   */
  isConnected(): boolean {
    return !!this.connectedAddress;
  }

  /**
   * Checks if wallet is connected (alias for isConnected)
   */
  isWalletConnected(): boolean {
    return this.isConnected();
  }

  /**
   * Disconnects the wallet
   */
  disconnect(): void {
    this.connectedAddress = undefined;
  }

  /**
   * Gets the Web3 instance
   */
  getWeb3(): Web3 {
    return this.web3;
  }

  /**
   * Ensures wallet is connected, throws error if not
   */
  ensureWalletConnected(): void {
    if (!this.connectedAddress) {
      throw new WalletConnectionError('Wallet not connected. Please connect wallet first.');
    }
  }

  /**
   * Gets the connected wallet address, throws error if not connected
   */
  getWalletAddress(): string {
    this.ensureWalletConnected();
    return this.connectedAddress!;
  }
}
