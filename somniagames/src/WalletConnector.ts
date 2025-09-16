// src/WalletConnector.ts
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum: any;
  }
}

export class WalletConnector {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;

  /**
   * Connect to MetaMask or other injected wallet
   * @returns True if connection successful, false otherwise
   */
  async connect(): Promise<boolean> {
    // This code only runs in browser environment
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      console.error('Ethereum provider not found. Please install MetaMask.');
      return false;
    }

    try {
      this.provider = new ethers.providers.Web3Provider((window as any).ethereum);
      await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      this.signer = this.provider.getSigner();
      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  }

  /**
   * Get the connected provider
   * @returns Ethers provider or null if not connected
   */
  getProvider(): ethers.providers.Web3Provider | null {
    return this.provider;
  }

  /**
   * Get the connected signer
   * @returns Ethers signer or null if not connected
   */
  getSigner(): ethers.Signer | null {
    return this.signer;
  }

  /**
   * Get the connected account address
   * @returns Account address or null if not connected
   */
  async getAccount(): Promise<string | null> {
    if (!this.signer) return null;
    try {
      return await this.signer.getAddress();
    } catch (error) {
      console.error('Failed to get account:', error);
      return null;
    }
  }
}