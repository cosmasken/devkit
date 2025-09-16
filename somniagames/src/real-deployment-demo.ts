// examples/real-deployment-demo.ts
import { createSimpleGame } from './simple';
import { ethers } from 'ethers';

/**
 * Real Deployment Demo - Demonstrates actual contract deployment
 * 
 * This example shows how the SomniaGames SDK handles real contract deployment
 * using the modular system with actual blockchain interactions.
 */

async function realDeploymentDemo() {
  console.log('SomniaGames Real Deployment Demo');
  console.log('=================================');

  try {
    // Connect to a real provider (in this case, local Hardhat node)
    console.log('\n1. Connecting to blockchain...');
    const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    
    // Get a signer (in a real app, this would be from MetaMask)
    const accounts = await provider.listAccounts();
    if (accounts.length === 0) {
      throw new Error('No accounts found. Please start a local blockchain node.');
    }
    
    const signer = provider.getSigner(accounts[0]);
    const accountAddress = await signer.getAddress();
    console.log(`✅ Connected to account: ${accountAddress.substring(0, 10)}...${accountAddress.substring(accountAddress.length - 8)}`);

    // Check network
    const network = await provider.getNetwork();
    console.log(`🌐 Connected to network: ${network.name} (chainId: ${network.chainId})`);

    // 2. Create a simple game using the modular system
    console.log('\n2. Creating game with modular system...');
    const game = createSimpleGame('Real Deployment Demo', provider, signer);
    console.log('✅ Game instance created');

    // 3. Initialize the game
    console.log('\n3. Initializing game modules...');
    await game.initialize();
    console.log('✅ Game modules initialized');

    // 4. Configure game modules
    console.log('\n4. Configuring game modules...');
    
    // Configure NFT module
    const nftModule = game.getNFTModule();
    if (nftModule) {
      nftModule.defineAssets({
        demoAsset: {
          name: 'Demo Asset',
          symbol: 'DEMO',
          uri: 'https://somniagames.com/assets/demo.json',
          rarity: 'common'
        }
      });
      console.log('  🎨 NFT module configured with demo asset');
    }

    // Configure payment module
    const paymentModule = game.getPaymentModule();
    if (paymentModule) {
      paymentModule.configure({
        entryFee: '0.01 SOM',
        winReward: '1.0 SOM'
      });
      console.log('  💰 Payment module configured');
    }

    // 5. Deploy the game and all modules
    console.log('\n5. Deploying game and modules to blockchain...');
    console.log('   This may take a few moments as contracts are deployed...');
    
    const deployment = await game.deploy();
    
    console.log('✅ Game deployed successfully!');
    console.log(`📍 Game address: ${deployment.gameAddress}`);
    console.log('📦 Module addresses:');
    Object.entries(deployment.moduleAddresses).forEach(([name, address]) => {
      console.log(`   - ${name}: ${address.substring(0, 10)}...${address.substring(address.length - 8)}`);
    });

    // 6. Demonstrate module functionality
    console.log('\n6. Demonstrating module functionality...');
    
    // Mint an NFT asset
    if (nftModule) {
      try {
        console.log('   Minting NFT asset...');
        const assetResult = await nftModule.mintAsset(accountAddress, 'demoAsset', 1);
        console.log(`   ✅ NFT minted successfully!`);
        console.log(`      Token ID: ${assetResult.tokenId}`);
        console.log(`      Transaction: ${assetResult.transactionHash.substring(0, 10)}...${assetResult.transactionHash.substring(assetResult.transactionHash.length - 8)}`);
      } catch (error) {
        console.log(`   ⚠️  Failed to mint NFT: ${(error as Error).message}`);
      }
    }

    // Process a payment
    if (paymentModule) {
      try {
        console.log('   Processing test payment...');
        const paymentResult = await paymentModule.processPayment(
          accountAddress, 
          '0xGameContract', 
          '0.01', 
          'SOM'
        );
        console.log(`   ✅ Payment processed successfully!`);
        console.log(`      Amount: ${paymentResult.amount} ${paymentResult.currency}`);
        console.log(`      Transaction: ${paymentResult.transactionHash.substring(0, 10)}...${paymentResult.transactionHash.substring(paymentResult.transactionHash.length - 8)}`);
      } catch (error) {
        console.log(`   ⚠️  Failed to process payment: ${(error as Error).message}`);
      }
    }

    console.log('\n🎉 Real deployment demo completed successfully!');
    console.log('\n💡 Key benefits demonstrated:');
    console.log('   - Automatic contract deployment');
    console.log('   - Modular system with plug-and-play modules');
    console.log('   - Real blockchain interactions');
    console.log('   - Type-safe TypeScript integration');
    console.log('   - Error handling and transaction management');
    
    console.log('\n🚀 Your game is now live on the blockchain!');
    console.log(`   Game address: ${deployment.gameAddress}`);
    console.log('   Ready for players to join and interact!');

  } catch (error) {
    console.error('\n❌ Demo failed:', error);
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
    }
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  realDeploymentDemo().catch(console.error);
}

export { realDeploymentDemo };