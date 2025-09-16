// src/websocket/GameStateManager.ts
import { EventEmitter } from 'events';

export interface GameState {
  gameId: string;
  players: Player[];
  board?: any;
  currentTurn?: string;
  status: 'waiting' | 'active' | 'finished';
  lastUpdate: number;
}

export interface Player {
  address: string;
  name?: string;
  score?: number;
  isOnline: boolean;
}

export interface GameUpdate {
  type: 'PLAYER_JOIN' | 'PLAYER_LEAVE' | 'GAME_STATE' | 'PLAYER_ACTION' | 'GAME_END';
  gameId: string;
  data: any;
  timestamp: number;
}

export interface PlayerAction {
  type: string;
  playerId: string;
  gameId: string;
  data: any;
  timestamp: number;
}

export class GameStateManager extends EventEmitter {
  private ws: WebSocket | null = null;
  private gameStates: Map<string, GameState> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnected = false;

  constructor(private wsUrl: string) {
    super();
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
        resolve();
      };

      this.ws.onmessage = (event) => {
        const update: GameUpdate = JSON.parse(event.data);
        this.handleGameUpdate(update);
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.emit('disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        this.emit('error', error);
        reject(error);
      };
    });
  }

  subscribeToGame(gameId: string): void {
    if (!this.ws) throw new Error('WebSocket not connected');
    
    this.ws.send(JSON.stringify({
      type: 'SUBSCRIBE',
      gameId,
      timestamp: Date.now()
    }));
  }

  sendPlayerAction(action: PlayerAction): void {
    if (!this.ws) throw new Error('WebSocket not connected');
    
    this.ws.send(JSON.stringify({
      ...action,
      type: 'PLAYER_ACTION',
      timestamp: Date.now()
    }));
  }

  getGameState(gameId: string): GameState | undefined {
    return this.gameStates.get(gameId);
  }

  private handleGameUpdate(update: GameUpdate): void {
    const { gameId, type, data } = update;

    switch (type) {
      case 'GAME_STATE':
        this.gameStates.set(gameId, data);
        this.emit('gameStateUpdate', gameId, data);
        break;
      case 'PLAYER_JOIN':
        this.emit('playerJoin', gameId, data.player);
        break;
      case 'PLAYER_ACTION':
        this.emit('playerAction', gameId, data);
        break;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    
    this.reconnectAttempts++;
    setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
  }
}
