// src/modules/Module.ts
import { ethers } from 'ethers';

export interface DeploymentResult {
  address: string;
  transactionHash: string;
  blockNumber: number;
}

export abstract class Module {
  protected provider: ethers.providers.Provider;
  protected signer: ethers.Signer | null = null;
  protected contractAddress: string;
  
  constructor(
    contractAddress: string,
    provider: ethers.providers.Provider,
    signer?: ethers.Signer
  ) {
    this.contractAddress = contractAddress;
    this.provider = provider;
    if (signer) {
      this.signer = signer;
    }
  }
  
  abstract initialize(): Promise<void>;
  abstract deploy(): Promise<DeploymentResult>;
  abstract getName(): string;
}