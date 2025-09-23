// Simple RPG Character Creation Example
// Demonstrates player creation, NFT character minting, and character leveling

// Set environment to test to skip WebSocket initialization
process.env.NODE_ENV = 'test';

const { SomniaGameKit } = require('../dist/index.js');

class SimpleRPG {
  constructor() {
    this.sdk = new SomniaGameKit();
    this.player = null;
    this.character = null;
  }

  async initialize() {
    console.log('🔄 Initializing RPG Game...');
    
    // Initialize SDK with local network for demo
    await this.sdk.initialize({ 
      network: 'local',
      rpcUrl: 'http://localhost:8545'
    });
    
    // Create player (in a real app, this would connect to a wallet)
    this.player = this.sdk.createPlayer({ 
      username: 'Hero', 
      avatar: 'https://example.com/warrior.png' 
    });
    
    console.log(`✅ Player created: ${this.player.username}`);
  }

  async createCharacter(name, characterClass) {
    console.log(`🔄 Creating ${characterClass} character: ${name}...`);
    
    try {
      // Mint NFT character for player
      const nftData = await this.sdk.mintNFT(this.player.id, {
        name: name,
        description: `A brave ${characterClass} character`,
        image: `https://example.com/${characterClass.toLowerCase()}.png`
      });
      
      // Store additional character data locally
      this.character = {
        id: nftData.id,
        tokenId: nftData.tokenId,
        name: name,
        class: characterClass,
        level: 1,
        strength: characterClass === 'Warrior' ? 10 : 5,
        magic: characterClass === 'Mage' ? 10 : 3
      };
      
      console.log(`✅ Character created! Token ID: ${this.character.tokenId}`);
      return this.character;
    } catch (error) {
      console.error('❌ Character creation failed:', error.message);
    }
  }

  async levelUpCharacter() {
    if (!this.character) {
      console.log('❌ No character to level up!');
      return;
    }
    
    console.log('🔄 Leveling up character...');
    
    try {
      // In a real implementation, this would update the NFT metadata on-chain
      // For this demo, we'll just show the concept
      this.character.level++;
      console.log(`✅ Character leveled up! New level: ${this.character.level}`);
      return this.character;
    } catch (error) {
      console.error('❌ Level up failed:', error.message);
    }
  }

  async viewCharacter() {
    if (!this.character) {
      console.log('❌ No character to view!');
      return;
    }
    
    console.log('\n=== Character Details ===');
    console.log(`Name: ${this.character.name}`);
    console.log(`Class: ${this.character.class}`);
    console.log(`Level: ${this.character.level}`);
    console.log(`Strength: ${this.character.strength}`);
    console.log(`Magic: ${this.character.magic}`);
  }

  async cleanup() {
    await this.sdk.cleanup();
  }
}

// Example usage
async function playRPG() {
  const game = new SimpleRPG();
  
  try {
    await game.initialize();
    
    // Create a warrior character
    await game.createCharacter('Brave Knight', 'Warrior');
    
    // View character details
    await game.viewCharacter();
    
    // Level up the character
    await game.levelUpCharacter();
    
    // View updated character
    await game.viewCharacter();
    
    console.log('\n🎮 RPG demo completed!');
    
  } catch (error) {
    console.error('Game error:', error.message);
  } finally {
    await game.cleanup();
  }
}

// Run the game
if (require.main === module) {
  playRPG();
}

module.exports = SimpleRPG;