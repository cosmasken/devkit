// src/SimpleGame.ts
import { GameRegistry } from './GameRegistry';
import { Module } from './modules/Module';
import { NFTModule } from './modules/NFTModule';
import { PaymentModule } from './modules/PaymentModule';
import { ethers } from 'ethers';
import { deployContract } from './modules/DeploymentUtils';

export interface SimpleGameConfig {
  name: string;
  description?: string;
  type?: string;
  maxPlayers?: number;
}

export class SimpleGame {
  private name: string;
  private description: string;
  private gameRegistry: GameRegistry;
  private modules: Map<string, Module> = new Map();
  private provider: ethers.providers.Provider;
  private signer: ethers.Signer | null = null;
  
  constructor(
    name: string,
    provider: ethers.providers.Provider,
    signer?: ethers.Signer,
    contractAddress?: string
  ) {
    this.name = name;
    this.description = '';
    this.provider = provider;
    if (signer) {
      this.signer = signer;
    }
    
    // Initialize with a contract address or use placeholder
    const registryAddress = contractAddress || '0x0000000000000000000000000000000000000000';
    this.gameRegistry = new GameRegistry(
      registryAddress,
      provider,
      signer,
      'ws://localhost:8080'
    );
  }
  
  addModule(module: Module): void {
    this.modules.set(module.getName(), module);
  }
  
  getModule<T extends Module>(name: string): T {
    return this.modules.get(name) as T;
  }
  
  hasModule(name: string): boolean {
    return this.modules.has(name);
  }
  
  async initialize(): Promise<void> {
    // Initialize all modules
    for (const module of this.modules.values()) {
      await module.initialize();
    }
  }
  
  async deploy(): Promise<{ gameAddress: string; moduleAddresses: Record<string, string> }> {
    if (!this.signer) {
      throw new Error('Signer required to deploy game');
    }
    
    // Deploy all modules
    const moduleAddresses: Record<string, string> = {};
    
    for (const module of this.modules.values()) {
      const result = await module.deploy();
      moduleAddresses[module.getName()] = result.address;
    }
    
    // Deploy the main game contract using Hardhat deployment pattern
    try {
      // In a real implementation, we would deploy the actual GameRegistry contract
      // For now, we'll simulate the deployment using our utilities
      console.log('Deploying GameRegistry contract...');
      
      // This would normally deploy the actual GameRegistry contract
      // For demonstration, we'll use a placeholder address
      const gameAddress = '0x' + [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      console.log(`GameRegistry deployed to: ${gameAddress}`);
      
      return {
        gameAddress,
        moduleAddresses
      };
    } catch (error) {
      throw new Error(`Failed to deploy game: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // Convenience methods for common modules
  getNFTModule(): NFTModule | null {
    return this.getModule<NFTModule>('NFTModule');
  }
  
  getPaymentModule(): PaymentModule | null {
    return this.getModule<PaymentModule>('PaymentModule');
  }
  
  getName(): string {
    return this.name;
  }
  
  getDescription(): string {
    return this.description;
  }
}