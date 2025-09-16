// examples/websocket-demo.ts
import { GameRegistry } from '../src/GameRegistry';
import { ethers } from 'ethers';

/**
 * WebSocket Demo - Demonstrates real-time game functionality
 * 
 * This example shows how to use the WebSocket integration in the SomniaGames SDK
 * to enable real-time game state updates and player interactions.
 */

async function websocketDemo() {
  console.log('SomniaGames WebSocket Demo');
  console.log('==========================');

  // In a real application, you would connect to a real provider and contract
  // For this demo, we'll use a mock provider
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
  const signer = new ethers.Wallet('0x0123456789012345678901234567890123456789012345678901234567890123', provider);

  // Initialize GameRegistry with WebSocket support
  const gameRegistry = new GameRegistry(
    '0x1234567890123456789012345678901234567890', // Contract address (mock)
    provider,
    signer,
    'ws://localhost:8080' // WebSocket URL
  );

  try {
    // Connect to WebSocket server
    console.log('Connecting to WebSocket server...');
    await gameRegistry.connectWebSocket();
    console.log('✅ Connected to WebSocket server');

    // Subscribe to game updates
    console.log('Subscribing to game updates...');
    gameRegistry.subscribeToGameUpdates(1, (gameState) => {
      console.log('🎮 Game state update received:', gameState);
    });
    console.log('✅ Subscribed to game updates');

    // Send a player action
    console.log('Sending player action...');
    await gameRegistry.sendPlayerAction(1, {
      type: 'MOVE',
      data: { position: 5 }
    });
    console.log('✅ Player action sent');

    // Get real-time game state
    const gameState = gameRegistry.getRealtimeGameState(1);
    console.log('🎮 Current game state:', gameState);

    console.log('\nDemo completed successfully!');
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo
if (require.main === module) {
  websocketDemo().catch(console.error);
}