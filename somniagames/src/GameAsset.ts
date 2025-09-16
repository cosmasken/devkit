// src/GameAsset.ts
import { ethers } from 'ethers';

export interface GameAssetMetadata {
  id: number;
  name: string;
  description: string;
  metadataURI: string;
  createdAt: number;
  updatedAt: number;
  gameId: number;
  rarity: number;
  level: number;
}

export class GameAsset {
  private contract: ethers.Contract;
  private provider: ethers.providers.Provider;
  private signer: ethers.Signer | null = null;

  constructor(
    contractAddress: string, 
    provider: ethers.providers.Provider, 
    signer?: ethers.Signer
  ) {
    // ABI for GameAsset contract
    const abi = [
      // ERC721 functions
      "function ownerOf(uint256 tokenId) view returns (address)",
      "function balanceOf(address owner) view returns (uint256)",
      "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
      "function tokenByIndex(uint256 index) view returns (uint256)",
      "function totalSupply() view returns (uint256)",
      "function tokenURI(uint256 tokenId) view returns (string)",
      "function transferFrom(address from, address to, uint256 tokenId)",
      "function approve(address to, uint256 tokenId)",
      "function getApproved(uint256 tokenId) view returns (address)",
      "function setApprovalForAll(address operator, bool approved)",
      "function isApprovedForAll(address owner, address operator) view returns (bool)",
      
      // GameAsset specific functions
      "function createAsset(address owner, string name, string description, string metadataURI, uint256 gameId, uint256 rarity) public",
      "function updateAsset(uint256 assetId, string name, string description) public",
      "function updateAssetMetadata(uint256 assetId, string metadataURI) public",
      "function levelUpAsset(uint256 assetId) public",
      "function assets(uint256 assetId) view returns (string name, string description, string metadataURI, uint256 createdAt, uint256 updatedAt, uint256 gameId, uint256 rarity, uint256 level)",
      "function getAssetsByGame(uint256 gameId) view returns (uint256[])",
      "function getAssetsByOwner(address owner) view returns (uint256[])",
      "function getTotalSupply() view returns (uint256)",
      
      // Events
      "event AssetCreated(uint256 indexed assetId, string name, address owner, uint256 gameId)",
      "event AssetUpdated(uint256 indexed assetId, string name, string description)",
      "event AssetLevelUp(uint256 indexed assetId, uint256 newLevel)",
      "event AssetTransferred(uint256 indexed assetId, address from, address to)",
      "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
      "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
      "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)"
    ];
    
    this.provider = provider;
    this.contract = new ethers.Contract(contractAddress, abi, provider);
    
    if (signer) {
      this.signer = signer;
      this.contract = this.contract.connect(signer);
    }
  }

  /**
   * Create a new game asset
   * @param owner Address that will own the asset
   * @param name Name of the asset
   * @param description Description of the asset
   * @param metadataURI URI to asset metadata
   * @param gameId ID of the game this asset belongs to
   * @param rarity Rarity level of the asset (1-5)
   * @returns Transaction receipt and asset ID
   */
  async createAsset(
    owner: string,
    name: string,
    description: string,
    metadataURI: string,
    gameId: number,
    rarity: number
  ): Promise<{ receipt: ethers.ContractReceipt; assetId: number }> {
    if (!this.signer) {
      throw new Error('Signer required to create asset');
    }
    
    if (!ethers.utils.isAddress(owner)) {
      throw new Error('Invalid owner address');
    }
    
    if (rarity < 1 || rarity > 5) {
      throw new Error('Rarity must be between 1 and 5');
    }
    
    if (gameId <= 0) {
      throw new Error('Game ID must be a positive integer');
    }
    
    try {
      const tx = await this.contract.createAsset(owner, name, description, metadataURI, gameId, rarity);
      const receipt = await tx.wait();
      
      // Extract asset ID from events
      let assetId = 0;
      for (const log of receipt.logs) {
        try {
          const parsedLog = this.contract.interface.parseLog(log);
          if (parsedLog.name === 'AssetCreated') {
            assetId = parsedLog.args.assetId.toNumber();
            break;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      return { receipt, assetId };
    } catch (error: any) {
      throw new Error(`Failed to create asset: ${error.message || error}`);
    }
  }

  /**
   * Get asset metadata by ID
   * @param assetId ID of the asset
   * @returns Asset metadata
   */
  async getAsset(assetId: number): Promise<GameAssetMetadata> {
    if (assetId <= 0) {
      throw new Error('Asset ID must be a positive integer');
    }
    
    try {
      const asset = await this.contract.assets(assetId);
      
      return {
        id: assetId,
        name: asset.name,
        description: asset.description,
        metadataURI: asset.metadataURI,
        createdAt: asset.createdAt.toNumber(),
        updatedAt: asset.updatedAt.toNumber(),
        gameId: asset.gameId.toNumber(),
        rarity: asset.rarity.toNumber(),
        level: asset.level.toNumber()
      };
    } catch (error: any) {
      throw new Error(`Failed to get asset with ID ${assetId}: ${error.message || error}`);
    }
  }

  /**
   * Update asset information
   * @param assetId ID of the asset to update
   * @param name New name of the asset
   * @param description New description of the asset
   * @returns Transaction receipt
   */
  async updateAsset(assetId: number, name: string, description: string): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to update asset');
    }
    
    if (assetId <= 0) {
      throw new Error('Asset ID must be a positive integer');
    }
    
    try {
      const tx = await this.contract.updateAsset(assetId, name, description);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to update asset with ID ${assetId}: ${error.message || error}`);
    }
  }

  /**
   * Update asset metadata URI
   * @param assetId ID of the asset to update
   * @param metadataURI New URI to asset metadata
   * @returns Transaction receipt
   */
  async updateAssetMetadata(assetId: number, metadataURI: string): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to update asset metadata');
    }
    
    if (assetId <= 0) {
      throw new Error('Asset ID must be a positive integer');
    }
    
    try {
      const tx = await this.contract.updateAssetMetadata(assetId, metadataURI);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to update asset metadata with ID ${assetId}: ${error.message || error}`);
    }
  }

  /**
   * Level up an asset
   * @param assetId ID of the asset to level up
   * @returns Transaction receipt
   */
  async levelUpAsset(assetId: number): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to level up asset');
    }
    
    if (assetId <= 0) {
      throw new Error('Asset ID must be a positive integer');
    }
    
    try {
      const tx = await this.contract.levelUpAsset(assetId);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to level up asset with ID ${assetId}: ${error.message || error}`);
    }
  }

  /**
   * Get all assets for a specific game
   * @param gameId ID of the game
   * @returns Array of asset IDs
   */
  async getAssetsByGame(gameId: number): Promise<number[]> {
    if (gameId <= 0) {
      throw new Error('Game ID must be a positive integer');
    }
    
    try {
      const assetIds = await this.contract.getAssetsByGame(gameId);
      return assetIds.map((id: ethers.BigNumber) => id.toNumber());
    } catch (error: any) {
      throw new Error(`Failed to get assets for game with ID ${gameId}: ${error.message || error}`);
    }
  }

  /**
   * Get all assets owned by a specific address
   * @param owner Address of the owner
   * @returns Array of asset IDs
   */
  async getAssetsByOwner(owner: string): Promise<number[]> {
    if (!ethers.utils.isAddress(owner)) {
      throw new Error('Invalid owner address');
    }
    
    try {
      const assetIds = await this.contract.getAssetsByOwner(owner);
      return assetIds.map((id: ethers.BigNumber) => id.toNumber());
    } catch (error: any) {
      throw new Error(`Failed to get assets for owner ${owner}: ${error.message || error}`);
    }
  }

  /**
   * Get total supply of assets
   * @returns Total number of assets
   */
  async getTotalSupply(): Promise<number> {
    try {
      const supply = await this.contract.getTotalSupply();
      return supply.toNumber();
    } catch (error: any) {
      throw new Error(`Failed to get total supply: ${error.message || error}`);
    }
  }

  /**
   * Get owner of an asset
   * @param assetId ID of the asset
   * @returns Address of the owner
   */
  async getOwnerOf(assetId: number): Promise<string> {
    if (assetId <= 0) {
      throw new Error('Asset ID must be a positive integer');
    }
    
    try {
      return await this.contract.ownerOf(assetId);
    } catch (error: any) {
      throw new Error(`Failed to get owner of asset with ID ${assetId}: ${error.message || error}`);
    }
  }

  /**
   * Get balance of assets for an owner
   * @param owner Address of the owner
   * @returns Number of assets owned
   */
  async getBalanceOf(owner: string): Promise<number> {
    if (!ethers.utils.isAddress(owner)) {
      throw new Error('Invalid owner address');
    }
    
    try {
      const balance = await this.contract.balanceOf(owner);
      return balance.toNumber();
    } catch (error: any) {
      throw new Error(`Failed to get balance for owner ${owner}: ${error.message || error}`);
    }
  }

  /**
   * Transfer an asset to another address
   * @param to Address to transfer to
   * @param assetId ID of the asset to transfer
   * @returns Transaction receipt
   */
  async transferAsset(to: string, assetId: number): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to transfer asset');
    }
    
    if (!ethers.utils.isAddress(to)) {
      throw new Error('Invalid recipient address');
    }
    
    if (assetId <= 0) {
      throw new Error('Asset ID must be a positive integer');
    }
    
    try {
      const from = await this.signer.getAddress();
      const tx = await this.contract.transferFrom(from, to, assetId);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to transfer asset with ID ${assetId}: ${error.message || error}`);
    }
  }

  /**
   * Approve an address to transfer an asset
   * @param to Address to approve
   * @param assetId ID of the asset to approve
   * @returns Transaction receipt
   */
  async approve(to: string, assetId: number): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to approve asset transfer');
    }
    
    if (!ethers.utils.isAddress(to)) {
      throw new Error('Invalid address to approve');
    }
    
    if (assetId <= 0) {
      throw new Error('Asset ID must be a positive integer');
    }
    
    try {
      const tx = await this.contract.approve(to, assetId);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to approve asset with ID ${assetId}: ${error.message || error}`);
    }
  }

  /**
   * Get approved address for an asset
   * @param assetId ID of the asset
   * @returns Address that is approved to transfer the asset
   */
  async getApproved(assetId: number): Promise<string> {
    if (assetId <= 0) {
      throw new Error('Asset ID must be a positive integer');
    }
    
    try {
      return await this.contract.getApproved(assetId);
    } catch (error: any) {
      throw new Error(`Failed to get approved address for asset with ID ${assetId}: ${error.message || error}`);
    }
  }

  /**
   * Set approval for all assets
   * @param operator Address to approve
   * @param approved Whether to approve or revoke approval
   * @returns Transaction receipt
   */
  async setApprovalForAll(operator: string, approved: boolean): Promise<ethers.ContractReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to set approval for all');
    }
    
    if (!ethers.utils.isAddress(operator)) {
      throw new Error('Invalid operator address');
    }
    
    try {
      const tx = await this.contract.setApprovalForAll(operator, approved);
      return await tx.wait();
    } catch (error: any) {
      throw new Error(`Failed to set approval for all: ${error.message || error}`);
    }
  }

  /**
   * Check if an operator is approved for all assets of an owner
   * @param owner Address of the owner
   * @param operator Address of the operator
   * @returns True if approved, false otherwise
   */
  async isApprovedForAll(owner: string, operator: string): Promise<boolean> {
    if (!ethers.utils.isAddress(owner) || !ethers.utils.isAddress(operator)) {
      throw new Error('Invalid address');
    }
    
    try {
      return await this.contract.isApprovedForAll(owner, operator);
    } catch (error: any) {
      throw new Error(`Failed to check approval for all: ${error.message || error}`);
    }
  }
}