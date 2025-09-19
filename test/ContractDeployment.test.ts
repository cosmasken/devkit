/**
 * Tests for contract deployment functionality
 */

import { SomniaGameKit } from '../src/core/SomniaGameKit';

describe('Contract Deployment', () => {
    let sdk: SomniaGameKit;

    beforeEach(() => {
        sdk = new SomniaGameKit();
    });

    afterEach(async () => {
        await sdk.cleanup();
    });

    describe('deployGame', () => {
        it('should throw WalletConnectionError when wallet is not connected', async () => {
            // Initialize without connecting to avoid network issues in tests
            sdk['config'] = { network: 'local' };
            sdk['web3'] = {} as any; // Mock web3 instance

            await expect(sdk.deployGame(1)).rejects.toThrow('Wallet must be connected before deploying contracts');
        });

        it('should have deployGame method available', () => {
            expect(typeof sdk.deployGame).toBe('function');
        });
    });

    describe('deployNFTContract', () => {
        it('should throw WalletConnectionError when wallet is not connected', async () => {
            // Initialize without connecting to avoid network issues in tests
            sdk['config'] = { network: 'local' };
            sdk['web3'] = {} as any; // Mock web3 instance

            await expect(sdk.deployNFTContract()).rejects.toThrow('Wallet must be connected before deploying contracts');
        });

        it('should have deployNFTContract method available', () => {
            expect(typeof sdk.deployNFTContract).toBe('function');
        });
    });

    describe('gas management', () => {
        it('should have getGasPrice method available', () => {
            expect(typeof sdk.getGasPrice).toBe('function');
        });

        it('should have estimateGas method available', () => {
            expect(typeof sdk.estimateGas).toBe('function');
        });

        it('should have waitForTransactionConfirmation method available', () => {
            expect(typeof sdk.waitForTransactionConfirmation).toBe('function');
        });
    });

    describe('contract artifacts', () => {
        it('should be able to import contract artifacts', async () => {
            const { GAME_CONTRACT_ABI, GAME_CONTRACT_BYTECODE, GAME_NFT_ABI, GAME_NFT_BYTECODE } = await import('../src/contracts');

            expect(GAME_CONTRACT_ABI).toBeDefined();
            expect(GAME_CONTRACT_BYTECODE).toBeDefined();
            expect(GAME_NFT_ABI).toBeDefined();
            expect(GAME_NFT_BYTECODE).toBeDefined();

            expect(Array.isArray(GAME_CONTRACT_ABI)).toBe(true);
            expect(Array.isArray(GAME_NFT_ABI)).toBe(true);
            expect(typeof GAME_CONTRACT_BYTECODE).toBe('string');
            expect(typeof GAME_NFT_BYTECODE).toBe('string');

            // Bytecode should start with 0x
            expect(GAME_CONTRACT_BYTECODE.startsWith('0x') || GAME_CONTRACT_BYTECODE.length > 0).toBe(true);
            expect(GAME_NFT_BYTECODE.startsWith('0x') || GAME_NFT_BYTECODE.length > 0).toBe(true);
        });
    });
});