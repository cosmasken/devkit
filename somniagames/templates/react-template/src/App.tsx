// templates/react-template/src/App.tsx
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { GameRegistry } from 'somniagames-sdk' // This would be the real import
import './App.css'

interface GameState {
  gameId: string;
  players: any[];
  board?: any;
  currentTurn?: string;
  status: 'waiting' | 'active' | 'finished';
}

function App() {
  const [account, setAccount] = useState<string | null>(null)
  const [games, setGames] = useState<any[]>([])
  const [newGameName, setNewGameName] = useState('')
  const [newGameDescription, setNewGameDescription] = useState('')
  const [contractAddress, setContractAddress] = useState('')
  const [gameRegistry, setGameRegistry] = useState<any>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false)
  const [currentGameId, setCurrentGameId] = useState<number>(1)

  // Connect wallet and initialize WebSocket
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const address = await signer.getAddress()
        setAccount(address)
        
        // Initialize GameRegistry with WebSocket if contract address is provided
        if (contractAddress) {
          const registry = new GameRegistry(
            contractAddress,
            provider,
            signer,
            'ws://localhost:8080' // WebSocket URL
          )
          
          // Connect to WebSocket
          try {
            await registry.connectWebSocket()
            setIsWebSocketConnected(true)
            
            // Subscribe to game updates
            registry.subscribeToGameUpdates(currentGameId, (state: GameState) => {
              setGameState(state)
            })
            
            setGameRegistry(registry)
            console.log('Connected to GameRegistry with WebSocket at:', contractAddress)
          } catch (wsError) {
            console.warn('WebSocket connection failed, continuing without real-time features:', wsError)
            setGameRegistry(registry)
          }
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    } else {
      alert('Please install MetaMask!')
    }
  }

  // Create a new game
  const createGame = async () => {
    if (!newGameName.trim() || !newGameDescription.trim()) {
      alert('Please fill in all fields')
      return
    }
    
    if (!contractAddress) {
      alert('Please enter contract address')
      return
    }
    
    if (gameRegistry) {
      try {
        await gameRegistry.createGame(newGameName, newGameDescription)
        alert(`Game "${newGameName}" created successfully!`)
        setNewGameName('')
        setNewGameDescription('')
      } catch (error) {
        console.error('Failed to create game:', error)
        alert('Failed to create game. Check console for details.')
      }
    } else {
      alert('Please connect wallet first')
    }
  }

  // Join current game
  const joinGame = async () => {
    if (gameRegistry) {
      try {
        await gameRegistry.joinGame(currentGameId)
        alert(`Joined game ${currentGameId}!`)
      } catch (error) {
        console.error('Failed to join game:', error)
        alert('Failed to join game. Check console for details.')
      }
    }
  }

  // Send player action via WebSocket
  const handlePlayerAction = (action: any) => {
    if (gameRegistry && isWebSocketConnected) {
      gameRegistry.sendPlayerAction(currentGameId, {
        type: 'MOVE',
        data: action
      })
    } else {
      alert('WebSocket not connected. Real-time features unavailable.')
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>SomniaGames Platform</h1>
        <p>Build high-performance blockchain games on Somnia Network</p>
        
        <div className="connection-status">
          <p>WebSocket: {isWebSocketConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
        </div>
        
        <div className="contract-address">
          <input
            type="text"
            placeholder="GameRegistry Contract Address"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
          />
        </div>
        
        {!account ? (
          <button onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <div>
            <p>Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
            
            <div className="game-form">
              <h2>Create New Game</h2>
              <input
                type="text"
                placeholder="Game Name"
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
              />
              <textarea
                placeholder="Game Description"
                value={newGameDescription}
                onChange={(e) => setNewGameDescription(e.target.value)}
              />
              <button onClick={createGame}>Create Game</button>
            </div>

            <div className="game-interaction">
              <h2>Real-time Game Demo</h2>
              <div className="game-controls">
                <input
                  type="number"
                  placeholder="Game ID"
                  value={currentGameId}
                  onChange={(e) => setCurrentGameId(parseInt(e.target.value) || 1)}
                />
                <button onClick={joinGame}>Join Game</button>
              </div>

              {gameState && (
                <div className="game-board">
                  <h3>Game Status: {gameState.status}</h3>
                  <p>Players: {gameState.players.length}</p>
                  <p>Current Turn: {gameState.currentTurn || 'Waiting...'}</p>
                  
                  <div className="game-grid">
                    {/* Simple 3x3 grid for demo */}
                    {Array.from({ length: 9 }, (_, i) => (
                      <button
                        key={i}
                        className="grid-cell"
                        onClick={() => handlePlayerAction({ position: i })}
                        disabled={!isWebSocketConnected}
                      >
                        {gameState.board?.[i] || ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="info-section">
          <h3>Real-time Features</h3>
          <ul>
            <li>✅ WebSocket Integration</li>
            <li>✅ Live Game State Updates</li>
            <li>✅ Player Action Broadcasting</li>
            <li>✅ Smart Contract Integration</li>
            <li>✅ Automatic Reconnection</li>
          </ul>
          
          <h3>How to Use</h3>
          <ol>
            <li>Start the WebSocket server: <code>node websocket-server.js</code></li>
            <li>Deploy the GameRegistry contract to Somnia Testnet</li>
            <li>Enter the deployed contract address above</li>
            <li>Connect your wallet</li>
            <li>Create and join games with real-time updates!</li>
          </ol>
        </div>
      </header>
    </div>
  )
}

export default App