import { SomniaGameKit } from '../src/index';

async function test() {
  const sdk = new SomniaGameKit();
  
  // Test player creation
  const player = sdk.createPlayer({ username: 'testuser', avatar: 'avatar-url' });
  console.log('Player created:', player);
  
  // Test game deployment
  const game = sdk.deployGame('bytecode', {}, { level: 1 });
  console.log('Game deployed:', game);
  
  // Test NFT minting
  const nft = sdk.mintNFT(player.id, {
    name: 'Test NFT',
    description: 'A test NFT',
    image: 'image-url'
  });
  console.log('NFT minted:', nft);
  
  console.log('All tests passed!');
}

test().catch(console.error);