/**
 * Game contract operations and management
 */

import Web3 from 'web3';
import { Game, Player, TransactionOptions } from '../core/types';
import { WalletManager } from '../wallet/WalletManager';
import { GasManager } from '../utils/GasManager';
import { ContractError, GasEstimationError } from '../core/errors';

export class GameManager {
    private web3: Web3;
    private walletManager: WalletManager;
    private gasManager: GasManager;
    private games: Map<string, Game>;
    private players: Map<string, Player>;

    constructor(web3: Web3, walletManager: WalletManager, gasManager: GasManager) {
        this.web3 = web3;
        this.walletManager = walletManager;
        this.gasManager = gasManager;
        this.games = new Map();
        this.players = new Map();
    }

    /**
     * Deploys a new GameContract to the blockchain
     * @param initialLevel - The initial level for the game
     * @param options - Transaction options including gas settings
     * @returns Promise resolving to the deployed contract address
     */
    async deployGame(initialLevel: number, options?: TransactionOptions): Promise<string> {
        this.walletManager.ensureWalletConnected();

        try {
            // Import contract artifacts
            const { GAME_CONTRACT_ABI, GAME_CONTRACT_BYTECODE } = await import('../contracts');

            // Create contract instance for deployment
            const contract = new this.web3.eth.Contract(GAME_CONTRACT_ABI as any);

            // Prepare deployment data
            const deployData = contract.deploy({
                data: GAME_CONTRACT_BYTECODE,
                arguments: [initialLevel]
            }).encodeABI();

            const transactionObject = {
                from: this.walletManager.getWalletAddress()!,
                data: deployData
            };

            // Prepare gas settings
            const gasSettings = await this.gasManager.prepareGasSettings(transactionObject, options);

            // Deploy the contract
            const deployedContract = await contract.deploy({
                data: GAME_CONTRACT_BYTECODE,
                arguments: [initialLevel]
            }).send({
                from: this.walletManager.getWalletAddress()!,
                gas: gasSettings.gas,
                gasPrice: gasSettings.gasPrice,
                value: options?.value || '0',
                nonce: options?.nonce
            });

            const contractAddress = deployedContract.options.address;

            if (!contractAddress) {
                throw new ContractError('Contract deployment failed - no address returned');
            }

            console.log(`GameContract deployed successfully at: ${contractAddress}`);
            return contractAddress;

        } catch (error: any) {
            if (error.name === 'ContractError') {
                throw error;
            }

            // Handle gas estimation errors
            if (error.message?.includes('gas') || error.message?.includes('Gas')) {
                throw new GasEstimationError(`Gas estimation failed for contract deployment: ${error.message}`);
            }

            throw new ContractError(`Failed to deploy GameContract: ${error.message}`);
        }
    }

    /**
     * Creates a new game by deploying and initializing a GameContract
     * @param initialLevel - The initial level for the game
     * @param options - Transaction options including gas settings
     * @returns Promise resolving to the game ID and contract address
     */
    async createGame(initialLevel: number, options?: TransactionOptions): Promise<{ gameId: string; contractAddress: string }> {
        try {
            // Deploy the game contract
            const contractAddress = await this.deployGame(initialLevel, options);

            // Generate a unique game ID
            const gameId = 'game_' + Math.random().toString(36).substring(2, 15);

            // Create game instance and store it
            const game: Game = {
                id: gameId,
                contractAddress,
                state: { level: initialLevel, score: 0, isActive: false },
                players: []
            };

            this.games.set(gameId, game);

            console.log(`Game created with ID: ${gameId} at contract: ${contractAddress}`);
            return { gameId, contractAddress };

        } catch (error: any) {
            // Re-throw specific error types without wrapping
            if (error.name === 'ContractError' || error.name === 'GasEstimationError') {
                throw error;
            }

            throw new ContractError(`Failed to create game: ${error.message}`);
        }
    }

