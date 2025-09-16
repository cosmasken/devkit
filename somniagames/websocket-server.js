// websocket-server.js
const { GameServer } = require('./dist/websocket/GameServer');

console.log('Starting SomniaGames WebSocket Server...');

const server = new GameServer(8080);

console.log('WebSocket server running on port 8080');
console.log('Connect your games to: ws://localhost:8080');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down WebSocket server...');
  process.exit(0);
});
