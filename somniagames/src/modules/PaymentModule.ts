// src/modules/PaymentModule.ts
import { Module, DeploymentResult } from './Module';
import { ethers } from 'ethers';
import { deployContract, getContract, executeTransaction } from './DeploymentUtils';

export interface PaymentConfig {
  entryFee?: string;
  winReward?: string;
  participationReward?: string;
  currencies?: string[];
}

export class PaymentModule extends Module {
  private config: PaymentConfig = {};
  private contract: ethers.Contract | null = null;
  
  constructor(
    contractAddress: string,
    provider: ethers.providers.Provider,
    signer?: ethers.Signer
  ) {
    super(contractAddress, provider, signer);
  }
  
  async initialize(): Promise<void> {
    // Initialize with existing contract if it exists
    if (this.contractAddress && this.contractAddress !== '0x0000000000000000000000000000000000000000' && this.signer) {
      this.contract = getContract(
        this.provider,
        this.signer,
        'PaymentSystem',
        this.contractAddress
      );
    }
  }
  
  async deploy(): Promise<DeploymentResult> {
    if (!this.signer) {
      throw new Error('Signer required to deploy contracts');
    }
    
    // Deploy the PaymentSystem contract
    const result = await deployContract(this.signer, 'PaymentSystem');
    
    // Store the contract instance
    this.contractAddress = result.address;
    this.contract = getContract(
      this.provider,
      this.signer,
      'PaymentSystem',
      result.address
    );
    
    return result;
  }
  
  configure(config: PaymentConfig): void {
    this.config = { ...this.config, ...config };
  }
  
  getConfig(): PaymentConfig {
    return this.config;
  }
  
  getName(): string {
    return 'PaymentModule';
  }
  
  async processPayment(from: string, to: string, amount: string, currency: string = 'SOM'): Promise<any> {
    if (!this.signer) {
      throw new Error('Signer required to process payments');
    }
    
    if (!this.contract) {
      throw new Error('Payment contract not deployed. Call deploy() first.');
    }
    
    // Convert amount to proper format (assuming SOM has 18 decimals)
    const amountBN = ethers.utils.parseEther(amount);
    
    try {
      // Process the payment using the contract
      const receipt = await executeTransaction(
        this.contract,
        'processPayment',
        [from, to, amountBN]
      );
      
      return {
        transactionHash: receipt.transactionHash,
        amount,
        currency,
        from,
        to,
        timestamp: Date.now(),
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      throw new Error(`Failed to process payment: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  async collectEntryFee(player: string): Promise<any> {
    if (!this.config.entryFee) {
      return null; // No entry fee required
    }
    
    return this.processPayment(player, '0xGameContract', this.config.entryFee);
  }
}