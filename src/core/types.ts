/**
 * Core types and interfaces for the Somnia GameKit SDK
 */

import { Contract } from 'web3-eth-contract';

// Configuration interfaces
export interface SDKConfig {
    network: 'somnia-testnet' | 'somnia-mainnet' | 'local' | string;
    apiKey?: string;
    endpoint?: string;
    rpcUrl?: string;
    wsUrl?: string;
    contractAddresses?: {
        gameContract?: string;
        nftContract?: string;
    };
    gasSettings?: {
        maxGasPrice?: string;
        gasMultiplier?: number;
    };
    eventSettings?: {
        reconnectAttempts?: number;
        reconnectDelay?: number;
    };
}

// Network configuration
export interface NetworkConfig {
    rpcUrl: string;
    wsUrl: string;
    chainId: number;
    name: string;
}

// Entity interfaces
export interface Player {
    id: string;
    username: string;
    avatar?: string;
    walletAddress?: string;
}

export interface Game {
    id: string;
    contractAddress?: string;
    state: any;
    players: string[];
    contractInstance?: Contract;
}

export interface NFT {
    id: string;
    playerId: string;
    metadata: {
        name: string;
        description: string;
        image: string;
    };
    contractAddress?: string;
    tokenId?: string;
    contractInstance?: Contract;
}

export interface GameSession {
    id: string;
    gameId: string;
    players: string[];
    currentState?: any;
    status?: string;
    startTime: Date;
    endTime?: Date;
}

// Event handling types
export type GameEvent = {
    name: string;
    data: any;
    timestamp: Date;
};

export type EventCallback = (event: GameEvent) => void;

// Enhanced event data with contract state enrichment
export interface EnrichedEventData {
    // Raw event data
    blockNumber: number;
    transactionHash: string;
    logIndex: number;

    // Enriched contract state data
    contractState?: any;

    // Cached data timestamp
    enrichedAt: Date;
}

// Event cache entry
export interface EventCacheEntry {
    data: any;
    timestamp: Date;
    blockNumber: number;
}

// Event listener subscription with lifecycle management
export interface EventSubscription {
    id: string;
    contractAddress: string;
    listeners: Array<{
        filter: any;
        listener: (...args: any[]) => void;
        eventName: string;
    }>;
    provider: any;
    createdAt: Date;
    lastActivity: Date;
    isActive: boolean;
}

// Transaction options
export interface TransactionOptions {
    gas?: number;
    gasPrice?: string;
    value?: string;
    nonce?: number;
}

// WebSocket event listener
export interface WebSocketEventListener {
    id: string;
    contractAddress: string;
    eventName: string;
    filter?: any;
    callback: (event: any) => void;
}