// Simple NFT Marketplace Example
// Demonstrates listing NFTs for sale, buying NFTs, and managing a collection

// Set environment to test to skip WebSocket initialization
process.env.NODE_ENV = 'test';

const { SomniaGameKit } = require('../dist/index.js');

class SimpleMarketplace {
  constructor() {
    this.sdk = new SomniaGameKit();
    this.seller = null;
    this.buyer = null;
    this.listings = new Map();
  }

  async initialize() {
    console.log('🔄 Initializing Marketplace...');
    
    // Initialize SDK with local network for demo
    await this.sdk.initialize({ 
      network: 'local',
      rpcUrl: 'http://localhost:8545'
    });
    
    // Connect a mock wallet
    await this.sdk.connectWallet('0x1234567890123456789012345678901234567890');
    
    // Create seller and buyer players
    this.seller = this.sdk.createPlayer({ 
      username: 'Seller', 
      avatar: 'https://example.com/seller.png' 
    });
    
    this.buyer = this.sdk.createPlayer({ 
      username: 'Buyer', 
      avatar: 'https://example.com/buyer.png' 
    });
    
    console.log(`✅ Seller created: ${this.seller.username}`);
    console.log(`✅ Buyer created: ${this.buyer.username}`);
  }

  async createNFT(ownerId, name, price) {
    console.log(`🔄 Creating NFT: ${name}...`);
    
    try {
      // Mint an NFT
      const nft = await this.sdk.mintNFT(ownerId, {
        name: name,
        description: `Digital asset: ${name}`,
        image: `https://example.com/${name.toLowerCase().replace(' ', '-')}.png`,
        attributes: {
          price: price,
          forSale: false
        }
      });
      
      console.log(`✅ NFT created! Token ID: ${nft.tokenId}`);
      return nft;
    } catch (error) {
      console.error('❌ NFT creation failed:', error.message);
    }
  }

  async listNFT(nftId, price) {
    console.log(`🔄 Listing NFT ${nftId} for sale...`);
    
    try {
      // In a real implementation, this would update the NFT metadata on-chain
      // For this demo, we'll just track it in our marketplace
      const listingId = `listing_${Date.now()}`;
      this.listings.set(listingId, {
        id: listingId,
        nftId: nftId,
        price: price,
        seller: this.seller.id
      });
      
      console.log(`✅ NFT listed for sale! Listing ID: ${listingId}, Price: ${price} tokens`);
      return listingId;
    } catch (error) {
      console.error('❌ Listing failed:', error.message);
    }
  }

  async buyNFT(listingId, buyerId) {
    const listing = this.listings.get(listingId);
    if (!listing) {
      console.log('❌ Listing not found!');
      return;
    }
    
    console.log(`🔄 Buying NFT ${listing.nftId} for ${listing.price} tokens...`);
    
    try {
      // In a real implementation, this would transfer the NFT from seller to buyer
      // For this demo, we'll just simulate the purchase
      console.log(`✅ NFT purchased! (Simulated transaction)`);
      
      // Remove the listing
      this.listings.delete(listingId);
      
      return true;
    } catch (error) {
      console.error('❌ Purchase failed:', error.message);
    }
  }

  async viewCollection(playerId) {
    console.log(`\n=== Collection for ${playerId} ===`);
    const nfts = this.sdk.getPlayerNFTs(playerId);
    
    if (nfts.length === 0) {
      console.log('No NFTs owned');
      return;
    }
    
    nfts.forEach(nft => {
      console.log(`- ${nft.name} (ID: ${nft.id})`);
    });
  }

  async viewListings() {
    console.log('\n=== Active Listings ===');
    
    if (this.listings.size === 0) {
      console.log('No active listings');
      return;
    }
    
    for (const [listingId, listing] of this.listings) {
      console.log(`- Listing ${listingId}: ${listing.nftId} for ${listing.price} tokens`);
    }
  }

  async cleanup() {
    await this.sdk.cleanup();
  }
}

// Example usage
async function runMarketplace() {
  const marketplace = new SimpleMarketplace();
  
  try {
    await marketplace.initialize();
    
    // Create some NFTs
    const nft1 = await marketplace.createNFT(marketplace.seller.id, 'Digital Art #1', 100);
    const nft2 = await marketplace.createNFT(marketplace.seller.id, 'Digital Art #2', 150);
    
    // List NFTs for sale
    const listing1 = await marketplace.listNFT(nft1.id, 100);
    const listing2 = await marketplace.listNFT(nft2.id, 150);
    
    // View listings
    await marketplace.viewListings();
    
    // Buyer purchases an NFT
    await marketplace.buyNFT(listing1, marketplace.buyer.id);
    
    // View updated listings
    await marketplace.viewListings();
    
    // View collections
    await marketplace.viewCollection(marketplace.seller.id);
    await marketplace.viewCollection(marketplace.buyer.id);
    
    console.log('\n🛒 Marketplace demo completed!');
    
  } catch (error) {
    console.error('Marketplace error:', error.message);
  } finally {
    await marketplace.cleanup();
  }
}

// Run the marketplace
if (require.main === module) {
  runMarketplace();
}

module.exports = SimpleMarketplace;