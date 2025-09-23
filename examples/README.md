# Simple Card Game Examples

This folder contains simple example games built with the Somnia GameKit SDK.

## Simple Card Collection Game

A minimal card collection game that demonstrates:
- Player creation
- Game deployment on Somnia Network
- NFT card minting and collection
- Viewing player's NFT collection
- Card trading between players

### Files

- `simple-card-game.js` - Node.js console version
- `card-game.html` - Web browser version with UI

### Running the Console Version

```bash
# Install dependencies
npm install

# Run the game
node examples/simple-card-game.js
```

### Running the Web Version

1. Build the SDK:
```bash
npm run build
```

2. Serve the HTML file:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server
```

3. Open `http://localhost:8000/examples/card-game.html`

### Game Features

- **Connect Wallet**: Connects to MetaMask or other Web3 wallets
- **Collect Cards**: Mint NFT cards (Fire Dragon, Ice Wizard, Lightning Bolt)
- **View Collection**: Display all owned NFT cards
- **Trade Cards**: Transfer cards between players (console version)

### Blockchain Operations

Each action performs real blockchain transactions:
- Game deployment creates a smart contract
- Card collection mints NFTs on-chain
- All operations are recorded on Somnia Network

## Simple RPG Character Creation

A basic RPG character creation system that demonstrates:
- Player creation
- NFT character minting with attributes
- Character leveling

### Running the Example

```bash
node examples/rpg-character.js
```

## Simple Voting System

A basic voting system that demonstrates:
- Creating polls as NFTs
- Casting votes as NFTs
- Tallying results

### Running the Example

```bash
node examples/voting-system.js
```

## Simple NFT Marketplace

A basic NFT marketplace that demonstrates:
- Listing NFTs for sale
- Purchasing NFTs
- Managing collections

### Running the Example

```bash
node examples/nft-marketplace.js
```

## Tic-Tac-Toe Game

A complete tic-tac-toe game with NFT rewards that demonstrates:
- Game session management
- Real-time moves
- NFT rewards for victories

### Files

- `tictactoe-simple.html` - Simple HTML version
- `react-tictactoe/TicTacToe.jsx` - React component version

### Requirements

- MetaMask or compatible Web3 wallet
- Somnia testnet tokens for gas fees
- Modern web browser (for HTML version)
