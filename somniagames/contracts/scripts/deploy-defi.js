// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Get accounts
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy GameToken (if not already deployed)
  // For this example, we'll assume GameToken is already deployed
  // In a real scenario, you would deploy it here or get its address from a config file
  
  // For demonstration purposes, let's assume the GameToken address
  const gameTokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with actual address
  
  // Deploy YieldFarm
  console.log("Deploying YieldFarm...");
  const YieldFarm = await hre.ethers.getContractFactory("YieldFarm");
  const yieldFarm = await YieldFarm.deploy(
    gameTokenAddress,  // Game token address
    hre.ethers.utils.parseEther("1"), // 1 token per second reward
    Math.floor(Date.now() / 1000), // Start time (now)
    Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // End time (30 days from now)
  );
  
  await yieldFarm.deployed();
  console.log("YieldFarm deployed to:", yieldFarm.address);

  // Deploy LendingPool
  console.log("Deploying LendingPool...");
  const LendingPool = await hre.ethers.getContractFactory("LendingPool");
  const lendingPool = await LendingPool.deploy(
    gameTokenAddress, // Lending token
    deployer.address  // Treasury address
  );
  
  await lendingPool.deployed();
  console.log("LendingPool deployed to:", lendingPool.address);

  // Deploy GameAMM
  console.log("Deploying GameAMM...");
  const GameAMM = await hre.ethers.getContractFactory("GameAMM");
  const gameAMM = await GameAMM.deploy(
    deployer.address  // Treasury address
  );
  
  await gameAMM.deployed();
  console.log("GameAMM deployed to:", gameAMM.address);

  // Deploy GuildVault
  console.log("Deploying GuildVault...");
  const GuildVault = await hre.ethers.getContractFactory("GuildVault");
  const guildVault = await GuildVault.deploy(
    "Somnia Champions", // Guild name
    "Guild for top Somnia players", // Guild description
    [deployer.address], // Initial admins
    1 // Required confirmations
  );
  
  await guildVault.deployed();
  console.log("GuildVault deployed to:", guildVault.address);

  // Save contract addresses to a file
  const fs = require("fs");
  const contracts = {
    YieldFarm: yieldFarm.address,
    LendingPool: lendingPool.address,
    GameAMM: gameAMM.address,
    GuildVault: guildVault.address
  };
  
  fs.writeFileSync(
    "deployed-contracts.json",
    JSON.stringify(contracts, null, 2)
  );
  
  console.log("Contract addresses saved to deployed-contracts.json");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });