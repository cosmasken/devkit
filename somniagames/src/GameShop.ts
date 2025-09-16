// src/GameShop.ts
import { ethers } from 'ethers';

export interface ShopItem {
  id: number;
  name: string;
  description: string;
  metadataURI: string;
  price: number;
  tokenAddress: string;
  gameId: number;
  quantity: number;
  maxQuantity: number;
  createdAt: number;
  updatedAt: number;
  active: boolean;
}

export interface PurchaseRecord {
  itemId: number;
  buyer: string;
  quantity: number;
  totalPrice: number;
  timestamp: number;
}

export class GameShop {
  private contract: ethers.Contract;
  private provider: ethers.providers.Provider;
  private signer: ethers.Signer | null = null;

  constructor(
    contractAddress: string, 
    provider: ethers.providers.Provider, 
    signer?: ethers.Signer
  ) {
    // ABI for GameShop contract
    const abi = [
      // Item management
      "function createItem(string name, string description, string metadataURI, uint256 price, address tokenAddress, uint256 gameId, int256 maxQuantity) public",
      "function updateItem(uint256 itemId, string name, string description, uint256 price) public",
      "function restockItem(uint256 itemId, uint256 quantity) public",
      "function activateItem(uint256 itemId) public",
      "function deactivateItem(uint256 itemId) public",
      "function items(uint256 itemId) view returns (uint256 id, string name, string description, string metadataURI, uint256 price, address tokenAddress, uint256 gameId, uint256 quantity, uint256 maxQuantity, uint256 createdAt, uint256 updatedAt, bool active)",
      
      // Purchases
      "function purchaseItem(uint256 itemId, uint256 quantity) public",
      "function purchases(uint256 purchaseId) view returns (uint256 itemId, address buyer, uint256 quantity, uint256 totalPrice, uint256 timestamp)",
      
      // Queries
      "function getItem(uint256 itemId) view returns (uint256 id, string name, string description, string metadataURI, uint256 price, address tokenAddress, uint256 gameId, uint256 quantity, uint256 maxQuantity, uint256 createdAt, uint256 updatedAt, bool active)",
      "function getItemsByGame(uint256 gameId, uint256 limit) view returns (uint256[])",
      "function getPurchaseHistory(address buyer, uint256 limit) view returns (tuple(uint256 itemId, address buyer, uint256 quantity, uint256 totalPrice, uint256 timestamp)[])",
      "function getItemCount() view returns (uint256)",
      "function getPurchaseCount() view returns (uint256)",
      
      // Platform management
      "function updatePlatformFee(uint256 _platformFee) public",
      "function updateFeeRecipient(address _feeRecipient) public",
      "function platformFee() view returns (uint256)",
      "function feeRecipient() view returns (address)",
      
      // Events
      "event ItemCreated(uint256 indexed itemId, string name, uint256 gameId, uint256 price)",
      "event ItemUpdated(uint256 indexed itemId, string name, uint256 price)",
      "event ItemPurchased(uint256 indexed purchaseId, uint256 itemId, address buyer, uint256 quantity, uint256 totalPrice)",
      "event ItemActivated(uint256 indexed itemId)",
      "event ItemDeactivated(uint256 indexed itemId)",
      "event PlatformFeeUpdated(uint256 newFee)",
      "event FeeRecipientUpdated(address newRecipient)"
    ];
    
    this.provider = provider;
    this.contract = new ethers.Contract(contractAddress, abi, provider);
    
    if (signer) {
      this.signer = signer;
      this.contract = this.contract.connect(signer);
    }
  }

