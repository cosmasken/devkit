// examples/somnia-pets/src/App.tsx
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { GameRegistry, GameAsset, GameToken, GameLeaderboard, GameShop } from '@somniagames/sdk' // Import our SDK
import './App.css'

function App() {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [gameRegistry, setGameRegistry] = useState<GameRegistry | null>(null)
  const [gameAsset, setGameAsset] = useState<GameAsset | null>(null)
  const [gameToken, setGameToken] = useState<GameToken | null>(null)
  const [gameLeaderboard, setGameLeaderboard] = useState<GameLeaderboard | null>(null)
  const [gameShop, setGameShop] = useState<GameShop | null>(null)
  const [contractAddress, setContractAddress] = useState('')
  const [games, setGames] = useState<any[]>([])
  const [newGameName, setNewGameName] = useState('')
  const [newGameDescription, setNewGameDescription] = useState('')
  const [newGameMetadataURI, setNewGameMetadataURI] = useState('')
  const [loading, setLoading] = useState(false)
  const [gameCount, setGameCount] = useState<number | null>(null)
  const [activeGamesCount, setActiveGamesCount] = useState<number | null>(null)
  const [selectedGameId, setSelectedGameId] = useState<number>(1)
  const [gameVersion, setGameVersion] = useState<number>(1)
  const [playerScore, setPlayerScore] = useState<number>(0)
  const [shopItemId, setShopItemId] = useState<number>(1)
  const [shopItemQuantity, setShopItemQuantity] = useState<number>(1)
  const [assetName, setAssetName] = useState('')
  const [assetDescription, setAssetDescription] = useState('')
  const [assetMetadataURI, setAssetMetadataURI] = useState('')
  const [assetGameId, setAssetGameId] = useState<number>(1)
  const [assetRarity, setAssetRarity] = useState<number>(1)

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
        await web3Provider.send("eth_requestAccounts", [])
        const web3Signer = web3Provider.getSigner()
        const address = await web3Signer.getAddress()
        
        setProvider(web3Provider)
        setSigner(web3Signer)
        setAccount(address)
        
        // Initialize contracts if contract address is provided
        if (contractAddress) {
          const registry = new GameRegistry(contractAddress, web3Provider, web3Signer)
          setGameRegistry(registry)
          
          // Get associated contracts
          try {
            const leaderboardAddress = await registry.getGameLeaderboard(selectedGameId)
            const shopAddress = await registry.getGameShop(selectedGameId)
            
            if (leaderboardAddress && leaderboardAddress !== ethers.constants.AddressZero) {
              setGameLeaderboard(new GameLeaderboard(leaderboardAddress, web3Provider, web3Signer))
            }
            
            if (shopAddress && shopAddress !== ethers.constants.AddressZero) {
              setGameShop(new GameShop(shopAddress, web3Provider, web3Signer))
            }
          } catch (e) {
            console.log("Could not load associated contracts")
          }
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error)
        alert('Failed to connect wallet. Check console for details.')
      }
    } else {
      alert('Please install MetaMask!')
    }
  }

  // Initialize contracts when contract address changes
  useEffect(() => {
    if (contractAddress && provider && signer) {
      const registry = new GameRegistry(contractAddress, provider, signer)
      setGameRegistry(registry)
    }
  }, [contractAddress, provider, signer])

  // Create a new game using our SDK
  const createGame = async () => {
    if (!newGameName.trim() || !newGameDescription.trim()) {
      alert('Please fill in all fields')
      return
    }
    
    if (!gameRegistry) {
      alert('Please enter contract address and connect wallet')
      return
    }
    
    setLoading(true)
    try {
      // This is where we use our SDK to interact with the contract
      const tx = await gameRegistry.createGame(newGameName, newGameDescription, newGameMetadataURI)
      console.log('Game created with transaction:', tx)
      alert(`Game "${newGameName}" created successfully! Transaction hash: ${tx.transactionHash}`)
      
      // Clear form
      setNewGameName('')
      setNewGameDescription('')
      setNewGameMetadataURI('')
      
      // Update game counts
      await updateGameCount();
      await updateActiveGamesCount();
    } catch (error) {
      console.error('Failed to create game:', error)
      alert('Failed to create game. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  // Update an existing game
  const updateGame = async () => {
    if (!newGameName.trim() || !newGameDescription.trim()) {
      alert('Please fill in all fields')
      return
    }
    
    if (!gameRegistry) {
      alert('Please enter contract address and connect wallet')
      return
    }
    
    setLoading(true)
    try {
      const tx = await gameRegistry.updateGame(selectedGameId, newGameName, newGameDescription)
      console.log('Game updated with transaction:', tx)
      alert(`Game ${selectedGameId} updated successfully! Transaction hash: ${tx.transactionHash}`)
    } catch (error) {
      console.error('Failed to update game:', error)
      alert('Failed to update game. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  // Update game metadata
  const updateGameMetadata = async () => {
    if (!newGameMetadataURI.trim()) {
      alert('Please enter metadata URI')
      return
    }
    
    if (!gameRegistry) {
      alert('Please enter contract address and connect wallet')
      return
    }
    
    setLoading(true)
    try {
      const tx = await gameRegistry.updateGameMetadata(selectedGameId, newGameMetadataURI)
      console.log('Game metadata updated with transaction:', tx)
      alert(`Game ${selectedGameId} metadata updated successfully! Transaction hash: ${tx.transactionHash}`)
    } catch (error) {
      console.error('Failed to update game metadata:', error)
      alert('Failed to update game metadata. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  // Update game version
  const updateGameVersion = async () => {
    if (!gameRegistry) {
      alert('Please enter contract address and connect wallet')
      return
    }
    
    setLoading(true)
    try {
      const tx = await gameRegistry.updateGameVersion(selectedGameId, gameVersion)
      console.log('Game version updated with transaction:', tx)
      alert(`Game ${selectedGameId} version updated to ${gameVersion} successfully! Transaction hash: ${tx.transactionHash}`)
    } catch (error) {
      console.error('Failed to update game version:', error)
      alert('Failed to update game version. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  // Join a game
  const joinGame = async () => {
    if (!gameRegistry) {
      alert('Please enter contract address and connect wallet')
      return
    }
    
    setLoading(true)
    try {
      const tx = await gameRegistry.joinGame(selectedGameId)
      console.log('Joined game with transaction:', tx)
      alert(`Joined game ${selectedGameId} successfully! Transaction hash: ${tx.transactionHash}`)
    } catch (error) {
      console.error('Failed to join game:', error)
      alert('Failed to join game. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  // Leave a game
  const leaveGame = async () => {
    if (!gameRegistry) {
      alert('Please enter contract address and connect wallet')
      return
    }
    
    setLoading(true)
    try {
      const tx = await gameRegistry.leaveGame(selectedGameId)
      console.log('Left game with transaction:', tx)
      alert(`Left game ${selectedGameId} successfully! Transaction hash: ${tx.transactionHash}`)
    } catch (error) {
      console.error('Failed to leave game:', error)
      alert('Failed to leave game. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  // Get game info using our SDK
  const getGameInfo = async (gameId: number) => {
    if (!gameRegistry) return
    
    try {
      const game = await gameRegistry.getGame(gameId)
      console.log('Game info:', game)
      alert(`Game ${gameId}: ${game.name} - ${game.description}
Version: ${game.version}
Players: ${game.playerCount}
Metadata: ${game.metadataURI}`)
    } catch (error) {
      console.error('Failed to get game info:', error)
      alert('Failed to get game info. Check console for details.')
    }
  }

  // Get total game count using our SDK
  const updateGameCount = async () => {
    if (!gameRegistry) return
    
    try {
      const count = await gameRegistry.getGameCount()
      setGameCount(count)
    } catch (error) {
      console.error('Failed to get game count:', error)
      alert('Failed to get game count. Check console for details.')
    }
  }

  // Get active games count
  const updateActiveGamesCount = async () => {
    if (!gameRegistry) return
    
    try {
      const count = await gameRegistry.getActiveGamesCount()
      setActiveGamesCount(count)
    } catch (error) {
      console.error('Failed to get active games count:', error)
      alert('Failed to get active games count. Check console for details.')
    }
  }

  // Get games by creator
  const getGamesByCreator = async () => {
    if (!gameRegistry || !account) return
    
    try {
      const gameIds = await gameRegistry.getGamesByCreator(account)
      console.log('Games by creator:', gameIds)
      alert(`You have created ${gameIds.length} games with IDs: ${gameIds.join(', ')}`)
    } catch (error) {
      console.error('Failed to get games by creator:', error)
      alert('Failed to get games by creator. Check console for details.')
    }
  }

  // Get game players
  const getGamePlayers = async () => {
    if (!gameRegistry) return
    
    try {
      const players = await gameRegistry.getGamePlayers(selectedGameId)
      console.log('Game players:', players)
      alert(`Game ${selectedGameId} has ${players.length} players:
${players.join('
')}`)
    } catch (error) {
      console.error('Failed to get game players:', error)
      alert('Failed to get game players. Check console for details.')
    }
  }

  // Check if player is in game
  const checkPlayerInGame = async () => {
    if (!gameRegistry || !account) return
    
    try {
      const isInGame = await gameRegistry.isPlayerInGame(selectedGameId, account)
      console.log('Player in game:', isInGame)
      alert(`You are ${isInGame ? '' : 'not '}in game ${selectedGameId}`)
    } catch (error) {
      console.error('Failed to check if player is in game:', error)
      alert('Failed to check if player is in game. Check console for details.')
    }
  }

  // Get active games
  const getActiveGames = async () => {
    if (!gameRegistry) return
    
    try {
      const games = await gameRegistry.getActiveGames(0, 10)
      console.log('Active games:', games)
      alert(`Active games (first 10): ${games.join(', ')}`)
    } catch (error) {
      console.error('Failed to get active games:', error)
      alert('Failed to get active games. Check console for details.')
    }
  }

  // Submit score to leaderboard
  const submitScore = async () => {
    if (!gameLeaderboard) {
      alert('Leaderboard not initialized')
      return
    }
    
    setLoading(true)
    try {
      const tx = await gameLeaderboard.submitScore(1, playerScore)
      console.log('Score submitted with transaction:', tx)
      alert(`Score ${playerScore} submitted successfully! Transaction hash: ${tx.transactionHash}`)
    } catch (error) {
      console.error('Failed to submit score:', error)
      alert('Failed to submit score. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  // Get leaderboard info
  const getLeaderboardInfo = async () => {
    if (!gameLeaderboard) {
      alert('Leaderboard not initialized')
      return
    }
    
    try {
      const leaderboard = await gameLeaderboard.getLeaderboard(1)
      console.log('Leaderboard info:', leaderboard)
      alert(`Leaderboard: ${leaderboard.name}
Description: ${leaderboard.description}
Active: ${leaderboard.active ? 'Yes' : 'No'}`)
    } catch (error) {
      console.error('Failed to get leaderboard info:', error)
      alert('Failed to get leaderboard info. Check console for details.')
    }
  }

  // Get top scores
  const getTopScores = async () => {
    if (!gameLeaderboard) {
      alert('Leaderboard not initialized')
      return
    }
    
    try {
      const scores = await gameLeaderboard.getTopScores(1, 10)
      console.log('Top scores:', scores)
      const scoreList = scores.map((score, index) => 
        `${index + 1}. ${score.player.substring(0, 6)}...${score.player.substring(score.player.length - 4)}: ${score.score}`
      ).join('
')
      alert(`Top 10 scores:
${scoreList}`)
    } catch (error) {
      console.error('Failed to get top scores:', error)
      alert('Failed to get top scores. Check console for details.')
    }
  }

  // Purchase item from shop
  const purchaseItem = async () => {
    if (!gameShop) {
      alert('Shop not initialized')
      return
    }
    
    setLoading(true)
    try {
      const tx = await gameShop.purchaseItem(shopItemId, shopItemQuantity)
      console.log('Item purchased with transaction:', tx)
      alert(`Item ${shopItemId} purchased successfully! Transaction hash: ${tx.transactionHash}`)
    } catch (error) {
      console.error('Failed to purchase item:', error)
      alert('Failed to purchase item. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  // Get shop item info
  const getShopItemInfo = async () => {
    if (!gameShop) {
      alert('Shop not initialized')
      return
    }
    
    try {
      const item = await gameShop.getItem(shopItemId)
      console.log('Shop item info:', item)
      alert(`Item: ${item.name}
Description: ${item.description}
Price: ${item.price}
Quantity: ${item.quantity}`)
    } catch (error) {
      console.error('Failed to get shop item info:', error)
      alert('Failed to get shop item info. Check console for details.')
    }
  }

  // Get shop items by game
  const getShopItemsByGame = async () => {
    if (!gameShop) {
      alert('Shop not initialized')
      return
    }
    
    try {
      const items = await gameShop.getItemsByGame(selectedGameId, 10)
      console.log('Shop items:', items)
      alert(`Game ${selectedGameId} has ${items.length} items with IDs: ${items.join(', ')}`)
    } catch (error) {
      console.error('Failed to get shop items:', error)
      alert('Failed to get shop items. Check console for details.')
    }
  }

  // Create game asset
  const createAsset = async () => {
    if (!assetName.trim() || !assetDescription.trim()) {
      alert('Please fill in all fields')
      return
    }
    
    if (!gameAsset || !account) {
      alert('Asset contract not initialized or wallet not connected')
      return
    }
    
    setLoading(true)
    try {
      const result = await gameAsset.createAsset(
        account,
        assetName,
        assetDescription,
        assetMetadataURI,
        assetGameId,
        assetRarity
      )
      console.log('Asset created with transaction:', result)
      alert(`Asset "${assetName}" created successfully with ID ${result.assetId}! Transaction hash: ${result.receipt.transactionHash}`)
      
      // Clear form
      setAssetName('')
      setAssetDescription('')
      setAssetMetadataURI('')
    } catch (error) {
      console.error('Failed to create asset:', error)
      alert('Failed to create asset. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  // Get asset info
  const getAssetInfo = async () => {
    if (!gameAsset) {
      alert('Asset contract not initialized')
      return
    }
    
    try {
      const asset = await gameAsset.getAsset(1)
      console.log('Asset info:', asset)
      alert(`Asset: ${asset.name}
Description: ${asset.description}
Level: ${asset.level}
Rarity: ${asset.rarity}`)
    } catch (error) {
      console.error('Failed to get asset info:', error)
      alert('Failed to get asset info. Check console for details.')
    }
  }

  // Level up asset
  const levelUpAsset = async () => {
    if (!gameAsset) {
      alert('Asset contract not initialized')
      return
    }
    
    setLoading(true)
    try {
      const tx = await gameAsset.levelUpAsset(1)
      console.log('Asset leveled up with transaction:', tx)
      alert(`Asset leveled up successfully! Transaction hash: ${tx.transactionHash}`)
    } catch (error) {
      console.error('Failed to level up asset:', error)
      alert('Failed to level up asset. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>SomniaGames Example</h1>
        <p>Build high-performance blockchain games on Somnia Network</p>
        <p className="subtitle">Using @somniagames/sdk v0.1.0</p>
        
        <div className="contract-address">
          <input
            type="text"
            placeholder="GameRegistry Contract Address"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
          />
        </div>
        
        {!account ? (
          <button onClick={connectWallet} className="connect-button">Connect Wallet</button>
        ) : (
          <div>
            <p className="account">Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
            
            <div className="game-form">
              <h2>Create New Game</h2>
              <input
                type="text"
                placeholder="Game Name"
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
                disabled={loading}
              />
              <textarea
                placeholder="Game Description"
                value={newGameDescription}
                onChange={(e) => setNewGameDescription(e.target.value)}
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Metadata URI (optional)"
                value={newGameMetadataURI}
                onChange={(e) => setNewGameMetadataURI(e.target.value)}
                disabled={loading}
              />
              <button 
                onClick={createGame} 
                disabled={loading || !gameRegistry}
                className="create-button"
              >
                {loading ? 'Creating...' : 'Create Game'}
              </button>
            </div>
            
            <div className="game-management">
              <h3>Game Management</h3>
              <div className="management-controls">
                <div className="input-group">
                  <label>Game ID:</label>
                  <input
                    type="number"
                    value={selectedGameId}
                    onChange={(e) => setSelectedGameId(parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </div>
                
                <div className="button-row">
                  <button 
                    onClick={updateGame} 
                    disabled={loading || !gameRegistry}
                    className="management-button update-button"
                  >
                    Update Game
                  </button>
                  <button 
                    onClick={updateGameMetadata} 
                    disabled={loading || !gameRegistry}
                    className="management-button metadata-button"
                  >
                    Update Metadata
                  </button>
                </div>
                
                <div className="input-group">
                  <label>Version:</label>
                  <input
                    type="number"
                    value={gameVersion}
                    onChange={(e) => setGameVersion(parseInt(e.target.value) || 1)}
                    min="1"
                  />
                  <button 
                    onClick={updateGameVersion} 
                    disabled={loading || !gameRegistry}
                    className="management-button version-button"
                  >
                    Update Version
                  </button>
                </div>
                
                <div className="button-row">
                  <button 
                    onClick={joinGame} 
                    disabled={loading || !gameRegistry}
                    className="management-button join-button"
                  >
                    Join Game
                  </button>
                  <button 
                    onClick={leaveGame} 
                    disabled={loading || !gameRegistry}
                    className="management-button leave-button"
                  >
                    Leave Game
                  </button>
                </div>
                
                <div className="button-row">
                  <button 
                    onClick={getGamePlayers} 
                    disabled={loading || !gameRegistry}
                    className="management-button players-button"
                  >
                    Get Players
                  </button>
                  <button 
                    onClick={checkPlayerInGame} 
                    disabled={loading || !gameRegistry}
                    className="management-button check-button"
                  >
                    Check Membership
                  </button>
                </div>
              </div>
            </div>
            
            <div className="asset-section">
              <h3>Game Assets</h3>
              <div className="asset-controls">
                <input
                  type="text"
                  placeholder="Asset Name"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  disabled={loading}
                />
                <textarea
                  placeholder="Asset Description"
                  value={assetDescription}
                  onChange={(e) => setAssetDescription(e.target.value)}
                  disabled={loading}
                />
                <input
                  type="text"
                  placeholder="Metadata URI"
                  value={assetMetadataURI}
                  onChange={(e) => setAssetMetadataURI(e.target.value)}
                  disabled={loading}
                />
                <div className="input-row">
                  <div className="input-group">
                    <label>Game ID:</label>
                    <input
                      type="number"
                      value={assetGameId}
                      onChange={(e) => setAssetGameId(parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>
                  <div className="input-group">
                    <label>Rarity (1-5):</label>
                    <input
                      type="number"
                      value={assetRarity}
                      onChange={(e) => setAssetRarity(parseInt(e.target.value) || 1)}
                      min="1"
                      max="5"
                    />
                  </div>
                </div>
                <button 
                  onClick={createAsset} 
                  disabled={loading || !gameAsset || !account}
                  className="asset-button create-asset-button"
                >
                  {loading ? 'Creating...' : 'Create Asset'}
                </button>
                
                <div className="button-row">
                  <button 
                    onClick={getAssetInfo} 
                    disabled={loading || !gameAsset}
                    className="asset-button info-button"
                  >
                    Get Asset Info
                  </button>
                  <button 
                    onClick={levelUpAsset} 
                    disabled={loading || !gameAsset}
                    className="asset-button level-up-button"
                  >
                    Level Up Asset
                  </button>
                </div>
              </div>
            </div>
            
            <div className="leaderboard-section">
              <h3>Leaderboards</h3>
              <div className="leaderboard-controls">
                <div className="input-group">
                  <label>Score:</label>
                  <input
                    type="number"
                    value={playerScore}
                    onChange={(e) => setPlayerScore(parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <button 
                    onClick={submitScore} 
                    disabled={loading || !gameLeaderboard}
                    className="leaderboard-button submit-button"
                  >
                    {loading ? 'Submitting...' : 'Submit Score'}
                  </button>
                </div>
                
                <div className="button-row">
                  <button 
                    onClick={getLeaderboardInfo} 
                    disabled={loading || !gameLeaderboard}
                    className="leaderboard-button info-button"
                  >
                    Get Leaderboard Info
                  </button>
                  <button 
                    onClick={getTopScores} 
                    disabled={loading || !gameLeaderboard}
                    className="leaderboard-button scores-button"
                  >
                    Get Top Scores
                  </button>
                </div>
              </div>
            </div>
            
            <div className="shop-section">
              <h3>Game Shop</h3>
              <div className="shop-controls">
                <div className="input-row">
                  <div className="input-group">
                    <label>Item ID:</label>
                    <input
                      type="number"
                      value={shopItemId}
                      onChange={(e) => setShopItemId(parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>
                  <div className="input-group">
                    <label>Quantity:</label>
                    <input
                      type="number"
                      value={shopItemQuantity}
                      onChange={(e) => setShopItemQuantity(parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>
                </div>
                <button 
                  onClick={purchaseItem} 
                  disabled={loading || !gameShop}
                  className="shop-button purchase-button"
                >
                  {loading ? 'Purchasing...' : 'Purchase Item'}
                </button>
                
                <div className="button-row">
                  <button 
                    onClick={getShopItemInfo} 
                    disabled={loading || !gameShop}
                    className="shop-button info-button"
                  >
                    Get Item Info
                  </button>
                  <button 
                    onClick={getShopItemsByGame} 
                    disabled={loading || !gameShop}
                    className="shop-button items-button"
                  >
                    Get Game Items
                  </button>
                </div>
              </div>
            </div>
            
            <div className="sdk-demo">
              <h3>SDK Features</h3>
              <p>This example demonstrates how the @somniagames/sdk abstracts blockchain interactions:</p>
              <ul>
                <li><code>new GameRegistry(address, provider, signer)</code> - Initialize contract</li>
                <li><code>gameRegistry.createGame(name, description, metadata)</code> - Create game</li>
                <li><code>gameRegistry.getGame(id)</code> - Get game info</li>
                <li><code>gameRegistry.updateGame(id, name, description)</code> - Update game</li>
                <li><code>gameRegistry.updateGameMetadata(id, uri)</code> - Update metadata</li>
                <li><code>gameRegistry.updateGameVersion(id, version)</code> - Update version</li>
                <li><code>gameRegistry.joinGame(id)</code> - Join game</li>
                <li><code>gameRegistry.leaveGame(id)</code> - Leave game</li>
                <li><code>gameRegistry.getGamePlayers(id)</code> - Get players</li>
                <li><code>gameRegistry.isPlayerInGame(id, address)</code> - Check membership</li>
                <li><code>gameRegistry.getGameCount()</code> - Get total games</li>
                <li><code>gameRegistry.getActiveGamesCount()</code> - Get active games count</li>
                <li><code>gameRegistry.getGamesByCreator(address)</code> - Get your games</li>
                <li><code>gameRegistry.getActiveGames(offset, limit)</code> - Get active games</li>
                <li><code>gameLeaderboard.submitScore(leaderboardId, score)</code> - Submit score</li>
                <li><code>gameShop.purchaseItem(itemId, quantity)</code> - Purchase item</li>
                <li><code>gameAsset.createAsset(...)</code> - Create asset</li>
              </ul>
              <div className="button-group">
                <button 
                  onClick={() => getGameInfo(selectedGameId)} 
                  disabled={!gameRegistry}
                  className="demo-button"
                >
                  Get Game Info
                </button>
                <button 
                  onClick={updateGameCount} 
                  disabled={!gameRegistry}
                  className="demo-button"
                >
                  Get Game Count
                </button>
                <button 
                  onClick={updateActiveGamesCount} 
                  disabled={!gameRegistry}
                  className="demo-button"
                >
                  Get Active Count
                </button>
                <button 
                  onClick={getGamesByCreator} 
                  disabled={!gameRegistry}
                  className="demo-button"
                >
                  Get My Games
                </button>
                <button 
                  onClick={getActiveGames} 
                  disabled={!gameRegistry}
                  className="demo-button"
                >
                  Get Active Games
                </button>
              </div>
              <div className="counts">
                {gameCount !== null && (
                  <p className="game-count">Total games: {gameCount}</p>
                )}
                {activeGamesCount !== null && (
                  <p className="active-count">Active games: {activeGamesCount}</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="tech-info">
          <h3>Powered by Somnia Network</h3>
          <p>This demo showcases how Somnia's 1.05M TPS and sub-second finality enable real-time blockchain gaming.</p>
          <p>The @somniagames/sdk abstracts all blockchain complexity, making it easy for developers to build games.</p>
        </div>
      </header>
    </div>
  )
}

export default App