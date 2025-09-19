/**
 * Network configurations for the Somnia GameKit SDK
 */

import { NetworkConfig } from './types';

// Network configurations
export const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
    'somnia-testnet': {
        rpcUrl: 'https://dream-rpc.somnia.network',
        wsUrl: 'wss://dream-rpc.somnia.network/ws',
        chainId: 50312,
        name: 'Somnia Testnet'
    },
    'somnia-mainnet': {
        rpcUrl: 'https://api.infra.mainnet.somnia.network',
        wsUrl: 'wss://api.infra.mainnet.somnia.network/ws',
        chainId: 54321,
        name: 'Somnia Mainnet'
    },
    'local': {
        rpcUrl: 'http://localhost:8545',
        wsUrl: 'ws://localhost:8545',
        chainId: 1337,
        name: 'Local Development Network'
    }
};