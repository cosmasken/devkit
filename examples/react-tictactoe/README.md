# React Tic-Tac-Toe with Somnia GameKit

A React-based tic-tac-toe game that demonstrates blockchain gaming with the Somnia GameKit SDK.

## Features

- **Blockchain Game Sessions**: Each game is deployed as a smart contract
- **Move Recording**: Every move is recorded on the Somnia Network
- **NFT Rewards**: Winners receive victory NFTs
- **Real-time UI**: React-based interactive game board

## Setup

```bash
# Navigate to the React example
cd examples/react-tictactoe

# Install dependencies
npm install

# Start development server
npm run dev
```

## Game Flow

1. **Start Game**: Deploys game contract and creates session
2. **Make Moves**: Each click records move on blockchain
3. **Win Condition**: Winner gets NFT minted to their wallet
4. **Game End**: Final state recorded on-chain

## Files

- `TicTacToe.jsx` - Full blockchain-integrated version
- `TicTacToeDemo.jsx` - Demo version with simulated blockchain calls
- `App.jsx` - React app wrapper
- `index.jsx` - React entry point

## Requirements

- Node.js 16+
- MetaMask wallet
- Somnia testnet tokens for gas fees

## Blockchain Operations

- Game contract deployment
- Move transactions on each turn
- NFT minting for winners
- Game state persistence on-chain
