// src/GameToken.ts
import { ethers } from 'ethers';

export class GameToken {
  private contract: ethers.Contract;
  private provider: ethers.providers.Provider;
  private signer: ethers.Signer | null = null;

  constructor(
    contractAddress: string, 
    provider: ethers.providers.Provider, 
    signer?: ethers.Signer
  ) {
    // ABI for GameToken contract
    const abi = [
      // ERC20 functions
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address account) view returns (uint256)",
      "function transfer(address to, uint256 amount) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) returns (bool)",
      
      // GameToken specific functions
      "function claimDailyTokens()",
      "function mint(address to, uint256 amount)",
      "function burn(address from, uint256 amount)",
      "function burn(uint256 amount)",
      "function updateDailyClaimAmount(uint256 _dailyClaimAmount)",
      "function updateClaimCooldown(uint256 _claimCooldown)",
      "function pause()",
      "function unpause()",
      "function lastClaimTime(address) view returns (uint256)",
      "function dailyClaimAmount() view returns (uint256)",
      "function claimCooldown() view returns (uint256)",
      
      // Events
      "event Transfer(address indexed from, address indexed to, uint256 value)",
      "event Approval(address indexed owner, address indexed spender, uint256 value)",
      "event TokensClaimed(address indexed user, uint256 amount)",
      "event DailyClaimAmountUpdated(uint256 newAmount)",
      "event ClaimCooldownUpdated(uint256 newCooldown)"
    ];
    
    this.provider = provider;
    this.contract = new ethers.Contract(contractAddress, abi, provider);
    
