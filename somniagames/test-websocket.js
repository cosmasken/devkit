const WebSocket = require('ws');

console.log('Testing WebSocket connection...');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', function open() {
  console.log('Connected to WebSocket server');
  
  // Test subscription
  ws.send(JSON.stringify({
    type: 'SUBSCRIBE',
    gameId: 'test-game-1',
    timestamp: Date.now()
  }));
  
  // Test player action
  setTimeout(() => {
    ws.send(JSON.stringify({
      type: 'PLAYER_ACTION',
      gameId: 'test-game-1',
      playerId: 'player-1',
      data: { action: 'move', position: 5 },
      timestamp: Date.now()
    }));
  }, 1000);
});

ws.on('message', function incoming(data) {
  console.log('Received:', data.toString());
});

ws.on('error', function error(err) {
  console.error('WebSocket error:', err);
});

ws.on('close', function close() {
  console.log('Disconnected from WebSocket server');
});

// Close after 3 seconds
setTimeout(() => {
  ws.close();
  console.log('Test completed');
}, 3000);