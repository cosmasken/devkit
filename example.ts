// Example usage of the Somnia GameKit SDK

import { SomniaGameKit } from './src/index';

// Initialize the SDK
const sdk = new SomniaGameKit();
sdk.initialize({ network: 'somnia-testnet', apiKey: 'your-api-key' });

// Create players
console.log('Creating players...');
const player1 = sdk.createPlayer({ username: 'Alice', avatar: 'alice-avatar-url' });
const player2 = sdk.createPlayer({ username: 'Bob', avatar: 'bob-avatar-url' });
console.log('Players created:', player1, player2);

// Deploy a game
console.log('Deploying game...');
const game = sdk.deployGame('0x1234...', {}, { level: 1, score: 0 });
console.log('Game deployed:', game);

// Add players to the game
console.log('Adding players to game...');
sdk.addPlayerToGame(game.id, player1.id);
sdk.addPlayerToGame(game.id, player2.id);
console.log('Players added to game');

// Mint NFTs for players
console.log('Minting NFTs...');
const nft1 = sdk.mintNFT(player1.id, {
  name: 'Magic Sword',
  description: 'A powerful sword that increases attack power',
  image: 'magic-sword.png'
});

const nft2 = sdk.mintNFT(player2.id, {
  name: 'Health Potion',
  description: 'Restores 50 health points',
  image: 'health-potion.png'
});
console.log('NFTs minted:', nft1, nft2);

// Start a game session
console.log('Starting game session...');
const session = sdk.startGame(game.id, [player1.id, player2.id]);
console.log('Game session started:', session);

// Process moves
console.log('Processing moves...');
sdk.makeMove(session.id, player1.id, { action: 'attack', target: player2.id });
sdk.makeMove(session.id, player2.id, { action: 'defend' });
console.log('Moves processed');

// End the game session
console.log('Ending game session...');
sdk.endGame(session.id, { winner: player1.id, finalScore: { [player1.id]: 100, [player2.id]: 50 } });
console.log('Game session ended');

// Transfer an NFT
console.log('Transferring NFT...');
const transferResult = sdk.transferNFT(player1.id, player2.id, nft1.id);
console.log('NFT transfer result:', transferResult);

// List player NFTs
console.log('Player NFTs:');
console.log('Alice\'s NFTs:', sdk.getPlayerNFTs(player1.id));
console.log('Bob\'s NFTs:', sdk.getPlayerNFTs(player2.id));

console.log('Example completed successfully!');