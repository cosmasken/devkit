import { ethers, Contract } from 'ethers';
import { Module } from './Module';

/**
 * YieldFarmingModule - Module for interacting with yield farming contracts
 */
export class YieldFarmingModule extends Module {
  private yieldFarmContract: Contract | null = null;
  private gameTokenContract: Contract | null = null;

  constructor(walletConnector: any) {
    super(walletConnector);
  }

  /**
   * Initialize the yield farming module with contract addresses
   * @param yieldFarmAddress Address of the YieldFarm contract
   * @param gameTokenAddress Address of the GameToken contract
   */
  async initialize(yieldFarmAddress: string, gameTokenAddress: string): Promise<void> {
    if (!this.walletConnector.provider) {
      throw new Error('Wallet not connected');
    }

    // Initialize contracts
    const yieldFarmABI = [
      // Pool info
      "function poolLength() view returns (uint256)",
      "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTime, uint256 accRewardPerShare, uint256 totalStaked, uint256 rewardPerSecond)",
      "function userInfo(uint256, address) view returns (uint256 amount, uint256 rewardDebt, uint256 lastClaimTime)",
      
      // User functions
      "function deposit(uint256 _pid, uint256 _amount)",
      "function withdraw(uint256 _pid, uint256 _amount)",
      "function claim(uint256 _pid)",
      "function pendingRewards(uint256 _pid, address _user) view returns (uint256)",
      
      // Owner functions
      "function add(uint256 _allocPoint, address _lpToken, uint256 _rewardPerSecond, bool _withUpdate)",
      "function set(uint256 _pid, uint256 _allocPoint, uint256 _rewardPerSecond, bool _withUpdate)"
    ];

    const erc20ABI = [
      "function balanceOf(address) view returns (uint256)",
      "function approve(address, uint256) returns (bool)",
      "function transfer(address, uint256) returns (bool)",
      "function transferFrom(address, address, uint256) returns (bool)"
    ];

    this.yieldFarmContract = new ethers.Contract(
      yieldFarmAddress,
      yieldFarmABI,
      this.walletConnector.signer || this.walletConnector.provider
    );

    this.gameTokenContract = new ethers.Contract(
      gameTokenAddress,
      erc20ABI,
      this.walletConnector.signer || this.walletConnector.provider
    );

    console.log('YieldFarmingModule initialized');
  }

  /**
   * Get pool information
   * @param poolId ID of the pool
   * @returns Pool information
   */
  async getPoolInfo(poolId: number): Promise<any> {
    if (!this.yieldFarmContract) {
      throw new Error('YieldFarmingModule not initialized');
    }

    try {
      const poolInfo = await this.yieldFarmContract.poolInfo(poolId);
      return {
        lpToken: poolInfo.lpToken,
        allocPoint: poolInfo.allocPoint.toString(),
        lastRewardTime: poolInfo.lastRewardTime.toString(),
        accRewardPerShare: poolInfo.accRewardPerShare.toString(),
        totalStaked: ethers.utils.formatEther(poolInfo.totalStaked),
        rewardPerSecond: ethers.utils.formatEther(poolInfo.rewardPerSecond)
      };
    } catch (error) {
      throw new Error(`Failed to get pool info: ${error}`);
    }
  }

  /**
   * Get user information for a pool
   * @param poolId ID of the pool
   * @param userAddress Address of the user
   * @returns User information
   */
  async getUserInfo(poolId: number, userAddress: string): Promise<any> {
    if (!this.yieldFarmContract) {
      throw new Error('YieldFarmingModule not initialized');
    }

    try {
      const userInfo = await this.yieldFarmContract.userInfo(poolId, userAddress);
      return {
        amount: ethers.utils.formatEther(userInfo.amount),
        rewardDebt: userInfo.rewardDebt.toString(),
        lastClaimTime: userInfo.lastClaimTime.toString()
      };
    } catch (error) {
      throw new Error(`Failed to get user info: ${error}`);
    }
  }

  /**
   * Get pending rewards for a user in a pool
   * @param poolId ID of the pool
   * @param userAddress Address of the user
   * @returns Pending rewards
   */
  async getPendingRewards(poolId: number, userAddress: string): Promise<string> {
    if (!this.yieldFarmContract) {
      throw new Error('YieldFarmingModule not initialized');
    }

    try {
      const pendingRewards = await this.yieldFarmContract.pendingRewards(poolId, userAddress);
      return ethers.utils.formatEther(pendingRewards);
    } catch (error) {
      throw new Error(`Failed to get pending rewards: ${error}`);
    }
  }

  /**
   * Deposit tokens to a pool
   * @param poolId ID of the pool
   * @param amount Amount of tokens to deposit
   * @returns Transaction hash
   */
  async deposit(poolId: number, amount: string): Promise<string> {
    if (!this.yieldFarmContract || !this.gameTokenContract) {
      throw new Error('YieldFarmingModule not initialized');
    }

    try {
      // Convert amount to wei
      const amountWei = ethers.utils.parseEther(amount);
      
      // Approve tokens for the yield farm
      const approveTx = await this.gameTokenContract.approve(
        this.yieldFarmContract.address,
        amountWei
      );
      await approveTx.wait();
      
      // Deposit tokens
      const depositTx = await this.yieldFarmContract.deposit(poolId, amountWei);
      await depositTx.wait();
      
      return depositTx.hash;
    } catch (error) {
      throw new Error(`Failed to deposit tokens: ${error}`);
    }
  }

  /**
   * Withdraw tokens from a pool
   * @param poolId ID of the pool
   * @param amount Amount of tokens to withdraw
   * @returns Transaction hash
   */
  async withdraw(poolId: number, amount: string): Promise<string> {
    if (!this.yieldFarmContract) {
      throw new Error('YieldFarmingModule not initialized');
    }

    try {
      // Convert amount to wei
      const amountWei = ethers.utils.parseEther(amount);
      
      // Withdraw tokens
      const withdrawTx = await this.yieldFarmContract.withdraw(poolId, amountWei);
      await withdrawTx.wait();
      
      return withdrawTx.hash;
    } catch (error) {
      throw new Error(`Failed to withdraw tokens: ${error}`);
    }
  }

  /**
   * Claim rewards from a pool
   * @param poolId ID of the pool
   * @returns Transaction hash
   */
  async claim(poolId: number): Promise<string> {
    if (!this.yieldFarmContract) {
      throw new Error('YieldFarmingModule not initialized');
    }

    try {
      // Claim rewards
      const claimTx = await this.yieldFarmContract.claim(poolId);
      await claimTx.wait();
      
      return claimTx.hash;
    } catch (error) {
      throw new Error(`Failed to claim rewards: ${error}`);
    }
  }

  /**
   * Get user's token balance
   * @param userAddress Address of the user
   * @returns Token balance
   */
  async getTokenBalance(userAddress: string): Promise<string> {
    if (!this.gameTokenContract) {
      throw new Error('YieldFarmingModule not initialized');
    }

    try {
      const balance = await this.gameTokenContract.balanceOf(userAddress);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      throw new Error(`Failed to get token balance: ${error}`);
    }
  }
}