    /**
     * Starts a game by calling the contract's startGame() function
     * @param gameId - The ID of the game to start
     * @param playerAddresses - Array of player addresses to include in the game
     * @param options - Transaction options including gas settings
     * @returns Promise resolving to the transaction receipt
     */
    async startGame(gameId: string, playerAddresses: string[], options?: TransactionOptions): Promise<any> {
        this.walletManager.ensureWalletConnected();

        const game = this.games.get(gameId);
        if (!game || !game.contractAddress) {
            throw new ContractError(`Game not found or contract not deployed: ${gameId}`);
        }

        try {
            // Import contract ABI
            const { GAME_CONTRACT_ABI } = await import('../contracts');

            // Create contract instance
            const contract = new this.web3.eth.Contract(GAME_CONTRACT_ABI as any, game.contractAddress);

            const transactionObject = {
                from: this.walletManager.getWalletAddress()!
            };

            // Prepare gas settings
            const gasSettings = await this.gasManager.prepareGasSettings(transactionObject, options);

            // Execute the startGame transaction
            const receipt = await contract.methods.startGame(playerAddresses).send({
                from: this.walletManager.getWalletAddress()!,
                gas: gasSettings.gas,
                gasPrice: gasSettings.gasPrice,
                value: options?.value || '0',
                nonce: options?.nonce
            });

            // Update local game state
            game.state.isActive = true;
            game.players = playerAddresses;
            this.games.set(gameId, game);

            console.log(`Game ${gameId} started successfully. Transaction: ${receipt.transactionHash}`);
            return receipt;

        } catch (error: any) {
            if (error.name === 'ContractError') {
                throw error;
            }

            // Handle gas estimation errors
            if (error.message?.includes('gas') || error.message?.includes('Gas')) {
                throw new GasEstimationError(`Gas estimation failed for starting game: ${error.message}`);
            }

            throw new ContractError(`Failed to start game ${gameId}: ${error.message}`);
        }
    }

    /**
     * Ends a game by calling the contract's endGame() function
     * @param gameId - The ID of the game to end
     * @param winner - The address of the winning player
     * @param options - Transaction options including gas settings
     * @returns Promise resolving to the transaction receipt
     */
    async endGame(gameId: string, winner: string, options?: TransactionOptions): Promise<any> {
        this.walletManager.ensureWalletConnected();

        const game = this.games.get(gameId);
        if (!game || !game.contractAddress) {
            throw new ContractError(`Game not found or contract not deployed: ${gameId}`);
        }

        try {
            // Import contract ABI
            const { GAME_CONTRACT_ABI } = await import('../contracts');

            // Create contract instance
            const contract = new this.web3.eth.Contract(GAME_CONTRACT_ABI as any, game.contractAddress);

            const transactionObject = {
                from: this.walletManager.getWalletAddress()!
            };

            // Prepare gas settings
            const gasSettings = await this.gasManager.prepareGasSettings(transactionObject, options);

            // Execute the endGame transaction
            const receipt = await contract.methods.endGame(winner).send({
                from: this.walletManager.getWalletAddress()!,
                gas: gasSettings.gas,
                gasPrice: gasSettings.gasPrice,
                value: options?.value || '0',
                nonce: options?.nonce
            });

            // Update local game state
            game.state.isActive = false;
            this.games.set(gameId, game);

            console.log(`Game ${gameId} ended successfully. Winner: ${winner}. Transaction: ${receipt.transactionHash}`);
            return receipt;

        } catch (error: any) {
            if (error.name === 'ContractError') {
                throw error;
            }

            // Handle gas estimation errors
            if (error.message?.includes('gas') || error.message?.includes('Gas')) {
                throw new GasEstimationError(`Gas estimation failed for ending game: ${error.message}`);
            }

            throw new ContractError(`Failed to end game ${gameId}: ${error.message}`);
        }
    }

    /**
     * Gets the current game state from the contract
     * @param gameId - The ID of the game to query
     * @returns Promise resolving to the current game state
     */
    async getGameState(gameId: string): Promise<{ level: number; score: number; isActive: boolean }> {
        const game = this.games.get(gameId);
        if (!game || !game.contractAddress) {
            throw new ContractError(`Game not found or contract not deployed: ${gameId}`);
        }

        try {
            // Import contract ABI
            const { GAME_CONTRACT_ABI } = await import('../contracts');

            // Create contract instance
            const contract = new this.web3.eth.Contract(GAME_CONTRACT_ABI as any, game.contractAddress);

            // Query the game state from the contract
            const gameState = await contract.methods.gameState().call();

            // Parse the returned values (based on the contract ABI)
            const state = {
                level: parseInt(gameState.level),
                score: parseInt(gameState.score),
                isActive: gameState.isActive
            };

            // Update local cache
            game.state = state;
            this.games.set(gameId, game);

            return state;

        } catch (error: any) {
            throw new ContractError(`Failed to get game state for ${gameId}: ${error.message}`);
        }
    }

