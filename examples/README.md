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

### Requirements

- MetaMask or compatible Web3 wallet
- Somnia testnet tokens for gas fees
- Modern web browser (for HTML version)
