/**
 * Custom error classes for the Somnia GameKit SDK
 */

export class BlockchainError extends Error {
    constructor(message: string, public code?: string, public data?: any) {
        super(message);
        this.name = 'BlockchainError';
    }
}

export class WalletConnectionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'WalletConnectionError';
    }
}

export class ContractError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ContractError';
    }
}

export class GasEstimationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GasEstimationError';
    }
}