  /**
   * Create a new shop item
   * @param name Name of the item
   * @param description Description of the item
   * @param metadataURI URI to item metadata
   * @param price Price of the item
   * @param tokenAddress Address of the token used for purchase
   * @param gameId ID of the game this item belongs to
   * @param maxQuantity Maximum quantity available (-1 for unlimited)
   * @returns Transaction receipt
   */
  async createItem(
    name: string,
    description: string,
    metadataURI: string,
    price: number,
    tokenAddress: string,
    gameId: number,
    maxQuantity: number = -1
  ): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to create item');
    }
    
    if (gameId <= 0) {
      throw new Error('Game ID must be a positive integer');
    }
    
    if (price <= 0) {
      throw new Error('Price must be positive');
    }
    
    if (!ethers.utils.isAddress(tokenAddress)) {
      throw new Error('Invalid token address');
    }
    
    try {
      const tx = await this.contract.createItem(name, description, metadataURI, price, tokenAddress, gameId, maxQuantity);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to create item: ${error.message || error}`);
    }
  }

  /**
   * Update shop item information
   * @param itemId ID of the item to update
   * @param name New name of the item
   * @param description New description of the item
   * @param price New price of the item
   * @returns Transaction receipt
   */
  async updateItem(itemId: number, name: string, description: string, price: number): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to update item');
    }
    
    if (itemId <= 0) {
      throw new Error('Item ID must be a positive integer');
    }
    
    if (price <= 0) {
      throw new Error('Price must be positive');
    }
    
    try {
      const tx = await this.contract.updateItem(itemId, name, description, price);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to update item: ${error.message || error}`);
    }
  }

  /**
   * Restock an item
   * @param itemId ID of the item to restock
   * @param quantity Quantity to add
   * @returns Transaction receipt
   */
  async restockItem(itemId: number, quantity: number): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to restock item');
    }
    
    if (itemId <= 0) {
      throw new Error('Item ID must be a positive integer');
    }
    
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    
    try {
      const tx = await this.contract.restockItem(itemId, quantity);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to restock item: ${error.message || error}`);
    }
  }

  /**
   * Activate an item
   * @param itemId ID of the item to activate
   * @returns Transaction receipt
   */
  async activateItem(itemId: number): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to activate item');
    }
    
    if (itemId <= 0) {
      throw new Error('Item ID must be a positive integer');
    }
    
    try {
      const tx = await this.contract.activateItem(itemId);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to activate item: ${error.message || error}`);
    }
  }

  /**
   * Deactivate an item
   * @param itemId ID of the item to deactivate
   * @returns Transaction receipt
   */
  async deactivateItem(itemId: number): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to deactivate item');
    }
    
    if (itemId <= 0) {
      throw new Error('Item ID must be a positive integer');
    }
    
    try {
      const tx = await this.contract.deactivateItem(itemId);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to deactivate item: ${error.message || error}`);
    }
  }

  /**
   * Purchase an item
   * @param itemId ID of the item to purchase
   * @param quantity Quantity to purchase
   * @returns Transaction receipt
   */
  async purchaseItem(itemId: number, quantity: number): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to purchase item');
    }
    
    if (itemId <= 0) {
      throw new Error('Item ID must be a positive integer');
    }
    
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    
    try {
      const tx = await this.contract.purchaseItem(itemId, quantity);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to purchase item: ${error.message || error}`);
    }
  }

  /**
   * Get item information
   * @param itemId ID of the item
   * @returns Item information
   */
  async getItem(itemId: number): Promise<ShopItem> {
    if (itemId <= 0) {
      throw new Error('Item ID must be a positive integer');
    }
    
    try {
      const item = await this.contract.getItem(itemId);
      
      return {
        id: item.id.toNumber(),
        name: item.name,
        description: item.description,
        metadataURI: item.metadataURI,
        price: item.price.toNumber(),
        tokenAddress: item.tokenAddress,
        gameId: item.gameId.toNumber(),
        quantity: item.quantity.toNumber(),
        maxQuantity: item.maxQuantity.toNumber(),
        createdAt: item.createdAt.toNumber(),
        updatedAt: item.updatedAt.toNumber(),
        active: item.active
      };
    } catch (error: any) {
      throw new Error(`Failed to get item: ${error.message || error}`);
    }
  }

  /**
   * Get items for a specific game
   * @param gameId ID of the game
   * @param limit Maximum number of items to return
   * @returns Array of item IDs
   */
  async getItemsByGame(gameId: number, limit: number = 30): Promise<number[]> {
    if (gameId <= 0) {
      throw new Error('Game ID must be a positive integer');
    }
    
    if (limit <= 0 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
    
    try {
      const itemIds = await this.contract.getItemsByGame(gameId, limit);
      return itemIds.map((id: ethers.BigNumber) => id.toNumber());
    } catch (error: any) {
      throw new Error(`Failed to get items by game: ${error.message || error}`);
    }
  }

  /**
   * Get purchase history for a buyer
   * @param buyer Address of the buyer
   * @param limit Maximum number of purchases to return
   * @returns Array of purchase records
   */
  async getPurchaseHistory(buyer: string, limit: number = 30): Promise<PurchaseRecord[]> {
    if (!ethers.utils.isAddress(buyer)) {
      throw new Error('Invalid buyer address');
    }
    
    if (limit <= 0 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
    
    try {
      const purchases = await this.contract.getPurchaseHistory(buyer, limit);
      
      return purchases.map((purchase: any) => ({
        itemId: purchase.itemId.toNumber(),
        buyer: purchase.buyer,
        quantity: purchase.quantity.toNumber(),
        totalPrice: purchase.totalPrice.toNumber(),
        timestamp: purchase.timestamp.toNumber()
      }));
    } catch (error: any) {
      throw new Error(`Failed to get purchase history: ${error.message || error}`);
    }
  }

  /**
   * Get total number of items
   * @returns Total item count
   */
  async getItemCount(): Promise<number> {
    try {
      const count = await this.contract.getItemCount();
      return count.toNumber();
    } catch (error: any) {
      throw new Error(`Failed to get item count: ${error.message || error}`);
    }
  }

  /**
   * Get total number of purchases
   * @returns Total purchase count
   */
  async getPurchaseCount(): Promise<number> {
    try {
      const count = await this.contract.getPurchaseCount();
      return count.toNumber();
    } catch (error: any) {
      throw new Error(`Failed to get purchase count: ${error.message || error}`);
    }
  }

  /**
   * Update platform fee
   * @param platformFee New platform fee (in basis points)
   * @returns Transaction receipt
   */
  async updatePlatformFee(platformFee: number): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to update platform fee');
    }
    
    if (platformFee < 0 || platformFee > 1000) {
      throw new Error('Platform fee must be between 0 and 1000 basis points (0-10%)');
    }
    
    try {
      const tx = await this.contract.updatePlatformFee(platformFee);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to update platform fee: ${error.message || error}`);
    }
  }

  /**
   * Update fee recipient
   * @param feeRecipient New fee recipient address
   * @returns Transaction receipt
   */
  async updateFeeRecipient(feeRecipient: string): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to update fee recipient');
    }
    
    if (!ethers.utils.isAddress(feeRecipient)) {
      throw new Error('Invalid fee recipient address');
    }
    
    try {
      const tx = await this.contract.updateFeeRecipient(feeRecipient);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to update fee recipient: ${error.message || error}`);
    }
  }

  /**
   * Get platform fee
   * @returns Platform fee (in basis points)
   */
  async getPlatformFee(): Promise<number> {
    try {
      const fee = await this.contract.platformFee();
      return fee.toNumber();
    } catch (error: any) {
      throw new Error(`Failed to get platform fee: ${error.message || error}`);
    }
  }

  /**
   * Get fee recipient
   * @returns Fee recipient address
   */
  async getFeeRecipient(): Promise<string> {
    try {
      return await this.contract.feeRecipient();
    } catch (error: any) {
      throw new Error(`Failed to get fee recipient: ${error.message || error}`);
    }
  }
}