    /**
     * Joins a game by calling the contract's joinGame() function
     * @param gameId - The ID of the game to join
     * @param options - Transaction options including gas settings
     * @returns Promise resolving to the transaction receipt
     */
    async joinGame(gameId: string, options?: TransactionOptions): Promise<any> {
        this.walletManager.ensureWalletConnected();

        const game = this.games.get(gameId);
        if (!game || !game.contractAddress) {
            throw new ContractError(`Game not found or contract not deployed: ${gameId}`);
        }

        try {
            // Import contract ABI
            const { GAME_CONTRACT_ABI } = await import('../contracts');

            // Create contract instance
            const contract = new this.web3.eth.Contract(GAME_CONTRACT_ABI as any, game.contractAddress);

            const transactionObject = {
                from: this.walletManager.getWalletAddress()!
            };

            // Prepare gas settings
            const gasSettings = await this.gasManager.prepareGasSettings(transactionObject, options);

            // Execute the joinGame transaction
            const receipt = await contract.methods.joinGame().send({
                from: this.walletManager.getWalletAddress()!,
                gas: gasSettings.gas,
                gasPrice: gasSettings.gasPrice,
                value: options?.value || '0',
                nonce: options?.nonce
            });

            // Update local game state to include the player
            const walletAddress = this.walletManager.getWalletAddress()!;
            if (!game.players.includes(walletAddress)) {
                game.players.push(walletAddress);
                this.games.set(gameId, game);
            }

            console.log(`Player ${walletAddress} joined game ${gameId}. Transaction: ${receipt.transactionHash}`);
            return receipt;

        } catch (error: any) {
            if (error.name === 'ContractError') {
                throw error;
            }

            // Handle gas estimation errors
            if (error.message?.includes('gas') || error.message?.includes('Gas')) {
                throw new GasEstimationError(`Gas estimation failed for joining game: ${error.message}`);
            }

            throw new ContractError(`Failed to join game ${gameId}: ${error.message}`);
        }
    }

    /**
     * Makes a move in the game by executing a MoveMade transaction on the contract
     * @param gameId - The ID of the game to make a move in
     * @param move - The move data as a string
     * @param options - Transaction options including gas settings
     * @returns Promise resolving to the transaction receipt
     */
    async makeMove(gameId: string, move: string, options?: TransactionOptions): Promise<any> {
        this.walletManager.ensureWalletConnected();

        const game = this.games.get(gameId);
        if (!game || !game.contractAddress) {
            throw new ContractError(`Game not found or contract not deployed: ${gameId}`);
        }

        try {
            // Import contract ABI
            const { GAME_CONTRACT_ABI } = await import('../contracts');

            // Create contract instance
            const contract = new this.web3.eth.Contract(GAME_CONTRACT_ABI as any, game.contractAddress);

            const transactionObject = {
                from: this.walletManager.getWalletAddress()!
            };

            // Prepare gas settings
            const gasSettings = await this.gasManager.prepareGasSettings(transactionObject, options);

            // Execute the makeMove transaction
            const receipt = await contract.methods.makeMove(move).send({
                from: this.walletManager.getWalletAddress()!,
                gas: gasSettings.gas,
                gasPrice: gasSettings.gasPrice,
                value: options?.value || '0',
                nonce: options?.nonce
            });

            console.log(`Move made by ${this.walletManager.getWalletAddress()} in game ${gameId}: "${move}". Transaction: ${receipt.transactionHash}`);
            return receipt;

        } catch (error: any) {
            if (error.name === 'ContractError') {
                throw error;
            }

            // Handle gas estimation errors
            if (error.message?.includes('gas') || error.message?.includes('Gas')) {
                throw new GasEstimationError(`Gas estimation failed for making move: ${error.message}`);
            }

            throw new ContractError(`Failed to make move in game ${gameId}: ${error.message}`);
        }
    }

    /**
     * Gets a player's score from the contract
     * @param gameId - The ID of the game to query
     * @param playerAddress - The address of the player to get the score for
     * @returns Promise resolving to the player's score
     */
    async getPlayerScore(gameId: string, playerAddress: string): Promise<number> {
        const game = this.games.get(gameId);
        if (!game || !game.contractAddress) {
            throw new ContractError(`Game not found or contract not deployed: ${gameId}`);
        }

        try {
            // Import contract ABI
            const { GAME_CONTRACT_ABI } = await import('../contracts');

            // Create contract instance
            const contract = new this.web3.eth.Contract(GAME_CONTRACT_ABI as any, game.contractAddress);

            // Query the player's score from the contract
            const score = await contract.methods.playerScores(playerAddress).call();

            return parseInt(score);

        } catch (error: any) {
            throw new ContractError(`Failed to get player score for ${playerAddress} in game ${gameId}: ${error.message}`);
        }
    }

