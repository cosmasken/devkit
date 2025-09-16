// src/SimpleGame.ts
import { GameRegistry } from './GameRegistry';
import { Module } from './modules/Module';
import { NFTModule } from './modules/NFTModule';
import { PaymentModule } from './modules/PaymentModule';
import { ethers } from 'ethers';

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
    
    // Initialize with a mock contract address for now
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
    // Deploy all modules
    const moduleAddresses: Record<string, string> = {};
    
    for (const module of this.modules.values()) {
      const result = await module.deploy();
      moduleAddresses[module.getName()] = result.address;
    }
    
    // Deploy the main game (mock implementation)
    const gameAddress = '0x3456789012345678901234567890123456789012';
    
    return {
      gameAddress,
      moduleAddresses
    };
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