    if (signer) {
      this.signer = signer;
      this.contract = this.contract.connect(signer);
    }
  }

  /**
   * Get token name
   * @returns Token name
   */
  async getName(): Promise<string> {
    try {
      return await this.contract.name();
    } catch (error: any) {
      throw new Error(`Failed to get token name: ${error.message || error}`);
    }
  }

  /**
   * Get token symbol
   * @returns Token symbol
   */
  async getSymbol(): Promise<string> {
    try {
      return await this.contract.symbol();
    } catch (error: any) {
      throw new Error(`Failed to get token symbol: ${error.message || error}`);
    }
  }

  /**
   * Get token decimals
   * @returns Token decimals
   */
  async getDecimals(): Promise<number> {
    try {
      const decimals = await this.contract.decimals();
      return decimals.toNumber();
    } catch (error: any) {
      throw new Error(`Failed to get token decimals: ${error.message || error}`);
    }
  }

  /**
   * Get total supply
   * @returns Total supply
   */
  async getTotalSupply(): Promise<ethers.BigNumber> {
    try {
      return await this.contract.totalSupply();
    } catch (error: any) {
      throw new Error(`Failed to get total supply: ${error.message || error}`);
    }
  }

  /**
   * Get balance of an account
   * @param account Address of the account
   * @returns Balance of the account
   */
  async getBalanceOf(account: string): Promise<ethers.BigNumber> {
    if (!ethers.utils.isAddress(account)) {
      throw new Error('Invalid account address');
    }
    
    try {
      return await this.contract.balanceOf(account);
    } catch (error: any) {
      throw new Error(`Failed to get balance for ${account}: ${error.message || error}`);
    }
  }

  /**
   * Transfer tokens to another address
   * @param to Address to transfer to
   * @param amount Amount to transfer
   * @returns Transaction receipt
   */
  async transfer(to: string, amount: ethers.BigNumberish): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to transfer tokens');
    }
    
    if (!ethers.utils.isAddress(to)) {
      throw new Error('Invalid recipient address');
    }
    
    try {
      const tx = await this.contract.transfer(to, amount);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to transfer tokens: ${error.message || error}`);
    }
  }

  /**
   * Get allowance for a spender
   * @param owner Address of the owner
   * @param spender Address of the spender
   * @returns Allowance amount
   */
  async getAllowance(owner: string, spender: string): Promise<ethers.BigNumber> {
    if (!ethers.utils.isAddress(owner) || !ethers.utils.isAddress(spender)) {
      throw new Error('Invalid address');
    }
    
    try {
      return await this.contract.allowance(owner, spender);
    } catch (error: any) {
      throw new Error(`Failed to get allowance: ${error.message || error}`);
    }
  }

  /**
   * Approve a spender to transfer tokens
   * @param spender Address of the spender
   * @param amount Amount to approve
   * @returns Transaction receipt
   */
  async approve(spender: string, amount: ethers.BigNumberish): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to approve spender');
    }
    
    if (!ethers.utils.isAddress(spender)) {
      throw new Error('Invalid spender address');
    }
    
    try {
      const tx = await this.contract.approve(spender, amount);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to approve spender: ${error.message || error}`);
    }
  }

  /**
   * Transfer tokens from one address to another
   * @param from Address to transfer from
   * @param to Address to transfer to
   * @param amount Amount to transfer
   * @returns Transaction receipt
   */
  async transferFrom(from: string, to: string, amount: ethers.BigNumberish): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to transfer tokens');
    }
    
    if (!ethers.utils.isAddress(from) || !ethers.utils.isAddress(to)) {
      throw new Error('Invalid address');
    }
    
    try {
      const tx = await this.contract.transferFrom(from, to, amount);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to transfer tokens: ${error.message || error}`);
    }
  }

  /**
   * Claim daily tokens
   * @returns Transaction receipt
   */
  async claimDailyTokens(): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to claim daily tokens');
    }
    
    try {
      const tx = await this.contract.claimDailyTokens();
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to claim daily tokens: ${error.message || error}`);
    }
  }

  /**
   * Mint new tokens
   * @param to Address to mint to
   * @param amount Amount to mint
   * @returns Transaction receipt
   */
  async mint(to: string, amount: ethers.BigNumberish): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to mint tokens');
    }
    
    if (!ethers.utils.isAddress(to)) {
      throw new Error('Invalid recipient address');
    }
    
    try {
      const tx = await this.contract.mint(to, amount);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to mint tokens: ${error.message || error}`);
    }
  }

  /**
   * Burn tokens from own address
   * @param amount Amount to burn
   * @returns Transaction receipt
   */
  async burn(amount: ethers.BigNumberish): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to burn tokens');
    }
    
    try {
      const tx = await this.contract.burn(amount);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to burn tokens: ${error.message || error}`);
    }
  }

  /**
   * Burn tokens from another address (owner only)
   * @param from Address to burn from
   * @param amount Amount to burn
   * @returns Transaction receipt
   */
  async burnFrom(from: string, amount: ethers.BigNumberish): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to burn tokens');
    }
    
    if (!ethers.utils.isAddress(from)) {
      throw new Error('Invalid address');
    }
    
    try {
      const tx = await this.contract.burn(from, amount);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to burn tokens: ${error.message || error}`);
    }
  }

  /**
   * Update daily claim amount (owner only)
   * @param dailyClaimAmount New daily claim amount
   * @returns Transaction receipt
   */
  async updateDailyClaimAmount(dailyClaimAmount: number): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to update daily claim amount');
    }
    
    if (dailyClaimAmount < 0) {
      throw new Error('Daily claim amount must be non-negative');
    }
    
    try {
      const tx = await this.contract.updateDailyClaimAmount(dailyClaimAmount);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to update daily claim amount: ${error.message || error}`);
    }
  }

  /**
   * Update claim cooldown period (owner only)
   * @param claimCooldown New claim cooldown period (in seconds)
   * @returns Transaction receipt
   */
  async updateClaimCooldown(claimCooldown: number): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to update claim cooldown');
    }
    
    if (claimCooldown < 0) {
      throw new Error('Claim cooldown must be non-negative');
    }
    
    try {
      const tx = await this.contract.updateClaimCooldown(claimCooldown);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to update claim cooldown: ${error.message || error}`);
    }
  }

  /**
   * Pause token transfers and claims
   * @returns Transaction receipt
   */
  async pause(): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to pause contract');
    }
    
    try {
      const tx = await this.contract.pause();
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to pause contract: ${error.message || error}`);
    }
  }

  /**
   * Unpause token transfers and claims
   * @returns Transaction receipt
   */
  async unpause(): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to unpause contract');
    }
    
    try {
      const tx = await this.contract.unpause();
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to unpause contract: ${error.message || error}`);
    }
  }

  /**
   * Get last claim time for an address
   * @param account Address to check
   * @returns Last claim time (timestamp)
   */
  async getLastClaimTime(account: string): Promise<number> {
    if (!ethers.utils.isAddress(account)) {
      throw new Error('Invalid account address');
    }
    
    try {
      const timestamp = await this.contract.lastClaimTime(account);
      return timestamp.toNumber();
    } catch (error: any) {
      throw new Error(`Failed to get last claim time: ${error.message || error}`);
    }
  }

  /**
   * Get daily claim amount
   * @returns Daily claim amount
   */
  async getDailyClaimAmount(): Promise<number> {
    try {
      const amount = await this.contract.dailyClaimAmount();
      return amount.toNumber();
    } catch (error: any) {
      throw new Error(`Failed to get daily claim amount: ${error.message || error}`);
    }
  }

  /**
   * Get claim cooldown period
   * @returns Claim cooldown period (in seconds)
   */
  async getClaimCooldown(): Promise<number> {
    try {
      const cooldown = await this.contract.claimCooldown();
      return cooldown.toNumber();
    } catch (error: any) {
      throw new Error(`Failed to get claim cooldown: ${error.message || error}`);
    }
  }
}