// Example usage of the Somnia GameKit SDK with blockchain connectivity

import { SomniaGameKit } from './src/index';

async function runExample() {
  try {
    // Initialize the SDK
    const sdk = new SomniaGameKit();
    await sdk.initialize({ 
      network: 'somnia-testnet', 
      rpcUrl: 'https://testnet.somnia.network' // Example RPC URL
    });

    // Connect to wallet (in browser, this would connect to MetaMask)
    console.log('Connecting to wallet...');
    await sdk.connectWallet();
    
    // Create players
    console.log('Creating players...');
    const player1 = sdk.createPlayer({ username: 'Alice', avatar: 'alice-avatar-url' });
    const player2 = sdk.createPlayer({ username: 'Bob', avatar: 'bob-avatar-url' });
    console.log('Players created:', player1.username, player2.username);

    // Deploy a game contract
    console.log('Deploying game contract...');
    const game = await sdk.deployGame(1); // Initial level 1
    console.log('Game contract deployed:', game.contractAddress);

    // Add players to the game
    console.log('Adding players to game...');
    await sdk.addPlayerToGame(game.id, player1.id);
    await sdk.addPlayerToGame(game.id, player2.id);
    console.log('Players added to game');

    // Mint NFTs for players (on-chain)
    console.log('Minting NFTs on blockchain...');
    const nft1 = await sdk.mintNFT(player1.id, {
      name: 'Magic Sword',
      description: 'A powerful sword that increases attack power',
      image: 'magic-sword.png'
    });

    const nft2 = await sdk.mintNFT(player2.id, {
      name: 'Health Potion',
      description: 'Restores 50 health points',
      image: 'health-potion.png'
    });
    console.log('NFTs minted on blockchain:', nft1.contractAddress, nft2.contractAddress);

    // Start a game session
    console.log('Starting game session...');
    const session = await sdk.startGame(game.id, [player1.id, player2.id]);
    console.log('Game session started:', session.id);

    // Process moves (these would be blockchain transactions in a real implementation)
    console.log('Processing moves...');
    await sdk.makeMove(session.id, player1.id, { action: 'attack', target: player2.id });
    await sdk.makeMove(session.id, player2.id, { action: 'defend' });
    console.log('Moves processed');

    // End the game session
    console.log('Ending game session...');
    await sdk.endGame(session.id, { winner: player1.id, finalScore: { [player1.id]: 100, [player2.id]: 50 } });
    console.log('Game session ended');

    // Transfer an NFT (on-chain transaction)
    console.log('Transferring NFT on blockchain...');
    const transferResult = await sdk.transferNFT(player1.id, player2.id, nft1.id);
    console.log('NFT transfer result:', transferResult);

    // List player NFTs
    console.log('Player NFTs:');
    console.log('Alice\'s NFTs:', sdk.getPlayerNFTs(player1.id).length);
    console.log('Bob\'s NFTs:', sdk.getPlayerNFTs(player2.id).length);

    console.log('Example completed successfully with blockchain connectivity!');
  } catch (error) {
    console.error('Error in example:', error);
  }
}

// Run the example
runExample();