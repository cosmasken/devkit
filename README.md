# Somnia GameKit SDK

Enhanced Somnia Blockchain Game SDK with NFT Support

## Overview

This SDK provides tools for developing blockchain-based games on the Somnia Network with full NFT support for in-game assets. It includes functionality for player management, game deployment, NFT minting and trading, real-time game mechanics, and event handling with actual blockchain connectivity.

## Features

- **Player Management**: Create, update, and manage player profiles
- **Game Deployment**: Deploy and manage game contracts on the Somnia Network
- **NFT Support**: Mint, claim, and transfer NFTs for in-game assets
- **Real-time Game Mechanics**: Start game sessions, process moves, and end games
- **Event Handling**: Listen for and emit game events
- **Blockchain Connectivity**: Full integration with Somnia Network using Web3.js
- **Wallet Integration**: Connect to MetaMask and other wallets
- **Network Support**: Configurable for testnet, mainnet, or local development
- **Error Handling**: Comprehensive error handling with custom error types
- **Gas Management**: Automatic gas estimation and price fetching
- **WebSocket Events**: Real-time event listening via WebSocket connections
- **Utility Functions**: Generate IDs, validate entities, and more

## Installation

```bash
npm install @somnia/gamekit
```

## Usage

```javascript
import { SomniaGameKit } from '@somnia/gamekit';

// Initialize the SDK with blockchain connectivity
const sdk = new SomniaGameKit();
await sdk.initialize({ 
  network: 'somnia-testnet'
});

// Connect to wallet
await sdk.connectWallet();

// Create a player
const player = sdk.createPlayer({ username: 'Player1', avatar: 'avatar_url' });

// Deploy a game contract on-chain
const game = await sdk.deployGame(1); // Initial level

// Mint an NFT on-chain
const nft = await sdk.mintNFT(player.id, { 
  name: 'Rare Sword', 
  description: 'A powerful sword', 
  image: 'nft_image_url' 
});

// Start a game session
const session = await sdk.startGame(game.id, [player.id]);

// Process a move (blockchain transaction)
await sdk.makeMove(session.id, player.id, moveDetails);

// End the game session
await sdk.endGame(session.id, finalState);
```

## API Reference

### Core Functions

- `initialize(config)`: Initializes the SDK with blockchain configuration
- `connectWallet(walletAddress)`: Connects to a user's wallet (MetaMask, etc.)

### Player Management

- `createPlayer(playerDetails)`: Creates a new player profile
- `getPlayer(playerId)`: Retrieves a player's profile
- `updatePlayer(playerId, updates)`: Updates a player's profile
- `deletePlayer(playerId)`: Deletes a player's profile
- `listPlayers()`: Lists all players
- `validatePlayer(playerId)`: Validates a player's profile

### Game Management

- `deployGame(initialLevel)`: Deploys a new game contract on-chain
- `getGame(gameId)`: Retrieves a game's state from blockchain
- `updateGame(gameId, newState)`: Updates a game's state on-chain
- `deleteGame(gameId)`: Deletes a game
- `listGames()`: Lists all games
- `addPlayerToGame(gameId, playerId)`: Adds a player to a game (blockchain transaction)
- `removePlayerFromGame(gameId, playerId)`: Removes a player from a game (blockchain transaction)

### NFT Management

- `mintNFT(playerId, metadata)`: Mints a new NFT for a player on-chain
- `claimNFT(playerId, nftId)`: Claims an NFT for a player (blockchain transaction)
- `transferNFT(senderId, recipientId, nftId)`: Transfers an NFT between players on-chain
- `getNFT(nftId)`: Retrieves an NFT by ID
- `getPlayerNFTs(playerId)`: Lists all NFTs owned by a player
- `listNFTs()`: Lists all NFTs

### Game Sessions

- `startGame(gameId, playerIds)`: Starts a new game session (blockchain transaction)
- `makeMove(sessionId, playerId, moveDetails)`: Processes a player's move (blockchain transaction)
- `endGame(sessionId, finalState)`: Ends a game session (blockchain transaction)
- `getGameSession(sessionId)`: Retrieves a game session
- `listGameSessions()`: Lists all game sessions

### Event Handling

- `listenForGameEvents(gameId, eventName, callback)`: Listens for game events
- `emitGameEvent(gameId, eventName, eventData)`: Emits a game event
- `removeEventListener(gameId, eventName, callback)`: Removes an event listener
- `listenForBlockchainEvents(contractAddress, eventName, callback)`: Listens for blockchain events
- `stopListeningForBlockchainEvents(contractAddress, eventName)`: Stops listening for blockchain events
- `listenForWebSocketEvents(contractAddress, eventName, callback, filter)`: Listens for events via WebSocket
- `stopListeningForWebSocketEvents(listenerId)`: Stops listening for WebSocket events

### Utility Functions

- `generateGameId()`: Generates a unique game ID
- `validateGameId(gameId)`: Validates a game ID
- `validatePlayerId(playerId)`: Validates a player ID
- `getGasPrice()`: Gets the current gas price from the network
- `estimateGas(transaction)`: Estimates gas for a transaction

### Error Handling

The SDK provides custom error types for better error handling:

- `BlockchainError`: General blockchain-related errors
- `WalletConnectionError`: Wallet connection errors
- `ContractError`: Smart contract interaction errors
- `GasEstimationError`: Gas estimation errors

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Blockchain Integration

The SDK provides full blockchain integration with the Somnia Network:

- **Smart Contract Deployment**: Deploy game and NFT contracts directly from the SDK
- **Transaction Management**: Handle all blockchain transactions with proper gas estimation
- **Event Listening**: Listen to blockchain events from deployed contracts
- **Wallet Integration**: Seamless integration with MetaMask and other web3 wallets
- **Network Support**: Configure for testnet, mainnet, or local development
- **Error Handling**: Comprehensive error handling with custom error types
- **WebSocket Events**: Real-time event listening via WebSocket connections

## Network Configuration

The SDK supports multiple network configurations:

```javascript
// Testnet
await sdk.initialize({ network: 'somnia-testnet' });

// Mainnet
await sdk.initialize({ network: 'somnia-mainnet' });

// Local development
await sdk.initialize({ network: 'local' });

// Custom RPC and WebSocket URLs
await sdk.initialize({ 
  network: 'custom', 
  rpcUrl: 'https://your-custom-rpc-url',
  wsUrl: 'wss://your-custom-ws-url'
});
```

## Transaction Options

Many methods accept transaction options for gas customization:

```javascript
await sdk.mintNFT(playerId, metadata, {
  gas: 300000,
  gasPrice: '20000000000' // 20 Gwei
});
```

## WebSocket Event Listening

The SDK supports real-time event listening via WebSocket connections to the Somnia network:

```javascript
// Listen for specific contract events in real-time
const listenerId = await sdk.listenForWebSocketEvents(
  contractAddress,
  'YourEventName',
  (event) => {
    console.log('Real-time event received:', event);
  }
);

// Stop listening when no longer needed
await sdk.stopListeningForWebSocketEvents(listenerId);
```

Supported WebSocket endpoints:
- **Testnet**: `wss://dream-rpc.somnia.network/ws`
- **Mainnet**: `wss://api.infra.mainnet.somnia.network/ws`

## License

MIT

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.