// DeFi Integration Demo for SomniaGames
// This example demonstrates how to use all the new DeFi modules together

import { WalletConnector } from '../src/WalletConnector';
import { YieldFarmingModule } from '../src/modules/YieldFarmingModule';
import { LendingModule } from '../src/modules/LendingModule';
import { AMMModule } from '../src/modules/AMMModule';
import { GuildModule } from '../src/modules/GuildModule';
import { ethers } from 'ethers';

// Contract addresses (these would be replaced with actual deployed addresses)
const CONTRACT_ADDRESSES = {
  YIELD_FARM: '0x...',
  LENDING_POOL: '0x...',
  GAME_AMM: '0x...',
  GUILD_VAULT: '0x...',
  GAME_TOKEN: '0x...', // Address of the main game token
};

async function runDefiDemo() {
  console.log('🚀 Starting SomniaGames DeFi Integration Demo');
  
  // Initialize wallet connector
  const walletConnector = new WalletConnector({
    rpcUrl: 'https://rpc.testnet.somnia.network',
    chainId: 2323
  });
  
  try {
    // Connect wallet (in a real app, this would be triggered by user action)
    await walletConnector.connect();
    console.log('✅ Wallet connected');
    
    // Initialize modules
    const yieldFarmingModule = new YieldFarmingModule(walletConnector);
    const lendingModule = new LendingModule(walletConnector);
    const ammModule = new AMMModule(walletConnector);
    const guildModule = new GuildModule(walletConnector);
    
    // Initialize modules with contract addresses
    await yieldFarmingModule.initialize(CONTRACT_ADDRESSES.YIELD_FARM, CONTRACT_ADDRESSES.GAME_TOKEN);
    await lendingModule.initialize(CONTRACT_ADDRESSES.LENDING_POOL, CONTRACT_ADDRESSES.GAME_TOKEN);
    await ammModule.initialize(CONTRACT_ADDRESSES.GAME_AMM);
    await guildModule.initialize(CONTRACT_ADDRESSES.GUILD_VAULT);
    
    console.log('✅ All modules initialized');
    
    // 1. Yield Farming Demo
    console.log('\n🌾 Yield Farming Demo');
    try {
      // Get user token balance
      const userAddress = await walletConnector.getAddress();
      const tokenBalance = await yieldFarmingModule.getTokenBalance(userAddress);
      console.log(`User token balance: ${tokenBalance}`);
      
      // Assume we have a pool with ID 0
      const poolId = 0;
      
      // Get pool info
      const poolInfo = await yieldFarmingModule.getPoolInfo(poolId);
      console.log(`Pool info:`, poolInfo);
      
      // Get pending rewards
      const pendingRewards = await yieldFarmingModule.getPendingRewards(poolId, userAddress);
      console.log(`Pending rewards: ${pendingRewards}`);
      
      // Deposit tokens (only if user has tokens)
      if (parseFloat(tokenBalance) > 0) {
        const depositAmount = "10"; // Deposit 10 tokens
        const txHash = await yieldFarmingModule.deposit(poolId, depositAmount);
        console.log(`Deposit transaction: ${txHash}`);
      }
      
      console.log('✅ Yield farming demo completed');
    } catch (error) {
      console.error('❌ Yield farming demo failed:', error.message);
    }
    
    // 2. Lending Demo
    console.log('\n💰 Lending Demo');
    try {
      // Get asset info
      const assetInfo = await lendingModule.getAssetInfo(CONTRACT_ADDRESSES.GAME_TOKEN);
      console.log(`Asset info:`, assetInfo);
      
      // Get collateral info (assuming we have an NFT contract)
      // const collateralInfo = await lendingModule.getCollateralInfo(NFT_CONTRACT_ADDRESS);
      // console.log(`Collateral info:`, collateralInfo);
      
      console.log('✅ Lending demo completed');
    } catch (error) {
      console.error('❌ Lending demo failed:', error.message);
    }
    
    // 3. AMM Demo
    console.log('\n💱 AMM Demo');
    try {
      // Get pool info (assuming we have a pool with ID 0)
      const poolId = 0;
      const ammPoolInfo = await ammModule.getPoolInfo(poolId);
      console.log(`AMM Pool info:`, ammPoolInfo);
      
      // Get amount out for a swap (example values)
      // const amountOut = await ammModule.getAmountOut(poolId, TOKEN_A_ADDRESS, TOKEN_B_ADDRESS, "1");
      // console.log(`Amount out for 1 token A: ${amountOut} token B`);
      
      console.log('✅ AMM demo completed');
    } catch (error) {
      console.error('❌ AMM demo failed:', error.message);
    }
    
    // 4. Guild Demo
    console.log('\n🏛️ Guild Demo');
    try {
      // Get guild info
      const guildInfo = await guildModule.getGuildInfo();
      console.log(`Guild info:`, guildInfo);
      
      // Get member info
      const userAddress = await walletConnector.getAddress();
      const memberInfo = await guildModule.getMemberInfo(userAddress);
      console.log(`Member info:`, memberInfo);
      
      // Get member count
      const memberCount = await guildModule.getMemberCount();
      console.log(`Member count: ${memberCount}`);
      
      console.log('✅ Guild demo completed');
    } catch (error) {
      console.error('❌ Guild demo failed:', error.message);
    }
    
    console.log('\n🎉 All demos completed successfully!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

// Run the demo
runDefiDemo().catch(console.error);