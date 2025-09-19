// Example usage of the Somnia GameKit SDK with blockchain connectivity and error handling

import { SomniaGameKit, WalletConnectionError, ContractError, GasEstimationError } from './src/index';

async function runExample() {
  const sdk = new SomniaGameKit();
  
  try {
    // Initialize the SDK
    console.log('Initializing SDK...');
    await sdk.initialize({ 
      network: 'somnia-testnet'
    });
    console.log('SDK initialized successfully');

    // Connect to wallet
    console.log('Connecting to wallet...');
    await sdk.connectWallet();
    console.log('Wallet connected successfully');
    
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
    const player1Added = await sdk.addPlayerToGame(game.id, player1.id);
    const player2Added = await sdk.addPlayerToGame(game.id, player2.id);
    console.log('Players added to game:', player1Added, player2Added);

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
    const move1 = await sdk.makeMove(session.id, player1.id, { action: 'attack', target: player2.id });
    const move2 = await sdk.makeMove(session.id, player2.id, { action: 'defend' });
    console.log('Moves processed:', move1, move2);

    // End the game session
    console.log('Ending game session...');
    const gameEnded = await sdk.endGame(session.id, { winner: player1.id, finalScore: { [player1.id]: 100, [player2.id]: 50 } });
    console.log('Game session ended:', gameEnded);

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
    if (error instanceof WalletConnectionError) {
      console.error('Wallet connection error:', error.message);
    } else if (error instanceof ContractError) {
      console.error('Contract error:', error.message);
    } else if (error instanceof GasEstimationError) {
      console.error('Gas estimation error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Run the example
runExample();