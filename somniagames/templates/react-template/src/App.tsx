// templates/react-template/src/App.tsx
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { GameRegistry } from 'somniagames-sdk' // This would be the real import
import './App.css'

function App() {
  const [account, setAccount] = useState<string | null>(null)
  const [games, setGames] = useState<any[]>([])
  const [newGameName, setNewGameName] = useState('')
  const [newGameDescription, setNewGameDescription] = useState('')
  const [contractAddress, setContractAddress] = useState('')
  const [gameRegistry, setGameRegistry] = useState<any>(null)

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const address = await signer.getAddress()
        setAccount(address)
        
        // Initialize GameRegistry if contract address is provided
        if (contractAddress) {
          // In a real implementation, this would connect to the actual contract
          console.log('Connected to GameRegistry at:', contractAddress)
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
    
    // In a real implementation, this would interact with the GameRegistry contract
    alert(`Game "${newGameName}" would be created on the blockchain at contract ${contractAddress}!`)
    setNewGameName('')
    setNewGameDescription('')
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>SomniaGames Platform</h1>
        <p>Build high-performance blockchain games on Somnia Network</p>
        
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
          </div>
        )}
        
        <div className="info-section">
          <h3>How to Use</h3>
          <ol>
            <li>Deploy the GameRegistry contract to Somnia Testnet</li>
            <li>Enter the deployed contract address above</li>
            <li>Connect your wallet</li>
            <li>Create your first blockchain game!</li>
          </ol>
        </div>
      </header>
    </div>
  )
}

export default App