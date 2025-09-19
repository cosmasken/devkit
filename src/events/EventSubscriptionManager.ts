/**
 * Contract event subscription and management
 */

import { ethers } from 'ethers';
import { BlockchainError } from '../core/errors';

export interface GameEventCallbacks {
    onGameStarted?: (event: { blockNumber: number; transactionHash: string }) => void;
    onMoveMade?: (event: { player: string; move: string; blockNumber: number; transactionHash: string }) => void;
    onGameEnded?: (event: { winner: string; blockNumber: number; transactionHash: string }) => void;
}

export interface NFTEventCallbacks {
    onTransfer?: (event: { from: string; to: string; tokenId: number; blockNumber: number; transactionHash: string }) => void;
}

interface EventSubscription {
    contractAddress: string;
    listeners: Array<{
        filter: any;
        listener: (log: any) => void;
    }>;
    provider: ethers.WebSocketProvider;
}

export class EventSubscriptionManager {
    private ethersProvider?: ethers.WebSocketProvider;
    private subscriptions: Map<string, EventSubscription>;

    constructor(ethersProvider?: ethers.WebSocketProvider) {
        this.ethersProvider = ethersProvider;
        this.subscriptions = new Map();
    }

    /**
     * Updates the ethers provider (called when WebSocket reconnects)
     */
    setEthersProvider(provider: ethers.WebSocketProvider): void {
        this.ethersProvider = provider;
    }

    /**
     * Subscribes to game contract events (GameStarted, MoveMade, GameEnded)
     * @param contractAddress - The game contract address to listen to
     * @param callbacks - Object containing callback functions for each event type
     * @returns Promise resolving to a subscription ID for cleanup
     */
    async listenForGameEvents(
        contractAddress: string,
        callbacks: GameEventCallbacks
    ): Promise<string> {
        if (!this.ethersProvider) {
            throw new BlockchainError('WebSocket provider not initialized. Cannot listen for events.', 'PROVIDER_NOT_INITIALIZED');
        }

        try {
            const subscriptionId = 'game_events_' + Math.random().toString(36).substring(2, 15);

            // Create event filters for each game event
            const gameStartedFilter = {
                address: contractAddress,
                topics: [ethers.id("GameStarted()")]
            };

            const moveMadeFilter = {
                address: contractAddress,
                topics: [ethers.id("MoveMade(address,string)")]
            };

            const gameEndedFilter = {
                address: contractAddress,
                topics: [ethers.id("GameEnded(address)")]
            };

            // Set up event listeners
            const listeners: any[] = [];

            if (callbacks.onGameStarted) {
                const gameStartedListener = (log: any) => {
                    callbacks.onGameStarted!({
                        blockNumber: log.blockNumber,
                        transactionHash: log.transactionHash
                    });
                };
                this.ethersProvider.on(gameStartedFilter, gameStartedListener);
                listeners.push({ filter: gameStartedFilter, listener: gameStartedListener });
            }

            if (callbacks.onMoveMade) {
                const moveMadeListener = async (log: any) => {
                    try {
                        // Parse the event data from the log
                        const iface = new ethers.Interface([
                            "event MoveMade(address player, string move)"
                        ]);
                        const parsedLog = iface.parseLog(log);

                        if (parsedLog) {
                            callbacks.onMoveMade!({
                                player: parsedLog.args.player,
                                move: parsedLog.args.move,
                                blockNumber: log.blockNumber,
                                transactionHash: log.transactionHash
                            });
                        }
                    } catch (error) {
                        console.error('Error parsing MoveMade event:', error);
                    }
                };
                this.ethersProvider.on(moveMadeFilter, moveMadeListener);
                listeners.push({ filter: moveMadeFilter, listener: moveMadeListener });
            }

            if (callbacks.onGameEnded) {
                const gameEndedListener = async (log: any) => {
                    try {
                        // Parse the event data from the log
                        const iface = new ethers.Interface([
                            "event GameEnded(address winner)"
                        ]);
                        const parsedLog = iface.parseLog(log);

                        if (parsedLog) {
                            callbacks.onGameEnded!({
                                winner: parsedLog.args.winner,
                                blockNumber: log.blockNumber,
                                transactionHash: log.transactionHash
                            });
                        }
                    } catch (error) {
                        console.error('Error parsing GameEnded event:', error);
                    }
                };
                this.ethersProvider.on(gameEndedFilter, gameEndedListener);
                listeners.push({ filter: gameEndedFilter, listener: gameEndedListener });
            }

            // Store listeners for cleanup
            this.subscriptions.set(subscriptionId, {
                contractAddress,
                listeners,
                provider: this.ethersProvider
            });

            console.log(`Game event listeners set up for contract: ${contractAddress}`);
            return subscriptionId;

        } catch (error: any) {
            throw new BlockchainError(`Failed to set up game event listeners: ${error.message}`, 'EVENT_SUBSCRIPTION_ERROR', error);
        }
    }

