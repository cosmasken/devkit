// test-sdk.js
const { GameRegistry, GameAsset, GameToken, GameLeaderboard, GameShop } = require('./dist/index.js');
const { ethers } = require('ethers');

// This is a simple test to verify the SDK structure
console.log('Testing SomniaGames SDK...');

// Check that classes exist
console.log('GameRegistry class exists:', typeof GameRegistry);
console.log('GameAsset class exists:', typeof GameAsset);
console.log('GameToken class exists:', typeof GameToken);
console.log('GameLeaderboard class exists:', typeof GameLeaderboard);
console.log('GameShop class exists:', typeof GameShop);

// Test GameRegistry
const mockProvider = new ethers.providers.BaseProvider(1);
const gameRegistry = new GameRegistry(
  '0x123456789012345689012345678901234567890',
  mockProvider
);

console.log('\n--- GameRegistry Methods ---');
console.log('Instance has createGame method:', typeof gameRegistry.createGame === 'function');
console.log('Instance has getGame method:', typeof gameRegistry.getGame === 'function');
console.log('Instance has getGameCount method:', typeof gameRegistry.getGameCount === 'function');
console.log('Instance has getGamesByCreator method:', typeof gameRegistry.getGamesByCreator === 'function');
console.log('Instance has activateGame method:', typeof gameRegistry.activateGame === 'function');
console.log('Instance has deactivateGame method:', typeof gameRegistry.deactivateGame === 'function');
console.log('Instance has updateGame method:', typeof gameRegistry.updateGame === 'function');
console.log('Instance has updateGameMetadata method:', typeof gameRegistry.updateGameMetadata === 'function');
console.log('Instance has updateGameVersion method:', typeof gameRegistry.updateGameVersion === 'function');
console.log('Instance has setGameLeaderboard method:', typeof gameRegistry.setGameLeaderboard === 'function');
console.log('Instance has setGameShop method:', typeof gameRegistry.setGameShop === 'function');
console.log('Instance has joinGame method:', typeof gameRegistry.joinGame === 'function');
console.log('Instance has leaveGame method:', typeof gameRegistry.leaveGame === 'function');
console.log('Instance has getGamePlayers method:', typeof gameRegistry.getGamePlayers === 'function');
console.log('Instance has isPlayerInGame method:', typeof gameRegistry.isPlayerInGame === 'function');
console.log('Instance has getActiveGames method:', typeof gameRegistry.getActiveGames === 'function');
console.log('Instance has getActiveGamesCount method:', typeof gameRegistry.getActiveGamesCount === 'function');

// Test GameAsset
const gameAsset = new GameAsset(
  '0x123456789012345689012345678901234567891',
  mockProvider
);

console.log('\n--- GameAsset Methods ---');
console.log('Instance has createAsset method:', typeof gameAsset.createAsset === 'function');
console.log('Instance has getAsset method:', typeof gameAsset.getAsset === 'function');
console.log('Instance has updateAsset method:', typeof gameAsset.updateAsset === 'function');
console.log('Instance has updateAssetMetadata method:', typeof gameAsset.updateAssetMetadata === 'function');
console.log('Instance has levelUpAsset method:', typeof gameAsset.levelUpAsset === 'function');
console.log('Instance has getAssetsByGame method:', typeof gameAsset.getAssetsByGame === 'function');
console.log('Instance has getAssetsByOwner method:', typeof gameAsset.getAssetsByOwner === 'function');
console.log('Instance has getTotalSupply method:', typeof gameAsset.getTotalSupply === 'function');
console.log('Instance has getOwnerOf method:', typeof gameAsset.getOwnerOf === 'function');
console.log('Instance has getBalanceOf method:', typeof gameAsset.getBalanceOf === 'function');
console.log('Instance has transferAsset method:', typeof gameAsset.transferAsset === 'function');
console.log('Instance has approve method:', typeof gameAsset.approve === 'function');
console.log('Instance has getApproved method:', typeof gameAsset.getApproved === 'function');
console.log('Instance has setApprovalForAll method:', typeof gameAsset.setApprovalForAll === 'function');
console.log('Instance has isApprovedForAll method:', typeof gameAsset.isApprovedForAll === 'function');

// Test GameToken
const gameToken = new GameToken(
  '0x123456789012345689012345678901234567892',
  mockProvider
);

