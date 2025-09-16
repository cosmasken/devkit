// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
  // Deploy GameRegistry
  console.log("\nDeploying GameRegistry...");
  const GameRegistry = await ethers.getContractFactory("GameRegistry");
  const gameRegistry = await GameRegistry.deploy();
  await gameRegistry.deployed();
  console.log("GameRegistry deployed to:", gameRegistry.address);
  
  // Deploy GameAsset
  console.log("\nDeploying GameAsset...");
  const GameAsset = await ethers.getContractFactory("GameAsset");
  const gameAsset = await GameAsset.deploy();
  await gameAsset.deployed();
  console.log("GameAsset deployed to:", gameAsset.address);
  
  // Deploy GameToken
  console.log("\nDeploying GameToken...");
  const GameToken = await ethers.getContractFactory("GameToken");
  const gameToken = await GameToken.deploy(
    "Somnia Game Token",
    "SGT",
    1000000, // 1M initial supply
    100,     // 100 tokens daily claim
    86400    // 24 hour cooldown
  );
  await gameToken.deployed();
  console.log("GameToken deployed to:", gameToken.address);
  
  // Deploy GameLeaderboard
  console.log("\nDeploying GameLeaderboard...");
  const GameLeaderboard = await ethers.getContractFactory("GameLeaderboard");
  const gameLeaderboard = await GameLeaderboard.deploy();
  await gameLeaderboard.deployed();
  console.log("GameLeaderboard deployed to:", gameLeaderboard.address);
  
  // Deploy GameShop
  console.log("\nDeploying GameShop...");
  const GameShop = await ethers.getContractFactory("GameShop");
  const gameShop = await GameShop.deploy(
    250, // 2.5% platform fee
    deployer.address // fee recipient
  );
  await gameShop.deployed();
  console.log("GameShop deployed to:", gameShop.address);
  
  // Transfer ownership of GameAsset and GameToken to GameRegistry owner
  console.log("\nTransferring ownership...");
  await gameAsset.transferOwnership(deployer.address);
  await gameToken.transferOwnership(deployer.address);
  await gameLeaderboard.transferOwnership(deployer.address);
  await gameShop.transferOwnership(deployer.address);
  console.log("Ownership transferred successfully!");
  
  // Associate the new contracts with a test game
  console.log("\nAssociating contracts with test game...");
  let tx = await gameRegistry.createGame(
    "Test Game", 
    "A test game for verification",
    "https://example.com/game-metadata.json"
  );
  await tx.wait();
  console.log("Test game created successfully!");
  
  // Set the leaderboard and shop for the test game
  tx = await gameRegistry.setGameLeaderboard(1, gameLeaderboard.address);
  await tx.wait();
  console.log("Leaderboard associated with test game!");
  
  tx = await gameRegistry.setGameShop(1, gameShop.address);
  await tx.wait();
  console.log("Shop associated with test game!");
  
  // Create a test asset
  tx = await gameAsset.createAsset(
    deployer.address,
    "Test Asset",
    "A test asset for verification",
    "https://example.com/asset-metadata.json",
    1, // game ID
    3  // rarity
  );
  await tx.wait();
  console.log("Test asset created successfully!");
  
  // Mint some test tokens
  tx = await gameToken.mint(deployer.address, 1000);
  await tx.wait();
  console.log("Test tokens minted successfully!");
  
  // Create a test leaderboard
  tx = await gameLeaderboard.createLeaderboard(
    "High Scores",
    "Top players leaderboard",
    1 // game ID
  );
  await tx.wait();
  console.log("Test leaderboard created successfully!");
  
  // Create a test shop item
  tx = await gameShop.createItem(
    "Power-Up",
    "Extra life power-up",
    "https://example.com/powerup-metadata.json",
    100, // price in tokens
    gameToken.address,
    1, // game ID
    100 // max quantity
  );
  await tx.wait();
  console.log("Test shop item created successfully!");
  
  console.log("\nAll contracts deployed and verified successfully!");
  console.log("\nContract Addresses:");
  console.log("  GameRegistry:    ", gameRegistry.address);
  console.log("  GameAsset:       ", gameAsset.address);
  console.log("  GameToken:       ", gameToken.address);
  console.log("  GameLeaderboard: ", gameLeaderboard.address);
  console.log("  GameShop:        ", gameShop.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });