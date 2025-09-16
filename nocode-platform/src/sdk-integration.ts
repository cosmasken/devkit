// src/sdk-integration.ts
import { 
  GameRegistry, 
  GameAsset, 
  GameToken, 
  GameLeaderboard, 
  GameShop,
  // New modular system imports
  createSimpleGame,
  createTetrisGame,
  createChessGame,
  NFTModule,
  PaymentModule
} from '@somniagames/sdk';
import { ethers } from 'ethers';

// This is a simplified example of how the no-code platform would use the SDK
// In a real implementation, this would be much more complex with proper error handling,
// state management, and UI integration

export class NoCodePlatform {
  private provider: ethers.providers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  private gameRegistry: GameRegistry | null = null;
  private gameAsset: GameAsset | null = null;
  private gameToken: GameToken | null = null;
  private gameLeaderboard: GameLeaderboard | null = null;
  private gameShop: GameShop | null = null;
  
  // New modular system support
  private simpleGame: any = null;
  private nftModule: NFTModule | null = null;
  private paymentModule: PaymentModule | null = null;

  constructor() {
    // Initialize with default values
    this.provider = null;
    this.signer = null;
  }

  /**
   * Connect to wallet and initialize contracts
   * @param rpcUrl RPC URL for the blockchain
   * @param contractAddresses Addresses of deployed contracts
   */
  async connectWallet(
    rpcUrl: string, 
    contractAddresses: {
      gameRegistry: string;
      gameAsset: string;
      gameToken: string;
      gameLeaderboard: string;
      gameShop: string;
    }
  ) {
    try {
      // In a real implementation, this would connect to the user's wallet
      // For this example, we'll simulate a connection
      this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      this.signer = ethers.Wallet.createRandom().connect(this.provider);
      
      // Initialize contracts
      this.gameRegistry = new GameRegistry(
        contractAddresses.gameRegistry,
        this.provider,
        this.signer
      );
      
      this.gameAsset = new GameAsset(
        contractAddresses.gameAsset,
        this.provider,
        this.signer
      );
      
      this.gameToken = new GameToken(
        contractAddresses.gameToken,
        this.provider,
        this.signer
      );
      
      this.gameLeaderboard = new GameLeaderboard(
        contractAddresses.gameLeaderboard,
        this.provider,
        this.signer
      );
      
      this.gameShop = new GameShop(
        contractAddresses.gameShop,
        this.provider,
        this.signer
      );
      
      console.log('Wallet connected and contracts initialized');
      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  }

  /**
   * Create a new game using the modular system (new way)
   * @param gameData Game configuration
   */
  async createGameModular(gameData: {
    name: string;
    description: string;
    template?: 'tetris' | 'chess' | 'simple';
    genre: string;
    maxPlayers: number;
  }) {
    if (!this.provider || !this.signer) {
      throw new Error('Not connected to wallet');
    }
    
    try {
      // Use the new modular system for easier game creation
      if (gameData.template === 'tetris') {
        this.simpleGame = createTetrisGame(gameData.name, this.provider, this.signer);
      } else if (gameData.template === 'chess') {
        this.simpleGame = createChessGame(gameData.name, this.provider, this.signer);
      } else {
        this.simpleGame = createSimpleGame({
          name: gameData.name,
          description: gameData.description,
          type: gameData.genre,
          maxPlayers: gameData.maxPlayers
        }, this.provider, this.signer);
      }
      
      // Get the modules
      this.nftModule = this.simpleGame.getNFTModule();
      this.paymentModule = this.simpleGame.getPaymentModule();
      
      // Deploy the game
      const deployment = await this.simpleGame.deploy();
      
      console.log('Game created with modular system:', deployment);
      return deployment;
    } catch (error) {
      console.error('Failed to create game with modular system:', error);
      throw error;
    }
  }

  /**
   * Create a new game using the SDK (legacy way)
   * @param gameData Game configuration
   */
  async createGame(gameData: {
    name: string;
    description: string;
    metadataURI: string;
    genre: string;
    maxPlayers: number;
  }) {
    if (!this.gameRegistry) {
      throw new Error('Not connected to wallet');
    }
    
    try {
      // Create the game using the SDK
      const tx = await this.gameRegistry.createGame(
        gameData.name,
        gameData.description,
        gameData.metadataURI
      );
      
      console.log('Game created:', tx);
      return tx;
    } catch (error) {
      console.error('Failed to create game:', error);
      throw error;
    }
  }

  /**
   * Create game assets using the SDK
   * @param assetData Asset configuration
   */
  async createAsset(assetData: {
    name: string;
    description: string;
    metadataURI: string;
    gameId: number;
    rarity: number;
  }) {
    if (!this.gameAsset || !this.signer) {
      throw new Error('Not connected to wallet');
    }
    
    try {
      // Get the signer's address
      const owner = await this.signer.getAddress();
      
      // Create the asset using the SDK
      const result = await this.gameAsset.createAsset(
        owner,
        assetData.name,
        assetData.description,
        assetData.metadataURI,
        assetData.gameId,
        assetData.rarity
      );
      
      console.log('Asset created:', result);
      return result;
    } catch (error) {
      console.error('Failed to create asset:', error);
      throw error;
    }
  }

  /**
   * Create game assets using the modular system
   * @param assetData Asset configuration
   */
  async createAssetModular(assetData: {
    name: string;
    symbol: string;
    uri: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    gameId?: number;
  }) {
    if (!this.nftModule) {
      throw new Error('Modular system not initialized');
    }
    
    try {
      // Define the asset using the modular system
      this.nftModule.defineAssets({
        [assetData.name.toLowerCase().replace(/\s+/g, '-')]: {
          name: assetData.name,
          symbol: assetData.symbol,
          uri: assetData.uri,
          rarity: assetData.rarity
        }
      });
      
      // Mint the asset
      const result = await this.nftModule.mintAsset(
        await this.signer!.getAddress(),
        assetData.name.toLowerCase().replace(/\s+/g, '-'),
        assetData.gameId || 1
      );
      
      console.log('Asset created with modular system:', result);
      return result;
    } catch (error) {
      console.error('Failed to create asset with modular system:', error);
      throw error;
    }
  }

  /**
   * Configure game economy using the SDK
   * @param economyData Economy configuration
   */
  async configureEconomy(economyData: {
    tokenName: string;
    tokenSymbol: string;
    initialSupply: number;
    dailyClaimAmount: number;
  }) {
    if (!this.gameToken) {
      throw new Error('Not connected to wallet');
    }
    
    try {
      // In a real implementation, this would deploy a new token contract
      // For this example, we'll just log the configuration
      console.log('Economy configured:', economyData);
      return true;
    } catch (error) {
      console.error('Failed to configure economy:', error);
      throw error;
    }
  }

  /**
   * Configure payments using the modular system
   * @param paymentData Payment configuration
   */
  async configurePayments(paymentData: {
    entryFee?: string;
    winReward?: string;
    participationReward?: string;
  }) {
    if (!this.paymentModule) {
      throw new Error('Modular system not initialized');
    }
    
    try {
      // Configure payments using the modular system
      this.paymentModule.configure(paymentData);
      
      console.log('Payments configured with modular system:', paymentData);
      return true;
    } catch (error) {
      console.error('Failed to configure payments with modular system:', error);
      throw error;
    }
  }

  /**
   * Create leaderboard using the SDK
   * @param leaderboardData Leaderboard configuration
   */
  async createLeaderboard(leaderboardData: {
    name: string;
    description: string;
    gameId: number;
  }) {
    if (!this.gameLeaderboard) {
      throw new Error('Not connected to wallet');
    }
    
    try {
      // Create the leaderboard using the SDK
      const tx = await this.gameLeaderboard.createLeaderboard(
        leaderboardData.name,
        leaderboardData.description,
        leaderboardData.gameId
      );
      
      console.log('Leaderboard created:', tx);
      return tx;
    } catch (error) {
      console.error('Failed to create leaderboard:', error);
      throw error;
    }
  }

  /**
   * Create shop items using the SDK
   * @param itemData Item configuration
   */
  async createShopItem(itemData: {
    name: string;
    description: string;
    metadataURI: string;
    price: number;
    gameId: number;
    maxQuantity: number;
  }) {
    if (!this.gameShop || !this.gameToken) {
      throw new Error('Not connected to wallet');
    }
    
    try {
      // Get the token address (in a real implementation, this would be configurable)
      // @ts-ignore - accessing private contract property
      const tokenAddress = this.gameToken.contract.address;
      
      // Create the shop item using the SDK
      const tx = await this.gameShop.createItem(
        itemData.name,
        itemData.description,
        itemData.metadataURI,
        itemData.price,
        tokenAddress,
        itemData.gameId,
        itemData.maxQuantity
      );
      
      console.log('Shop item created:', tx);
      return tx;
    } catch (error) {
      console.error('Failed to create shop item:', error);
      throw error;
    }
  }

  /**
   * Publish game to blockchain
   * @param gameId ID of the game to publish
   */
  async publishGame(gameId: number) {
    if (!this.gameRegistry) {
      throw new Error('Not connected to wallet');
    }
    
    try {
      // Activate the game using the SDK
      const tx = await this.gameRegistry.activateGame(gameId);
      
      console.log('Game published:', tx);
      return tx;
    } catch (error) {
      console.error('Failed to publish game:', error);
      throw error;
    }
  }

  /**
   * Publish game using modular system
   */
  async publishGameModular() {
    if (!this.simpleGame) {
      throw new Error('Modular system not initialized');
    }
    
    try {
      // In a real implementation, this would involve activating the game
      // For now, we'll just log that it's published
      console.log('Game published with modular system');
      return true;
    } catch (error) {
      console.error('Failed to publish game with modular system:', error);
      throw error;
    }
  }
}

// Export a singleton instance for use in the platform
export const noCodePlatform = new NoCodePlatform();