console.log('\n--- GameToken Methods ---');
console.log('Instance has getName method:', typeof gameToken.getName === 'function');
console.log('Instance has getSymbol method:', typeof gameToken.getSymbol === 'function');
console.log('Instance has getDecimals method:', typeof gameToken.getDecimals === 'function');
console.log('Instance has getTotalSupply method:', typeof gameToken.getTotalSupply === 'function');
console.log('Instance has getBalanceOf method:', typeof gameToken.getBalanceOf === 'function');
console.log('Instance has transfer method:', typeof gameToken.transfer === 'function');
console.log('Instance has getAllowance method:', typeof gameToken.getAllowance === 'function');
console.log('Instance has approve method:', typeof gameToken.approve === 'function');
console.log('Instance has transferFrom method:', typeof gameToken.transferFrom === 'function');
console.log('Instance has claimDailyTokens method:', typeof gameToken.claimDailyTokens === 'function');
console.log('Instance has mint method:', typeof gameToken.mint === 'function');
console.log('Instance has burn method:', typeof gameToken.burn === 'function');
console.log('Instance has burnFrom method:', typeof gameToken.burnFrom === 'function');
console.log('Instance has updateDailyClaimAmount method:', typeof gameToken.updateDailyClaimAmount === 'function');
console.log('Instance has updateClaimCooldown method:', typeof gameToken.updateClaimCooldown === 'function');
console.log('Instance has pause method:', typeof gameToken.pause === 'function');
console.log('Instance has unpause method:', typeof gameToken.unpause === 'function');
console.log('Instance has getLastClaimTime method:', typeof gameToken.getLastClaimTime === 'function');
console.log('Instance has getDailyClaimAmount method:', typeof gameToken.getDailyClaimAmount === 'function');
console.log('Instance has getClaimCooldown method:', typeof gameToken.getClaimCooldown === 'function');

// Test GameLeaderboard
const gameLeaderboard = new GameLeaderboard(
  '0x123456789012345689012345678901234567893',
  mockProvider
);

console.log('\n--- GameLeaderboard Methods ---');
console.log('Instance has createLeaderboard method:', typeof gameLeaderboard.createLeaderboard === 'function');
console.log('Instance has updateLeaderboard method:', typeof gameLeaderboard.updateLeaderboard === 'function');
console.log('Instance has activateLeaderboard method:', typeof gameLeaderboard.activateLeaderboard === 'function');
console.log('Instance has deactivateLeaderboard method:', typeof gameLeaderboard.deactivateLeaderboard === 'function');
console.log('Instance has submitScore method:', typeof gameLeaderboard.submitScore === 'function');
console.log('Instance has getLeaderboard method:', typeof gameLeaderboard.getLeaderboard === 'function');
console.log('Instance has getTopScores method:', typeof gameLeaderboard.getTopScores === 'function');
console.log('Instance has getPlayerRank method:', typeof gameLeaderboard.getPlayerRank === 'function');
console.log('Instance has getPlayerScore method:', typeof gameLeaderboard.getPlayerScore === 'function');
console.log('Instance has getLeaderboardCount method:', typeof gameLeaderboard.getLeaderboardCount === 'function');
console.log('Instance has getLeaderboardsByGame method:', typeof gameLeaderboard.getLeaderboardsByGame === 'function');

// Test GameShop
const gameShop = new GameShop(
  '0x123456789012345689012345678901234567894',
  mockProvider
);

console.log('\n--- GameShop Methods ---');
console.log('Instance has createItem method:', typeof gameShop.createItem === 'function');
console.log('Instance has updateItem method:', typeof gameShop.updateItem === 'function');
console.log('Instance has restockItem method:', typeof gameShop.restockItem === 'function');
console.log('Instance has activateItem method:', typeof gameShop.activateItem === 'function');
console.log('Instance has deactivateItem method:', typeof gameShop.deactivateItem === 'function');
console.log('Instance has purchaseItem method:', typeof gameShop.purchaseItem === 'function');
console.log('Instance has getItem method:', typeof gameShop.getItem === 'function');
console.log('Instance has getItemsByGame method:', typeof gameShop.getItemsByGame === 'function');
console.log('Instance has getPurchaseHistory method:', typeof gameShop.getPurchaseHistory === 'function');
console.log('Instance has getItemCount method:', typeof gameShop.getItemCount === 'function');
console.log('Instance has getPurchaseCount method:', typeof gameShop.getPurchaseCount === 'function');
console.log('Instance has updatePlatformFee method:', typeof gameShop.updatePlatformFee === 'function');
console.log('Instance has updateFeeRecipient method:', typeof gameShop.updateFeeRecipient === 'function');
console.log('Instance has getPlatformFee method:', typeof gameShop.getPlatformFee === 'function');
console.log('Instance has getFeeRecipient method:', typeof gameShop.getFeeRecipient === 'function');

console.log('\nSDK test completed successfully!');