import { SomniaGameKit } from '../src/index';

describe('SomniaGameKit WebSocket Events', () => {
  let sdk: SomniaGameKit;

  beforeEach(() => {
    sdk = new SomniaGameKit();
  });

  describe('WebSocket Event Listening', () => {
    it('should set up WebSocket event listeners', async () => {
      // Mock initialization
      await sdk.initialize({ network: 'somnia-testnet' });
      
      // Create a mock game using the legacy API
      const game = sdk.deployGame('bytecode', {}, { level: 1 });
      
      // Test WebSocket event listener setup
      const listenerCallback = jest.fn();
      const listenerId = await sdk.listenForWebSocketEvents(
        game.contractAddress!,
        'GameStarted',
        listenerCallback
      );
      
      expect(listenerId).toBeDefined();
      expect(typeof listenerId).toBe('string');
      expect(listenerId).toMatch(/^ws_/);
    });

    it('should stop WebSocket event listeners', async () => {
      // Mock initialization
      await sdk.initialize({ network: 'somnia-testnet' });
      
      // Create a mock game using the legacy API
      const game = sdk.deployGame('bytecode', {}, { level: 1 });
      
      // Set up a WebSocket event listener
      const listenerCallback = jest.fn();
      const listenerId = await sdk.listenForWebSocketEvents(
        game.contractAddress!,
        'GameStarted',
        listenerCallback
      );
      
      // Stop the listener
      await expect(sdk.stopListeningForWebSocketEvents(listenerId)).resolves.not.toThrow();
    });
  });
});