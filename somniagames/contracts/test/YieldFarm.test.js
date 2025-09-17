const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("YieldFarm", function () {
  let YieldFarm, yieldFarm, GameToken, gameToken;
  let owner, addr1, addr2;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy GameToken
    GameToken = await ethers.getContractFactory("GameToken");
    gameToken = await GameToken.deploy(
      "GameToken",
      "GT",
      1000000, // initial supply
      100,     // daily claim amount
      86400    // claim cooldown (24 hours)
    );
    await gameToken.deployed();

    // Deploy YieldFarm
    YieldFarm = await ethers.getContractFactory("YieldFarm");
    yieldFarm = await YieldFarm.deploy(
      gameToken.address,
      ethers.utils.parseEther("1"), // 1 token per second
      Math.floor(Date.now() / 1000), // start time
      Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // end time (30 days)
    );
    await yieldFarm.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await yieldFarm.owner()).to.equal(owner.address);
    });

    it("Should set the correct game token", async function () {
      expect(await yieldFarm.gameToken()).to.equal(gameToken.address);
    });

    it("Should set the correct reward per second", async function () {
      expect(await yieldFarm.rewardPerSecond()).to.equal(ethers.utils.parseEther("1"));
    });
  });

  describe("Pool Management", function () {
    it("Should allow owner to add a pool", async function () {
      // Mint some tokens for testing
      await gameToken.mint(owner.address, 1000);
      
      // Approve tokens for the yield farm
      await gameToken.approve(yieldFarm.address, 1000);
      
      // Add a pool
      await expect(yieldFarm.add(100, gameToken.address, ethers.utils.parseEther("0.1"), true))
        .to.emit(yieldFarm, "PoolAdded")
        .withArgs(0, gameToken.address, 100);
        
      expect(await yieldFarm.poolLength()).to.equal(1);
    });
  });

  describe("Staking", function () {
    it("Should allow users to deposit tokens", async function () {
      // Mint tokens for addr1
      await gameToken.mint(addr1.address, 1000);
      
      // Add a pool
      await yieldFarm.add(100, gameToken.address, ethers.utils.parseEther("0.1"), true);
      
      // Connect as addr1 and approve tokens
      await gameToken.connect(addr1).approve(yieldFarm.address, 1000);
      
      // Deposit tokens
      await expect(yieldFarm.connect(addr1).deposit(0, 100))
        .to.emit(yieldFarm, "Deposit")
        .withArgs(addr1.address, 0, 100);
    });
  });
});