// src/websocket/GameServer.ts
import WebSocket from 'ws';
import { GameState, GameUpdate, PlayerAction } from './GameStateManager';

export class GameServer {
  private wss: WebSocket.Server;
  private gameStates: Map<string, GameState> = new Map();
  private gameSubscriptions: Map<string, Set<WebSocket>> = new Map();

  constructor(port: number = 8080) {
    this.wss = new WebSocket.Server({ port });
    this.setupServer();
  }

  private setupServer(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('Client connected');

      ws.on('message', (data: string) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Invalid message:', error);
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected');
        this.removeClientFromAllSubscriptions(ws);
      });
    });
  }

  private handleMessage(ws: WebSocket, message: any): void {
    switch (message.type) {
      case 'SUBSCRIBE':
        this.subscribeToGame(ws, message.gameId);
        break;
      case 'UNSUBSCRIBE':
        this.unsubscribeFromGame(ws, message.gameId);
        break;
      case 'PLAYER_ACTION':
        this.handlePlayerAction(message);
        break;
    }
  }

  private subscribeToGame(ws: WebSocket, gameId: string): void {
    if (!this.gameSubscriptions.has(gameId)) {
      this.gameSubscriptions.set(gameId, new Set());
    }
    this.gameSubscriptions.get(gameId)!.add(ws);

    // Send current game state
    const gameState = this.gameStates.get(gameId);
    if (gameState) {
      ws.send(JSON.stringify({
        type: 'GAME_STATE',
        gameId,
        data: gameState,
        timestamp: Date.now()
      }));
    }
  }

  private unsubscribeFromGame(ws: WebSocket, gameId: string): void {
    const subscribers = this.gameSubscriptions.get(gameId);
    if (subscribers) {
      subscribers.delete(ws);
    }
  }

  private handlePlayerAction(action: PlayerAction): void {
    // Process the action and update game state
    this.updateGameState(action.gameId, action);
    
    // Broadcast to all subscribers
    this.broadcastToGame(action.gameId, {
      type: 'PLAYER_ACTION',
      gameId: action.gameId,
      data: action,
      timestamp: Date.now()
    });
  }

  private updateGameState(gameId: string, action: PlayerAction): void {
    // Mock game state update logic
    let gameState = this.gameStates.get(gameId);
    if (!gameState) {
      gameState = {
        gameId,
        players: [],
        status: 'active',
        lastUpdate: Date.now()
      };
      this.gameStates.set(gameId, gameState);
    }

    gameState.lastUpdate = Date.now();
    // Add game-specific logic here
  }

  private broadcastToGame(gameId: string, update: GameUpdate): void {
    const subscribers = this.gameSubscriptions.get(gameId);
    if (subscribers) {
      const message = JSON.stringify(update);
      subscribers.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    }
  }

  private removeClientFromAllSubscriptions(ws: WebSocket): void {
    this.gameSubscriptions.forEach(subscribers => {
      subscribers.delete(ws);
    });
  }
}
