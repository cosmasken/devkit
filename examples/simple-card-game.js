const { SomniaGameKit } = require('../dist/index.js');

// Set environment to test to skip WebSocket initialization
process.env.NODE_ENV = 'test';

class SimpleCardGame {
  constructor() {
    this.sdk = new SomniaGameKit();
    this.player = null;
    this.gameId = null;
  }

  async initialize() {
    // Initialize SDK with Somnia testnet
    await this.sdk.initialize({ network: 'somnia-testnet' });
    
    // Connect wallet
    const walletAddress = await this.sdk.connectWallet();
    console.log(`Connected wallet: ${walletAddress}`);
    
    // Create player
    this.player = this.sdk.createPlayer({ 
      username: 'CardPlayer', 
      avatar: 'https://example.com/avatar.png' 
    });
    console.log(`Player created: ${this.player.username}`);
  }

  async startGame() {
    // Deploy game contract
    const game = await this.sdk.deployGame(1);
    this.gameId = game.id;
    console.log(`Game deployed: ${this.gameId}`);
    
    // Start game session
    const session = await this.sdk.startGame(this.gameId, [this.player.id]);
    console.log(`Game session started: ${session.id}`);
    
    return session;
  }

  async collectCard(cardName) {
    // Mint NFT card for player
    const card = await this.sdk.mintNFT(this.player.id, {
      name: cardName,
      description: `A rare ${cardName} card`,
      image: `https://example.com/cards/${cardName.toLowerCase()}.png`
    });
    
    console.log(`Card collected: ${cardName} (Token ID: ${card.tokenId})`);
    return card;
  }

  async viewCollection() {
    // Get all player's NFTs
    const cards = await this.sdk.getPlayerNFTs(this.player.id);
    console.log(`\n=== Card Collection ===`);
    cards.forEach(card => {
      console.log(`- ${card.name}: ${card.description}`);
    });
    return cards;
  }

  async tradeCard(recipientPlayerId, cardTokenId) {
    // Transfer NFT to another player
    await this.sdk.transferNFT(this.player.id, recipientPlayerId, cardTokenId);
    console.log(`Card traded successfully!`);
  }

  async cleanup() {
    await this.sdk.cleanup();
  }
}

// Example usage
async function playGame() {
  const game = new SimpleCardGame();
  
  try {
    // Initialize game
    await game.initialize();
    
    // Start playing
    await game.startGame();
    
    // Collect some cards
    await game.collectCard('Fire Dragon');
    await game.collectCard('Ice Wizard');
    await game.collectCard('Lightning Bolt');
    
    // View collection
    await game.viewCollection();
    
    console.log('\n🎮 Simple card game completed!');
    
  } catch (error) {
    console.error('Game error:', error.message);
  } finally {
    await game.cleanup();
  }
}

// Run the game
if (require.main === module) {
  playGame();
}

module.exports = SimpleCardGame;
