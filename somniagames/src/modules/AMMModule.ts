import { ethers, Contract } from 'ethers';
import { Module } from './Module';

/**
 * AMMModule - Module for interacting with automated market maker contracts
 */
export class AMMModule extends Module {
  private ammContract: Contract | null = null;
  private lpTokenContract: Contract | null = null;

  constructor(walletConnector: any) {
    super(walletConnector);
  }

  /**
   * Initialize the AMM module with contract addresses
   * @param ammAddress Address of the GameAMM contract
   */
  async initialize(ammAddress: string): Promise<void> {
    if (!this.walletConnector.provider) {
      throw new Error('Wallet not connected');
    }

    // Initialize contracts
    const ammABI = [
      // Pool info
      "function pools(uint256) view returns (address tokenA, address tokenB, uint256 reserveA, uint256 reserveB, uint256 totalSupply)",
      "function poolCounter() view returns (uint256)",
      "function getReserves(uint256 _poolId) view returns (uint256 reserveA, uint256 reserveB)",
      
      // Liquidity functions
      "function createPool(address _tokenA, address _tokenB) returns (uint256)",
      "function addLiquidity(uint256 _poolId, uint256 _amountA, uint256 _amountB)",
      "function removeLiquidity(uint256 _poolId, uint256 _lpAmount)",
      
      // Swap functions
      "function swap(uint256 _poolId, address _fromToken, address _toToken, uint256 _amountIn) returns (uint256)",
      "function getAmountOut(uint256 _poolId, address _fromToken, address _toToken, uint256 _amountIn) view returns (uint256)",
      
      // NFT functions
      "function listNFT(address _nftContract, uint256 _tokenId, uint256 _price)",
      "function updateNFTPrice(address _nftContract, uint256 _tokenId, uint256 _newPrice)",
      "function buyNFT(address _nftContract, uint256 _tokenId)",
      "function getNFTPrice(address _nftContract, uint256 _tokenId) view returns (uint256)",
      "function isNFTForSale(address _nftContract, uint256 _tokenId) view returns (bool)",
      
      // LP token functions
      "function getLPTokenBalance(address user) view returns (uint256)"
    ];

    const erc20ABI = [
      "function balanceOf(address) view returns (uint256)",
      "function approve(address, uint256) returns (bool)",
      "function transfer(address, uint256) returns (bool)",
      "function transferFrom(address, address, uint256) returns (bool)"
    ];

    const erc721ABI = [
      "function ownerOf(uint256) view returns (address)",
      "function transferFrom(address, address, uint256)",
      "function approve(address, uint256)",
      "function setApprovalForAll(address, bool)"
    ];

    this.ammContract = new ethers.Contract(
      ammAddress,
      ammABI,
      this.walletConnector.signer || this.walletConnector.provider
    );

    console.log('AMMModule initialized');
  }

  /**
   * Get pool information
   * @param poolId ID of the pool
   * @returns Pool information
   */
  async getPoolInfo(poolId: number): Promise<any> {
    if (!this.ammContract) {
      throw new Error('AMMModule not initialized');
    }

    try {
      const poolInfo = await this.ammContract.pools(poolId);
      const reserves = await this.ammContract.getReserves(poolId);
      
      return {
        tokenA: poolInfo.tokenA,
        tokenB: poolInfo.tokenB,
        reserveA: ethers.utils.formatEther(reserves.reserveA),
        reserveB: ethers.utils.formatEther(reserves.reserveB),
        totalSupply: poolInfo.totalSupply.toString()
      };
    } catch (error) {
      throw new Error(`Failed to get pool info: ${error}`);
    }
  }

  /**
   * Create a liquidity pool
   * @param tokenA Address of the first token
   * @param tokenB Address of the second token
   * @returns Pool ID
   */
  async createPool(tokenA: string, tokenB: string): Promise<number> {
    if (!this.ammContract) {
      throw new Error('AMMModule not initialized');
    }

    try {
      const createTx = await this.ammContract.createPool(tokenA, tokenB);
      const receipt = await createTx.wait();
      
      // Extract pool ID from event logs
      const poolCreatedEvent = receipt.events?.find((event: any) => event.event === "PoolCreated");
      const poolId = poolCreatedEvent?.args?.poolId;
      
      return poolId ? poolId.toNumber() : 0;
    } catch (error) {
      throw new Error(`Failed to create pool: ${error}`);
    }
  }

  /**
   * Add liquidity to a pool
   * @param poolId ID of the pool
   * @param amountA Amount of token A
   * @param amountB Amount of token B
   * @returns Transaction hash
   */
  async addLiquidity(poolId: number, amountA: string, amountB: string): Promise<string> {
    if (!this.ammContract) {
      throw new Error('AMMModule not initialized');
    }

    try {
      // Convert amounts to wei
      const amountAWei = ethers.utils.parseEther(amountA);
      const amountBWei = ethers.utils.parseEther(amountB);
      
      // Add liquidity
      const addLiquidityTx = await this.ammContract.addLiquidity(poolId, amountAWei, amountBWei);
      await addLiquidityTx.wait();
      
      return addLiquidityTx.hash;
    } catch (error) {
      throw new Error(`Failed to add liquidity: ${error}`);
    }
  }

