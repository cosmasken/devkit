// Example usage of the Somnia GameKit SDK with WebSocket event listening

import { 
  SomniaGameKit, 
  WalletConnectionError, 
  ContractError, 
  GasEstimationError 
} from './src/index';

async function runWebSocketExample() {
  const sdk = new SomniaGameKit();
  
  try {
    // Initialize the SDK with WebSocket support
    console.log('Initializing SDK with WebSocket support...');
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

    // Set up WebSocket event listeners for real-time updates
    console.log('Setting up WebSocket event listeners...');
    
    // Listen for GameStarted events
    const gameStartedListenerId = await sdk.listenForWebSocketEvents(
      game.contractAddress!,
      'GameStarted',
      (event) => {
        console.log('🎮 Game Started Event Received:', event);
      }
    );
    
    // Listen for PlayerJoined events
    const playerJoinedListenerId = await sdk.listenForWebSocketEvents(
      game.contractAddress!,
      'PlayerJoined',
      (event) => {
        console.log('👥 Player Joined Event Received:', event);
      }
    );
    
    // Listen for MoveMade events
    const moveMadeListenerId = await sdk.listenForWebSocketEvents(
      game.contractAddress!,
      'MoveMade',
      (event) => {
        console.log('🕹️ Move Made Event Received:', event);
      }
    );
    
    // Listen for GameEnded events
    const gameEndedListenerId = await sdk.listenForWebSocketEvents(
      game.contractAddress!,
      'GameEnded',
      (event) => {
        console.log('🏁 Game Ended Event Received:', event);
      }
    );
    
    console.log('WebSocket event listeners set up successfully');

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

    // Process moves (these would trigger WebSocket events in a real implementation)
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
    
    // Stop listening to WebSocket events
    console.log('Cleaning up WebSocket event listeners...');
    await sdk.stopListeningForWebSocketEvents(gameStartedListenerId);
    await sdk.stopListeningForWebSocketEvents(playerJoinedListenerId);
    await sdk.stopListeningForWebSocketEvents(moveMadeListenerId);
    await sdk.stopListeningForWebSocketEvents(gameEndedListenerId);
    console.log('WebSocket event listeners cleaned up');

    console.log('Example completed successfully with WebSocket event listening!');
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
runWebSocketExample();