    /**
     * Gets the list of current players in the game from the contract
     * @param gameId - The ID of the game to query
     * @returns Promise resolving to an array of player addresses
     */
    async getPlayers(gameId: string): Promise<string[]> {
        const game = this.games.get(gameId);
        if (!game || !game.contractAddress) {
            throw new ContractError(`Game not found or contract not deployed: ${gameId}`);
        }

        try {
            // Import contract ABI
            const { GAME_CONTRACT_ABI } = await import('../contracts');

            // Create contract instance
            const contract = new this.web3.eth.Contract(GAME_CONTRACT_ABI as any, game.contractAddress);

            // Query the players from the contract
            const players = await contract.methods.getPlayers().call();

            // Update local cache
            game.players = players;
            this.games.set(gameId, game);

            return players;

        } catch (error: any) {
            throw new ContractError(`Failed to get players for game ${gameId}: ${error.message}`);
        }
    }

    // Player management methods
    createPlayer(playerDetails: Omit<Player, 'id'>): Player {
        const playerId = 'player_' + Math.random().toString(36).substr(2, 9);
        const player: Player = { id: playerId, ...playerDetails };
        this.players.set(playerId, player);
        return player;
    }

    getPlayer(playerId: string): Player | undefined {
        return this.players.get(playerId);
    }

    getGame(gameId: string): Game | undefined {
        return this.games.get(gameId);
    }

    /**
     * Validates a player's profile
     */
    validatePlayer(playerId: string): boolean {
        return this.players.has(playerId);
    }

    /**
     * Updates a player's profile
     */
    updatePlayer(playerId: string, updates: Partial<Omit<Player, 'id'>>): Player | undefined {
        const player = this.players.get(playerId);
        if (!player) return undefined;
        
        const updatedPlayer = { ...player, ...updates };
        this.players.set(playerId, updatedPlayer);
        return updatedPlayer;
    }

    /**
     * Deletes a player's profile
     */
    deletePlayer(playerId: string): boolean {
        return this.players.delete(playerId);
    }

    /**
     * Lists all players
     */
    listPlayers(): Player[] {
        return Array.from(this.players.values());
    }

    /**
     * Updates a game's state
     */
    updateGame(gameId: string, newState: any): Game | undefined {
        const game = this.games.get(gameId);
        if (!game) return undefined;
        
        const updatedGame = { ...game, state: { ...game.state, ...newState } };
        this.games.set(gameId, updatedGame);
        return updatedGame;
    }

    /**
     * Deletes a game
     */
    deleteGame(gameId: string): boolean {
        return this.games.delete(gameId);
    }

    /**
     * Lists all games
     */
    listGames(): Game[] {
        return Array.from(this.games.values());
    }

    /**
     * Adds a player to a game
     */
    async addPlayerToGame(gameId: string, playerId: string, options?: TransactionOptions): Promise<boolean> {
        const game = this.games.get(gameId);
        if (!game) return false;
        
        if (!game.players.includes(playerId)) {
            game.players.push(playerId);
            this.games.set(gameId, game);
        }
        return true;
    }

    /**
     * Removes a player from a game
     */
    async removePlayerFromGame(gameId: string, playerId: string, options?: TransactionOptions): Promise<boolean> {
        const game = this.games.get(gameId);
        if (!game) return false;
        
        const index = game.players.indexOf(playerId);
        if (index > -1) {
            game.players.splice(index, 1);
            this.games.set(gameId, game);
        }
        return true;
    }

    /**
     * Emits a game event
     */
    async emitGameEvent(gameId: string, eventName: string, eventData: any, options?: TransactionOptions): Promise<void> {
        // This is a placeholder implementation
        console.log(`Game event emitted: ${eventName} for game ${gameId}`, eventData);
    }

    /**
     * Validates a game ID
     */
    validateGameId(gameId: string): boolean {
        return this.games.has(gameId);
    }

    /**
     * Validates a player ID
     */
    validatePlayerId(playerId: string): boolean {
        return this.players.has(playerId);
    }

    /**
     * Generates a unique game ID
     */
    generateGameId(): string {
        return 'game_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Adds a game directly to the manager (for legacy compatibility)
     */
    addGame(game: Game): void {
        this.games.set(game.id, game);
    }

    /**
     * Gets the games map (for internal SDK use)
     */
    get gamesMap(): Map<string, Game> {
        return this.games;
    }
}