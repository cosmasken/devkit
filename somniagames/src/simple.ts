// src/simple.ts
import { SimpleGame, SimpleGameConfig } from './SimpleGame';
import { NFTModule } from './modules/NFTModule';
import { PaymentModule } from './modules/PaymentModule';
import { ethers } from 'ethers';

/**
 * Create a simple game with plug-and-play modules
 * 
 * This function provides a simplified API for developers who want to create
 * blockchain games without dealing with low-level blockchain details.
 * 
 * @param config - Game configuration
 * @param provider - Ethereum provider
 * @param signer - Optional signer for transactions
 * @param contractAddress - Optional existing contract address
 * @returns SimpleGame instance with auto-configured modules
 */
export function createSimpleGame(
  config: string | SimpleGameConfig,
  provider?: ethers.providers.Provider,
  signer?: ethers.Signer,
  contractAddress?: string
): SimpleGame {
  // Handle string name parameter
  const gameConfig: SimpleGameConfig = typeof config === 'string' 
    ? { name: config } 
    : config;
  
  // Validate required parameters
  if (!provider) {
    throw new Error('Provider is required to create a game');
  }
  
  // Create the base game
  const game = new SimpleGame(
    gameConfig.name,
    provider,
    signer,
    contractAddress
  );
  
  // Auto-add essential modules based on game type
  if (!game.hasModule('NFTModule')) {
    const nftModule = new NFTModule(
      contractAddress || '0x0000000000000000000000000000000000000000',
      provider,
      signer
    );
    game.addModule(nftModule);
  }
  
  if (!game.hasModule('PaymentModule')) {
    const paymentModule = new PaymentModule(
      contractAddress || '0x0000000000000000000000000000000000000000',
      provider,
      signer
    );
    game.addModule(paymentModule);
  }
  
  return game;
}

/**
 * Create a Tetris-style puzzle game
 * 
 * This template provides a complete implementation for a Tetris-like game
 * with all necessary modules pre-configured.
 * 
 * @param name - Name of the game
 * @param provider - Ethereum provider
 * @param signer - Optional signer for transactions
 * @returns SimpleGame instance configured for Tetris
 */
export function createTetrisGame(
  name: string,
  provider: ethers.providers.Provider,
  signer?: ethers.Signer
): SimpleGame {
  const game = createSimpleGame(
    {
      name,
      type: 'puzzle',
      maxPlayers: 2
    },
    provider,
    signer
  );
  
  // Configure NFT assets for Tetris pieces
  const nftModule = game.getNFTModule();
  if (nftModule) {
    nftModule.defineAssets({
      I: {
        name: 'I-Piece',
        symbol: 'TET-I',
        uri: 'https://example.com/metadata/tetris/I.json',
        rarity: 'common'
      },
      O: {
        name: 'O-Piece',
        symbol: 'TET-O',
        uri: 'https://example.com/metadata/tetris/O.json',
        rarity: 'common'
      },
      T: {
        name: 'T-Piece',
        symbol: 'TET-T',
        uri: 'https://example.com/metadata/tetris/T.json',
        rarity: 'rare'
      },
      S: {
        name: 'S-Piece',
        symbol: 'TET-S',
        uri: 'https://example.com/metadata/tetris/S.json',
        rarity: 'common'
      },
      Z: {
        name: 'Z-Piece',
        symbol: 'TET-Z',
        uri: 'https://example.com/metadata/tetris/Z.json',
        rarity: 'common'
      },
      J: {
        name: 'J-Piece',
        symbol: 'TET-J',
        uri: 'https://example.com/metadata/tetris/J.json',
        rarity: 'common'
      },
      L: {
        name: 'L-Piece',
        symbol: 'TET-L',
        uri: 'https://example.com/metadata/tetris/L.json',
        rarity: 'common'
      }
    });
  }
  
  // Configure payment system
  const paymentModule = game.getPaymentModule();
  if (paymentModule) {
    paymentModule.configure({
      entryFee: '0.01 SOM',
      winReward: '1.0 SOM',
      participationReward: '0.1 SOM'
    });
  }
  
  return game;
}

/**
 * Create a Chess-style board game
 * 
 * This template provides a complete implementation for a Chess-like game
 * with all necessary modules pre-configured.
 * 
 * @param name - Name of the game
 * @param provider - Ethereum provider
 * @param signer - Optional signer for transactions
 * @returns SimpleGame instance configured for Chess
 */
export function createChessGame(
  name: string,
  provider: ethers.providers.Provider,
  signer?: ethers.Signer
): SimpleGame {
  const game = createSimpleGame(
    {
      name,
      type: 'board',
      maxPlayers: 2
    },
    provider,
    signer
  );
  
  // Configure NFT assets for Chess pieces
  const nftModule = game.getNFTModule();
  if (nftModule) {
    nftModule.defineAssets({
      king: {
        name: 'King',
        symbol: 'CHESS-K',
        uri: 'https://example.com/metadata/chess/king.json',
        rarity: 'legendary'
      },
      queen: {
        name: 'Queen',
        symbol: 'CHESS-Q',
        uri: 'https://example.com/metadata/chess/queen.json',
        rarity: 'epic'
      },
      rook: {
        name: 'Rook',
        symbol: 'CHESS-R',
        uri: 'https://example.com/metadata/chess/rook.json',
        rarity: 'rare'
      },
      bishop: {
        name: 'Bishop',
        symbol: 'CHESS-B',
        uri: 'https://example.com/metadata/chess/bishop.json',
        rarity: 'rare'
      },
      knight: {
        name: 'Knight',
        symbol: 'CHESS-N',
        uri: 'https://example.com/metadata/chess/knight.json',
        rarity: 'common'
      },
      pawn: {
        name: 'Pawn',
        symbol: 'CHESS-P',
        uri: 'https://example.com/metadata/chess/pawn.json',
        rarity: 'common'
      }
    });
  }
  
  return game;
}