    /**
     * Subscribes to NFT contract Transfer events
     * @param contractAddress - The NFT contract address to listen to
     * @param callbacks - Object containing callback functions for Transfer events
     * @returns Promise resolving to a subscription ID for cleanup
     */
    async listenForNFTEvents(
        contractAddress: string,
        callbacks: NFTEventCallbacks
    ): Promise<string> {
        if (!this.ethersProvider) {
            throw new BlockchainError('WebSocket provider not initialized. Cannot listen for events.', 'PROVIDER_NOT_INITIALIZED');
        }

        try {
            const subscriptionId = 'nft_events_' + Math.random().toString(36).substring(2, 15);

            // Create event filter for Transfer events
            const transferFilter = {
                address: contractAddress,
                topics: [ethers.id("Transfer(address,address,uint256)")]
            };

            const listeners: any[] = [];

            if (callbacks.onTransfer) {
                const transferListener = async (log: any) => {
                    try {
                        // Parse the event data from the log
                        const iface = new ethers.Interface([
                            "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
                        ]);
                        const parsedLog = iface.parseLog(log);

                        if (parsedLog) {
                            callbacks.onTransfer!({
                                from: parsedLog.args.from,
                                to: parsedLog.args.to,
                                tokenId: parseInt(parsedLog.args.tokenId.toString()),
                                blockNumber: log.blockNumber,
                                transactionHash: log.transactionHash
                            });
                        }
                    } catch (error) {
                        console.error('Error parsing Transfer event:', error);
                    }
                };
                this.ethersProvider.on(transferFilter, transferListener);
                listeners.push({ filter: transferFilter, listener: transferListener });
            }

            // Store listeners for cleanup
            this.subscriptions.set(subscriptionId, {
                contractAddress,
                listeners,
                provider: this.ethersProvider
            });

            console.log(`NFT event listeners set up for contract: ${contractAddress}`);
            return subscriptionId;

        } catch (error: any) {
            throw new BlockchainError(`Failed to set up NFT event listeners: ${error.message}`, 'EVENT_SUBSCRIPTION_ERROR', error);
        }
    }

    /**
     * Stops listening for events and cleans up the subscription
     * @param subscriptionId - The subscription ID returned from listenForGameEvents or listenForNFTEvents
     */
    async stopListeningForEvents(subscriptionId: string): Promise<void> {
        const subscription = this.subscriptions.get(subscriptionId);

        if (!subscription) {
            console.warn(`No subscription found with ID: ${subscriptionId}`);
            return;
        }

        try {
            // Remove all listeners for this subscription
            for (const { filter, listener } of subscription.listeners) {
                subscription.provider.off(filter, listener);
            }

            // Remove from our tracking
            this.subscriptions.delete(subscriptionId);

            console.log(`Event subscription ${subscriptionId} stopped and cleaned up`);
        } catch (error: any) {
            console.error(`Error stopping event subscription ${subscriptionId}:`, error);
            throw new BlockchainError(`Failed to stop event subscription: ${error.message}`, 'EVENT_CLEANUP_ERROR', error);
        }
    }

    /**
     * Stops all active event subscriptions and cleans up resources
     */
    async stopAllEventListeners(): Promise<void> {
        const subscriptionIds = Array.from(this.subscriptions.keys());

        for (const subscriptionId of subscriptionIds) {
            try {
                await this.stopListeningForEvents(subscriptionId);
            } catch (error) {
                console.error(`Error stopping subscription ${subscriptionId}:`, error);
            }
        }

        console.log('All event subscriptions stopped');
    }

    /**
     * Gets the number of active subscriptions
     */
    getActiveSubscriptionCount(): number {
        return this.subscriptions.size;
    }

    /**
     * Gets all active subscription IDs
     */
    getActiveSubscriptionIds(): string[] {
        return Array.from(this.subscriptions.keys());
    }

    /**
     * Listens for WebSocket events
     */
    async listenForWebSocketEvents(
        contractAddress: string,
        eventName: string,
        callback: (event: any) => void,
        filter?: any
    ): Promise<string> {
        // Generate a unique listener ID
        const listenerId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // For now, this is a placeholder implementation
        // In a real implementation, this would set up WebSocket event listening
        console.log(`WebSocket event listener ${listenerId} set up for ${eventName} on ${contractAddress}`);
        
        return listenerId;
    }

    /**
     * Stops listening for WebSocket events
     */
    async stopListeningForWebSocketEvents(listenerId: string): Promise<void> {
        // Placeholder implementation
        console.log(`WebSocket event listener ${listenerId} stopped`);
    }
}