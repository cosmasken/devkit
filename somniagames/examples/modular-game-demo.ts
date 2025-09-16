// examples/modular-game-demo.ts
import { createSimpleGame, createTetrisGame, createChessGame } from '../src/simple';
import { ethers } from 'ethers';

/**
 * Modular Game Demo - Demonstrates the new plug-and-play SDK architecture
 * 
 * This example shows how developers can create games using the modular system
 * with minimal code while still having access to advanced features.
 */

async function modularGameDemo() {
  console.log('SomniaGames Modular SDK Demo');
  console.log('============================');

  // Create a provider (in a real app, this would connect to a real network)
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
  
  try {
    // 1. Create a simple game with minimal configuration
    console.log('\n1. Creating a simple game...');
    const simpleGame = createSimpleGame('My Simple Game', provider);
    console.log('✅ Simple game created');
    
    // Initialize the game
    await simpleGame.initialize();
    console.log('✅ Game initialized');
    
    // Check what modules are available
    console.log('📦 Available modules:');
    if (simpleGame.hasModule('NFTModule')) {
      console.log('  - NFT Module: ✅ Available');
    }
    if (simpleGame.hasModule('PaymentModule')) {
      console.log('  - Payment Module: ✅ Available');
    }
    
    // 2. Create a Tetris game using the template
    console.log('\n2. Creating a Tetris game from template...');
    const tetrisGame = createTetrisGame('My Tetris Clone', provider);
    console.log('✅ Tetris game created');
    
    // Check Tetris-specific assets
    const nftModule = tetrisGame.getNFTModule();
    if (nftModule) {
      const assets = nftModule.getAssets();
      console.log(`🎮 Tetris has ${assets.size} piece types:`);
      for (const [key, asset] of assets.entries()) {
        console.log(`  - ${key}: ${asset.name} (${asset.rarity})`);
      }
    }
    
    // Check payment configuration
    const paymentModule = tetrisGame.getPaymentModule();
    if (paymentModule) {
      const config = paymentModule.getConfig();
      console.log('💰 Payment configuration:');
      console.log(`  Entry fee: ${config.entryFee || 'Free'}`);
      console.log(`  Win reward: ${config.winReward || 'None'}`);
    }
    
    // 3. Create a Chess game using the template
    console.log('\n3. Creating a Chess game from template...');
    const chessGame = createChessGame('My Chess Game', provider);
    console.log('✅ Chess game created');
    
    // Check Chess-specific assets
    const chessNftModule = chessGame.getNFTModule();
    if (chessNftModule) {
      const assets = chessNftModule.getAssets();
      console.log(`♟️ Chess has ${assets.size} piece types:`);
      for (const [key, asset] of assets.entries()) {
        console.log(`  - ${key}: ${asset.name} (${asset.rarity})`);
      }
    }
    
    // 4. Deploy a game (mock implementation)
    console.log('\n4. Deploying Tetris game...');
    const deployment = await tetrisGame.deploy();
    console.log('✅ Game deployed successfully');
    console.log(`📍 Game address: ${deployment.gameAddress}`);
    console.log('📦 Module addresses:');
    Object.entries(deployment.moduleAddresses).forEach(([name, address]) => {
      console.log(`  - ${name}: ${address}`);
    });
    
    console.log('\n🎉 Demo completed successfully!');
    console.log('\n💡 With this modular system, developers can:');
    console.log('   - Create games in minutes with templates');
    console.log('   - Add features through plug-and-play modules');
    console.log('   - Focus on game logic, not blockchain complexity');
    console.log('   - Scale from simple MVPs to complex games');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo
if (require.main === module) {
  modularGameDemo().catch(console.error);
}