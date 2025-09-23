/**
 * Tests for contract event subscription methods
 */

import { SomniaGameKit } from '../src/core/SomniaGameKit';
import { ethers } from 'ethers';

// Mock ethers WebSocketProvider
jest.mock('ethers', () => ({
    ...jest.requireActual('ethers'),
    WebSocketProvider: jest.fn().mockImplementation(() => ({
        _waitUntilReady: jest.fn().mockResolvedValue(undefined),
        on: jest.fn(),
        off: jest.fn(),
        getBlockNumber: jest.fn().mockResolvedValue(12345)
    })),
    id: jest.fn((signature: string) => `0x${signature.slice(0, 8)}`)
}));

// Mock WebSocketProviderFactory
jest.mock('../src/core/WebSocketProvider', () => ({
    WebSocketProviderFactory: jest.fn().mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue({
            _waitUntilReady: jest.fn().mockResolvedValue(undefined),
            on: jest.fn(),
            off: jest.fn(),
            getBlockNumber: jest.fn().mockResolvedValue(12345)
        }),
        disconnect: jest.fn().mockResolvedValue(undefined),
        isConnected: jest.fn().mockReturnValue(true),
        getNetworkStatus: jest.fn().mockResolvedValue({
            connected: true,
            chainId: 50312,
            blockNumber: 12345,
            gasPrice: '20000000000',
            lastUpdated: new Date()
        })
    })),
    createWebSocketConfig: jest.fn().mockReturnValue({
        wsUrl: 'wss://dream-rpc.somnia.network/ws',
        chainId: 50312,
        maxReconnectAttempts: 5,
        reconnectDelay: 1000
    })
}));

describe('SomniaGameKit - Contract Event Subscription', () => {
    let sdk: SomniaGameKit;
    let mockProvider: any;

    beforeEach(async () => {
        sdk = new SomniaGameKit();
        await sdk.initialize({
            network: 'somnia-testnet'
        });
        
        // In test environment, we need to manually set up the ethers provider
        // since WebSocket initialization is skipped
        mockProvider = {
            _waitUntilReady: jest.fn().mockResolvedValue(undefined),
            on: jest.fn(),
            off: jest.fn(),
            getBlockNumber: jest.fn().mockResolvedValue(12345)
        };
        
        // Set the ethers provider in the event manager
        (sdk as any).eventManager.setEthersProvider(mockProvider);
    });

    afterEach(async () => {
        await sdk.cleanup();
    });

    describe('listenForGameEvents', () => {
        it('should set up enhanced game event listeners successfully', async () => {
            const contractAddress = '0x1234567890123456789012345678901234567890';
            const callbacks = {
                onGameStarted: jest.fn(),
                onMoveMade: jest.fn(),
                onGameEnded: jest.fn()
            };

            const subscriptionId = await sdk.listenForGameEvents(contractAddress, callbacks);

            expect(subscriptionId).toMatch(/^game_events_/);
            expect(mockProvider.on).toHaveBeenCalledTimes(3);

            // Verify GameStarted filter
            expect(mockProvider.on).toHaveBeenCalledWith(
                {
                    address: contractAddress,
                    topics: [ethers.id("GameStarted()")]
                },
                expect.any(Function)
            );

            // Verify MoveMade filter
            expect(mockProvider.on).toHaveBeenCalledWith(
                {
                    address: contractAddress,
                    topics: [ethers.id("MoveMade(address,string)")]
                },
                expect.any(Function)
            );

            // Verify GameEnded filter
            expect(mockProvider.on).toHaveBeenCalledWith(
                {
                    address: contractAddress,
                    topics: [ethers.id("GameEnded(address)")]
                },
                expect.any(Function)
            );
        });

        it('should handle partial callback setup', async () => {
            const contractAddress = '0x1234567890123456789012345678901234567890';
            const callbacks = {
                onGameStarted: jest.fn()
                // Only GameStarted callback provided
            };

            const subscriptionId = await sdk.listenForGameEvents(contractAddress, callbacks);

            expect(subscriptionId).toMatch(/^game_events_/);
            expect(mockProvider.on).toHaveBeenCalledTimes(1);
        });

        it('should throw error when WebSocket provider not initialized', async () => {
            const sdkWithoutWS = new SomniaGameKit();
            // Initialize without WebSocket provider
            await sdkWithoutWS.initialize({ network: 'local' });

            // Manually set ethersProvider to undefined to simulate initialization failure
            (sdkWithoutWS as any).ethersProvider = undefined;
            (sdkWithoutWS as any).eventManager.setEthersProvider(undefined);

            const contractAddress = '0x1234567890123456789012345678901234567890';
            const callbacks = { onGameStarted: jest.fn() };

            await expect(
                sdkWithoutWS.listenForGameEvents(contractAddress, callbacks)
            ).rejects.toThrow('WebSocket provider not initialized');
        });
    });

    describe('listenForNFTEvents', () => {
        it('should set up enhanced NFT Transfer event listeners successfully', async () => {
            const contractAddress = '0x1234567890123456789012345678901234567890';
            const callbacks = {
                onTransfer: jest.fn()
            };

            const subscriptionId = await sdk.listenForNFTEvents(contractAddress, callbacks);

            expect(subscriptionId).toMatch(/^nft_events_/);
            expect(mockProvider.on).toHaveBeenCalledWith(
                {
                    address: contractAddress,
                    topics: [ethers.id("Transfer(address,address,uint256)")]
                },
                expect.any(Function)
            );
        });

        it('should throw error when WebSocket provider not initialized', async () => {
            const sdkWithoutWS = new SomniaGameKit();
            await sdkWithoutWS.initialize({ network: 'local' });
            (sdkWithoutWS as any).ethersProvider = undefined;
            (sdkWithoutWS as any).eventManager.setEthersProvider(undefined);

            const contractAddress = '0x1234567890123456789012345678901234567890';
            const callbacks = { onTransfer: jest.fn() };

            await expect(
                sdkWithoutWS.listenForNFTEvents(contractAddress, callbacks)
            ).rejects.toThrow('WebSocket provider not initialized');
        });
    });

    describe('stopListeningForEvents', () => {
        it('should stop event listeners and clean up subscription', async () => {
            const contractAddress = '0x1234567890123456789012345678901234567890';
            const callbacks = {
                onGameStarted: jest.fn(),
                onMoveMade: jest.fn()
            };

            const subscriptionId = await sdk.listenForGameEvents(contractAddress, callbacks);

            await sdk.stopListeningForEvents(subscriptionId);

            expect(mockProvider.off).toHaveBeenCalledTimes(2);
        });

        it('should handle non-existent subscription gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            await sdk.stopListeningForEvents('non-existent-id');

            expect(consoleSpy).toHaveBeenCalledWith('No subscription found with ID: non-existent-id');
            consoleSpy.mockRestore();
        });
    });

    describe('stopAllEventListeners', () => {
        it('should stop all active subscriptions', async () => {
            const contractAddress1 = '0x1234567890123456789012345678901234567890';
            const contractAddress2 = '0x0987654321098765432109876543210987654321';

            const subscription1 = await sdk.listenForGameEvents(contractAddress1, {
                onGameStarted: jest.fn()
            });

            const subscription2 = await sdk.listenForNFTEvents(contractAddress2, {
                onTransfer: jest.fn()
            });

            await sdk.stopAllEventListeners();

            expect(mockProvider.off).toHaveBeenCalledTimes(2);
        });
    });




});