  /**
   * Remove liquidity from a pool
   * @param poolId ID of the pool
   * @param lpAmount Amount of LP tokens to remove
   * @returns Transaction hash
   */
  async removeLiquidity(poolId: number, lpAmount: string): Promise<string> {
    if (!this.ammContract) {
      throw new Error('AMMModule not initialized');
    }

    try {
      // Convert LP amount to wei
      const lpAmountWei = ethers.utils.parseEther(lpAmount);
      
      // Remove liquidity
      const removeLiquidityTx = await this.ammContract.removeLiquidity(poolId, lpAmountWei);
      await removeLiquidityTx.wait();
      
      return removeLiquidityTx.hash;
    } catch (error) {
      throw new Error(`Failed to remove liquidity: ${error}`);
    }
  }

  /**
   * Swap tokens
   * @param poolId ID of the pool
   * @param fromToken Address of the token to swap from
   * @param toToken Address of the token to swap to
   * @param amountIn Amount of tokens to swap
   * @returns Amount of tokens received
   */
  async swap(poolId: number, fromToken: string, toToken: string, amountIn: string): Promise<string> {
    if (!this.ammContract) {
      throw new Error('AMMModule not initialized');
    }

    try {
      // Convert amount to wei
      const amountInWei = ethers.utils.parseEther(amountIn);
      
      // Swap tokens
      const swapTx = await this.ammContract.swap(poolId, fromToken, toToken, amountInWei);
      const receipt = await swapTx.wait();
      
      // Extract amount out from event logs
      const swapEvent = receipt.events?.find((event: any) => event.event === "Swap");
      const amountOut = swapEvent?.args?.amountOut;
      
      return amountOut ? ethers.utils.formatEther(amountOut) : "0";
    } catch (error) {
      throw new Error(`Failed to swap tokens: ${error}`);
    }
  }

  /**
   * Get amount out for a swap
   * @param poolId ID of the pool
   * @param fromToken Address of the token to swap from
   * @param toToken Address of the token to swap to
   * @param amountIn Amount of tokens to swap
   * @returns Amount of tokens that would be received
   */
  async getAmountOut(poolId: number, fromToken: string, toToken: string, amountIn: string): Promise<string> {
    if (!this.ammContract) {
      throw new Error('AMMModule not initialized');
    }

    try {
      // Convert amount to wei
      const amountInWei = ethers.utils.parseEther(amountIn);
      
      // Get amount out
      const amountOut = await this.ammContract.getAmountOut(poolId, fromToken, toToken, amountInWei);
      return ethers.utils.formatEther(amountOut);
    } catch (error) {
      throw new Error(`Failed to get amount out: ${error}`);
    }
  }

  /**
   * List an NFT for sale
   * @param nftContract Address of the NFT contract
   * @param tokenId ID of the NFT
   * @param price Price in tokens
   * @returns Transaction hash
   */
  async listNFT(nftContract: string, tokenId: number, price: string): Promise<string> {
    if (!this.ammContract) {
      throw new Error('AMMModule not initialized');
    }

    try {
      // Convert price to wei
      const priceWei = ethers.utils.parseEther(price);
      
      // List NFT
      const listTx = await this.ammContract.listNFT(nftContract, tokenId, priceWei);
      await listTx.wait();
      
      return listTx.hash;
    } catch (error) {
      throw new Error(`Failed to list NFT: ${error}`);
    }
  }

  /**
   * Update NFT price
   * @param nftContract Address of the NFT contract
   * @param tokenId ID of the NFT
   * @param newPrice New price in tokens
   * @returns Transaction hash
   */
  async updateNFTPrice(nftContract: string, tokenId: number, newPrice: string): Promise<string> {
    if (!this.ammContract) {
      throw new Error('AMMModule not initialized');
    }

    try {
      // Convert price to wei
      const priceWei = ethers.utils.parseEther(newPrice);
      
      // Update NFT price
      const updateTx = await this.ammContract.updateNFTPrice(nftContract, tokenId, priceWei);
      await updateTx.wait();
      
      return updateTx.hash;
    } catch (error) {
      throw new Error(`Failed to update NFT price: ${error}`);
    }
  }

  /**
   * Buy an NFT
   * @param nftContract Address of the NFT contract
   * @param tokenId ID of the NFT
   * @returns Transaction hash
   */
  async buyNFT(nftContract: string, tokenId: number): Promise<string> {
    if (!this.ammContract) {
      throw new Error('AMMModule not initialized');
    }

    try {
      // Buy NFT
      const buyTx = await this.ammContract.buyNFT(nftContract, tokenId);
      await buyTx.wait();
      
      return buyTx.hash;
    } catch (error) {
      throw new Error(`Failed to buy NFT: ${error}`);
    }
  }

  /**
   * Get NFT price
   * @param nftContract Address of the NFT contract
   * @param tokenId ID of the NFT
   * @returns Price of the NFT
   */
  async getNFTPrice(nftContract: string, tokenId: number): Promise<string> {
    if (!this.ammContract) {
      throw new Error('AMMModule not initialized');
    }

    try {
      const price = await this.ammContract.getNFTPrice(nftContract, tokenId);
      return ethers.utils.formatEther(price);
    } catch (error) {
      throw new Error(`Failed to get NFT price: ${error}`);
    }
  }

  /**
   * Check if an NFT is for sale
   * @param nftContract Address of the NFT contract
   * @param tokenId ID of the NFT
   * @returns Whether the NFT is for sale
   */
  async isNFTForSale(nftContract: string, tokenId: number): Promise<boolean> {
    if (!this.ammContract) {
      throw new Error('AMMModule not initialized');
    }

    try {
      return await this.ammContract.isNFTForSale(nftContract, tokenId);
    } catch (error) {
      throw new Error(`Failed to check NFT sale status: ${error}`);
    }
  }
}