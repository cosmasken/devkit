// src/__tests__/WebSocketIntegration.test.ts
import { GameRegistry } from '../GameRegistry';
import { GameStateManager } from '../websocket/GameStateManager';

// Mock ethers
jest.mock('ethers', () => {
  return {
    ethers: {
      Contract: jest.fn().mockImplementation(() => {
        const contract = {
          createGame: jest.fn().mockResolvedValue({
            wait: jest.fn().mockResolvedValue({ transactionHash: '0x123' })
          }),
          games: jest.fn().mockResolvedValue({
            id: { toNumber: () => 1 },
            name: 'Test Game',
            description: 'A test game',
            metadataURI: '',
            creator: '0x1234567890123456789012345678901234567890',
            createdAt: { toNumber: () => 1234567890 },
            updatedAt: { toNumber: () => 1234567890 },
            isActive: true,
            playerCount: { toNumber: () => 0 },
            version: { toNumber: () => 1 }
          }),
          gameCount: jest.fn().mockResolvedValue({ toNumber: () => 1 }),
          joinGame: jest.fn().mockResolvedValue({
            wait: jest.fn().mockResolvedValue({ transactionHash: '0x456' })
          }),
          connect: jest.fn().mockReturnThis()
        };
        return contract;
      }),
      providers: {
        Provider: jest.fn(),
        Web3Provider: jest.fn().mockImplementation(() => {
          return {
            send: jest.fn().mockResolvedValue([]),
            getSigner: jest.fn().mockReturnValue({
              getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
            })
          };
        })
      },
      Signer: jest.fn(),
    }
  };
});

describe('WebSocket Integration', () => {
  let gameRegistry: GameRegistry;
  let mockProvider: any;

  beforeEach(() => {
    mockProvider = {
      getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
      getBlockNumber: jest.fn().mockResolvedValue(1),
      getGasPrice: jest.fn().mockResolvedValue({ toNumber: () => 1 }),
      getFeeData: jest.fn().mockResolvedValue({}),
      getBalance: jest.fn().mockResolvedValue({ toNumber: () => 1 }),
      getTransactionCount: jest.fn().mockResolvedValue(1),
      getCode: jest.fn().mockResolvedValue('0x'),
      getStorageAt: jest.fn().mockResolvedValue('0x'),
      sendTransaction: jest.fn().mockResolvedValue({}),
      call: jest.fn().mockResolvedValue('0x'),
      estimateGas: jest.fn().mockResolvedValue({ toNumber: () => 1 }),
      getBlock: jest.fn().mockResolvedValue({}),
      getTransaction: jest.fn().mockResolvedValue({}),
      getTransactionReceipt: jest.fn().mockResolvedValue({}),
      resolveName: jest.fn().mockResolvedValue(null),
      lookupAddress: jest.fn().mockResolvedValue(null),
      on: jest.fn(),
      once: jest.fn(),
      off: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      addListener: jest.fn(),
      emit: jest.fn(),
      listenerCount: jest.fn().mockResolvedValue(0),
      listeners: jest.fn().mockResolvedValue([]),
      waitForTransaction: jest.fn().mockResolvedValue({})
    };

    // Create GameRegistry instance with WebSocket URL
    gameRegistry = new GameRegistry(
      '0x1234567890123456789012345678901234567890',
      mockProvider,
      {
        getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
        sendTransaction: jest.fn()
      } as any,
      'ws://localhost:8080'
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with WebSocket manager', () => {
    expect((gameRegistry as any).gameStateManager).toBeInstanceOf(GameStateManager);
  });

  it('should connect to WebSocket server', async () => {
    // Mock the WebSocket connection
    const mockConnect = jest.spyOn(GameStateManager.prototype, 'connect').mockResolvedValue();
    
    await gameRegistry.connectWebSocket();
    
    expect(mockConnect).toHaveBeenCalled();
  });

  it('should subscribe to game updates', async () => {
    // Mock the WebSocket connection
    jest.spyOn(GameStateManager.prototype, 'connect').mockResolvedValue();
    const mockSubscribe = jest.spyOn(GameStateManager.prototype, 'subscribeToGame').mockImplementation();
    const mockOn = jest.spyOn(GameStateManager.prototype, 'on').mockImplementation();
    
    await gameRegistry.connectWebSocket();
    const mockCallback = jest.fn();
    gameRegistry.subscribeToGameUpdates(1, mockCallback);
    
    expect(mockSubscribe).toHaveBeenCalledWith('1');
  });

  it('should send player actions via WebSocket', async () => {
    // Mock the WebSocket connection
    jest.spyOn(GameStateManager.prototype, 'connect').mockResolvedValue();
    const mockSendAction = jest.spyOn(GameStateManager.prototype, 'sendPlayerAction').mockImplementation();
    
    await gameRegistry.connectWebSocket();
    await gameRegistry.sendPlayerAction(1, { type: 'MOVE', data: { position: 5 } });
    
    expect(mockSendAction).toHaveBeenCalled();
    // Check that it was called with the correct parameters
    const call = mockSendAction.mock.calls[0][0];
    expect(call.type).toBe('MOVE');
    expect(call.playerId).toBe('0x1234567890123456789012345678901234567890');
    expect(call.gameId).toBe('1');
    expect(call.data).toEqual({ position: 5 });
    expect(call.timestamp).toBeDefined();
  });

  it('should get real-time game state', async () => {
    // Mock the WebSocket connection
    jest.spyOn(GameStateManager.prototype, 'connect').mockResolvedValue();
    const mockGetState = jest.spyOn(GameStateManager.prototype, 'getGameState').mockReturnValue({
      gameId: '1',
      players: [],
      status: 'active',
      lastUpdate: Date.now()
    });
    
    await gameRegistry.connectWebSocket();
    const state = gameRegistry.getRealtimeGameState(1);
    
    expect(mockGetState).toHaveBeenCalledWith('1');
    expect(state).toBeDefined();
  });
});