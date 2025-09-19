/**
 * Contract artifacts and interfaces for Somnia GameKit
 * Generated from compiled Solidity contracts
 */

import GameContractArtifact from './GameContract.json';
import GameNFTArtifact from './GameNFT.json';

export interface ContractArtifact {
    contractName: string;
    abi: any[];
    bytecode: string;
    deployedBytecode: string;
    sourceFile: string;
    compiler: {
        name: string;
        version: string;
    };
    compiledAt: string;
}

// Export contract artifacts
export const GAME_CONTRACT_ARTIFACT = GameContractArtifact as ContractArtifact;
export const GAME_NFT_ARTIFACT = GameNFTArtifact as ContractArtifact;

// Export ABIs for convenience
export const GAME_CONTRACT_ABI = GameContractArtifact.abi;
export const GAME_NFT_ABI = GameNFTArtifact.abi;

// Export bytecode for deployment
export const GAME_CONTRACT_BYTECODE = GameContractArtifact.bytecode;
export const GAME_NFT_BYTECODE = GameNFTArtifact.bytecode;

// Contract deployment parameters
export interface GameContractDeployParams {
    initialLevel: number;
}

export interface GameNFTDeployParams {
    // GameNFT constructor takes no parameters
}

// Export contract addresses type for runtime configuration
export interface DeployedContracts {
    gameContract?: string;
    gameNFT?: string;
}