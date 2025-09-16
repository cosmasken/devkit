// src/modules/NFTModule.ts
import { Module, DeploymentResult } from './Module';
import { ethers } from 'ethers';
import { deployContract, getContract, executeTransaction } from './DeploymentUtils';

export interface NFTAssetConfig {
  name: string;
  symbol: string;
  uri: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  attributes?: Record<string, any>;
}

export class NFTModule extends Module {
  private assets: Map<string, NFTAssetConfig> = new Map();
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
    if (this.contractAddress && this.contractAddress !== '0x0000000000000000000000000000000000000000') {
      this.contract = getContract(
        this.provider,
        this.signer || undefined,
        'GameAsset',
        this.contractAddress
      );
    }
  }
  
  async deploy(): Promise<DeploymentResult> {
    if (!this.signer) {
      throw new Error('Signer required to deploy contracts');
    }
    
    // Deploy the GameAsset contract
    const result = await deployContract(this.signer, 'GameAsset');
    
    // Store the contract instance
    this.contractAddress = result.address;
    this.contract = getContract(
      this.provider,
      this.signer,
      'GameAsset',
      result.address
    );
    
    return result;
  }
  
  defineAssets(assets: Record<string, NFTAssetConfig>): void {
    Object.entries(assets).forEach(([key, config]) => {
      this.assets.set(key, config);
    });
  }
  
  getAssets(): Map<string, NFTAssetConfig> {
    return this.assets;
  }
  
  getName(): string {
    return 'NFTModule';
  }
  
  async mintAsset(to: string, assetId: string, gameId: number = 1): Promise<any> {
    if (!this.signer) {
      throw new Error('Signer required to mint assets');
    }
    
    if (!this.contract) {
      throw new Error('Contract not deployed. Call deploy() first.');
    }
    
    const asset = this.assets.get(assetId);
    if (!asset) {
      throw new Error(`Asset ${assetId} not found`);
    }
    
    // Mint the asset using the contract
    try {
      const receipt = await executeTransaction(
        this.contract,
        'createAsset',
        [
          to,
          asset.name,
          asset.name + ' description',
          asset.uri,
          gameId,
          this.getRarityValue(asset.rarity)
        ]
      );
      
      return {
        tokenId: 1, // In a real implementation, we'd extract this from the event
        transactionHash: receipt.transactionHash,
        owner: to,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      throw new Error(`Failed to mint asset: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  private getRarityValue(rarity: string): number {
    switch (rarity) {
      case 'common': return 1;
      case 'rare': return 2;
      case 'epic': return 3;
      case 'legendary': return 4;
      default: return 1;
    }
  }
}