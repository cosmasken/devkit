import React, { useState, useEffect, useRef } from 'react';
import { SomniaGameKit } from '../../dist/esm/index.js';

const TicTacToe = () => {
  const sdkRef = useRef(null);
  const [isSDKInitialized, setIsSDKInitialized] = useState(false);
  const [player, setPlayer] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [status, setStatus] = useState('Choose your wallet to start playing');
  const [winner, setWinner] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [mintingProgress, setMintingProgress] = useState('');
  const [hasPlayerNFT, setHasPlayerNFT] = useState(false);
  const [hasVictoryNFT, setHasVictoryNFT] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isComputerTurn, setIsComputerTurn] = useState(false);
  const [gameMode, setGameMode] = useState('computer'); // 'computer' or 'human'

  // Initialize SDK only once
  useEffect(() => {
    if (!sdkRef.current) {
      sdkRef.current = new SomniaGameKit();
    }
    return () => {
      if (sdkRef.current && typeof sdkRef.current.cleanup === 'function') {
        sdkRef.current.cleanup();
      }
    };
  }, []);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  // Simple AI: Try to win, block player, or pick random
  const getComputerMove = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    // Try to win
    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] === 'O' && squares[b] === 'O' && !squares[c]) return c;
      if (squares[a] === 'O' && squares[c] === 'O' && !squares[b]) return b;
      if (squares[b] === 'O' && squares[c] === 'O' && !squares[a]) return a;
    }

    // Block player from winning
    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] === 'X' && squares[b] === 'X' && !squares[c]) return c;
      if (squares[a] === 'X' && squares[c] === 'X' && !squares[b]) return b;
      if (squares[b] === 'X' && squares[c] === 'X' && !squares[a]) return a;
    }

    // Take center if available
    if (!squares[4]) return 4;

    // Take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => !squares[i]);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    // Take any available space
    const available = squares.map((square, i) => square ? null : i).filter(val => val !== null);
    return available[Math.floor(Math.random() * available.length)];
  };

  const connectWithMetaMask = async () => {
    setIsConnecting(true);
    setShowWalletOptions(false);
    try {
      if (!isSDKInitialized) {
        setStatus('Initializing SDK...');
        await sdkRef.current.initialize({ network: 'somnia-testnet' });
        setIsSDKInitialized(true);
      }
      
      setStatus('Requesting MetaMask connection...');
      // Check if MetaMask is available
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not detected. Please install MetaMask.');
      }
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }
      
      setStatus('Connecting to Somnia Network...');
      const address = await sdkRef.current.connectWallet(accounts[0]);
      setWalletAddress(address);
      
      setStatus('Creating player profile...');
      const newPlayer = sdkRef.current.createPlayer({ 
        username: 'Player', 
        avatar: 'https://example.com/avatar.png' 
      });
      setPlayer(newPlayer);
      
      setStatus(`✅ Connected! ${address.slice(0,8)}... - Ready to play!`);
    } catch (error) {
      setStatus(`❌ Connection failed: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const connectWithWalletConnect = async () => {
    setIsConnecting(true);
    setShowWalletOptions(false);
    try {
      setStatus('WalletConnect not implemented yet. Please use MetaMask.');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus('Choose your wallet to start playing');
      setShowWalletOptions(true);
    } catch (error) {
      setStatus(`Connection failed: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const startGame = async () => {
    if (!player) return;
    
    setIsStartingGame(true);
    try {
      setStatus('🚀 Deploying game contract on Somnia...');
      const game = await sdkRef.current.deployGame(1);
      console.log('Game deployed:', game);
      setGameId(game.id);
      
      setStatus('🎮 Creating computer opponent...');
      // Create computer player for AI mode
      const computerPlayer = sdkRef.current.createPlayer({ 
        username: 'Computer', 
        avatar: 'https://example.com/robot.png' 
      });
      
      setStatus('🎮 Starting game session...');
      await sdkRef.current.startGame(game.id, [player.id, computerPlayer.id]);
      
      setStatus('✅ Game ready! You are X, Computer is O. Click a square!');
      setBoard(Array(9).fill(null));
      setIsXNext(true);
      setWinner(null);
      setIsComputerTurn(false);
    } catch (error) {
      console.error('Game start error:', error);
      if (error.message?.includes('circuit breaker')) {
        setStatus('❌ Network congestion. Please try again in a moment.');
      } else if (error.message?.includes('User denied')) {
        setStatus('❌ Transaction cancelled by user');
      } else if (error.message?.includes('insufficient funds')) {
        setStatus('❌ Insufficient funds for gas fees');
      } else {
        setStatus(`❌ Game start failed: ${error.message}`);
      }
    } finally {
      setIsStartingGame(false);
    }
  };

  const makeMove = async (index) => {
    if (!player || !gameId || board[index] || winner || isComputerTurn) return;

    const newBoard = [...board];
    newBoard[index] = 'X'; // Player is always X
    setBoard(newBoard);

    try {
      setStatus('📝 Recording your move on blockchain...');
      await sdkRef.current.makeMove(gameId, player.id, {
        position: index,
        symbol: 'X',
        board: newBoard,
        turn: 'player'
      });

      const gameWinner = calculateWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner);
        const winnerText = gameWinner === 'X' ? 'You win!' : 'Computer wins!';
        setStatus(`🎉 ${winnerText} Click "Mint Victory NFT" to claim your prize!`);
        await sdkRef.current.endGame(gameId, { winner: gameWinner, board: newBoard });
        return;
      } 
      
      if (newBoard.every(square => square)) {
        setStatus("🤝 It's a draw! Game recorded on blockchain");
        await sdkRef.current.endGame(gameId, { winner: 'draw', board: newBoard });
        return;
      }

      // Computer's turn
      setIsComputerTurn(true);
      setStatus('🤖 Computer is thinking...');
      
      // Delay for better UX
      setTimeout(() => {
        makeComputerMove(newBoard);
      }, 1500);

    } catch (error) {
      console.error('Move error:', error);
      setStatus(`❌ Move failed: ${error.message}`);
    }
  };

  const makeComputerMove = async (currentBoard) => {
    const computerMoveIndex = getComputerMove(currentBoard);
    if (computerMoveIndex === undefined) return;

    const newBoard = [...currentBoard];
    newBoard[computerMoveIndex] = 'O';
    setBoard(newBoard);

    try {
      setStatus('📝 Recording computer move on blockchain...');
      await sdkRef.current.makeMove(gameId, player.id, {
        position: computerMoveIndex,
        symbol: 'O',
        board: newBoard,
        turn: 'computer'
      });

      const gameWinner = calculateWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner);
        const winnerText = gameWinner === 'X' ? 'You win!' : 'Computer wins!';
        setStatus(`🎉 ${winnerText} ${gameWinner === 'X' ? 'Click "Mint Victory NFT"!' : ''}`);
        await sdkRef.current.endGame(gameId, { winner: gameWinner, board: newBoard });
      } else if (newBoard.every(square => square)) {
        setStatus("🤝 It's a draw! Game recorded on blockchain");
        await sdkRef.current.endGame(gameId, { winner: 'draw', board: newBoard });
      } else {
        setStatus('✅ Your turn! Click a square to make your move');
      }
    } catch (error) {
      console.error('Computer move error:', error);
      setStatus(`❌ Computer move failed: ${error.message}`);
    } finally {
      setIsComputerTurn(false);
    }
  };

  const mintVictoryNFT = async () => {
    if (!winner || !player || isMinting || hasVictoryNFT || winner !== 'X') return;
    
    setIsMinting(true);
    try {
      setMintingProgress('🎨 Preparing NFT metadata...');
      setStatus('🏆 Minting your victory NFT...');
      
      // Ensure NFT contract is deployed
      setMintingProgress('📝 Deploying NFT contract if needed...');
      await sdkRef.current.deployNFTContract();
      
      setMintingProgress('📝 Creating smart contract transaction...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMintingProgress('⛏️ Mining transaction on Somnia Network...');
      const nft = await sdkRef.current.mintNFT(player.id, {
        name: `Tic-Tac-Toe Victory vs Computer`,
        description: `Defeated AI opponent on ${new Date().toLocaleDateString()}`,
        image: 'https://example.com/trophy.png'
      });
      
      setMintingProgress('✅ NFT minted successfully!');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const tokenId = nft.tokenId || Math.floor(Math.random() * 10000);
      const nftWithId = { ...nft, tokenId };
      
      setNfts(prev => [...prev, nftWithId]);
      setHasVictoryNFT(true);
      setStatus(`🎉 Victory NFT minted! Ready for next game!`);
      setMintingProgress('');
      
      // Reset game state for new game
      setTimeout(() => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setWinner(null);
        setHasVictoryNFT(false);
        setGameId(null);
        setIsComputerTurn(false);
        setStatus('✅ Ready to play! Click "Start New Game"');
      }, 2000);
      
    } catch (error) {
      console.error('Victory NFT mint error:', error);
      if (error.message?.includes('User denied')) {
        setStatus('❌ Transaction cancelled by user');
      } else if (error.message?.includes('insufficient funds')) {
        setStatus('❌ Insufficient funds for gas fees');
      } else {
        setStatus(`❌ NFT mint failed: ${error.message}`);
      }
      setMintingProgress('');
    } finally {
      setIsMinting(false);
    }
  };

  const mintCollectibleNFT = async () => {
    if (!player || isMinting || hasPlayerNFT) return;
    
    setIsMinting(true);
    try {
      setMintingProgress('🎨 Preparing player badge NFT...');
      setStatus('🎨 Minting your player NFT...');
      
      setMintingProgress('📝 Creating smart contract transaction...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMintingProgress('⛏️ Mining transaction on Somnia Network...');
      
      // Try to deploy NFT contract first, but continue if it fails
      try {
        await sdkRef.current.deployNFTContract();
      } catch (deployError) {
        console.warn('NFT contract deployment failed, trying to mint anyway:', deployError);
      }
      
      const nft = await sdkRef.current.mintNFT(player.id, {
        name: 'Tic-Tac-Toe Player',
        description: 'Played tic-tac-toe on Somnia Network',
        image: 'https://example.com/player-badge.png'
      });
      
      setMintingProgress('✅ NFT minted successfully!');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const tokenId = nft.tokenId || Math.floor(Math.random() * 10000);
      const nftWithId = { ...nft, tokenId };
      
      setNfts(prev => [...prev, nftWithId]);
      setHasPlayerNFT(true);
      setStatus(`✅ Player NFT minted! Token ID: ${tokenId}`);
      setMintingProgress('');
    } catch (error) {
      console.error('Player NFT mint error:', error);
      if (error.message?.includes('circuit breaker')) {
        setStatus('❌ Network congestion. Please try again in a moment.');
      } else if (error.message?.includes('User denied')) {
        setStatus('❌ Transaction cancelled by user');
      } else if (error.message?.includes('insufficient funds')) {
        setStatus('❌ Insufficient funds for gas fees');
      } else {
        setStatus(`❌ NFT mint failed: ${error.message}`);
      }
      setMintingProgress('');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎮 Tic-Tac-Toe on Somnia</h1>
      <p>Blockchain-powered tic-tac-toe with NFT rewards!</p>
      
      <div style={{ 
        background: '#f0f0f0', 
        padding: '10px', 
        borderRadius: '5px', 
        margin: '20px 0' 
      }}>
        {status}
      </div>

      {mintingProgress && (
        <div style={{ 
          background: '#e7f3ff', 
          border: '1px solid #b3d9ff',
          padding: '10px', 
          borderRadius: '5px', 
          margin: '10px 0',
          fontSize: '14px'
        }}>
          {mintingProgress}
        </div>
      )}
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setShowHelpModal(true)}
          style={{ 
            padding: '8px 16px', 
            fontSize: '14px', 
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          ❓ How to Play
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        {!walletAddress ? (
          <>
            {!showWalletOptions ? (
              <button 
                onClick={() => setShowWalletOptions(true)}
                disabled={isConnecting}
                style={{ 
                  padding: '12px 24px', 
                  fontSize: '16px', 
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                🔗 Connect Wallet
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  onClick={connectWithMetaMask}
                  disabled={isConnecting}
                  style={{ 
                    padding: '12px 20px', 
                    fontSize: '14px', 
                    backgroundColor: isConnecting ? '#6c757d' : '#f6851b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  🦊 {isConnecting ? 'Connecting...' : 'MetaMask'}
                </button>
                
                <button 
                  onClick={connectWithWalletConnect}
                  disabled={isConnecting}
                  style={{ 
                    padding: '12px 20px', 
                    fontSize: '14px', 
                    backgroundColor: isConnecting ? '#6c757d' : '#3b99fc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  🔗 WalletConnect
                </button>
                
                <button 
                  onClick={() => setShowWalletOptions(false)}
                  style={{ 
                    padding: '12px 20px', 
                    fontSize: '14px', 
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <button 
              onClick={startGame}
              disabled={!player || isStartingGame}
              style={{ 
                padding: '10px 20px', 
                fontSize: '16px', 
                marginRight: '10px',
                cursor: (!player || isStartingGame) ? 'not-allowed' : 'pointer',
                opacity: (!player || isStartingGame) ? 0.5 : 1
              }}
            >
              {isStartingGame ? '🔄 Starting...' : '🎯 Start New Game'}
            </button>
            
            <button 
              onClick={mintCollectibleNFT}
              disabled={!player || isMinting || hasPlayerNFT}
              style={{ 
                padding: '10px 20px', 
                fontSize: '16px',
                backgroundColor: hasPlayerNFT ? '#6c757d' : (isMinting ? '#6c757d' : '#28a745'),
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: (!player || isMinting || hasPlayerNFT) ? 'not-allowed' : 'pointer',
                opacity: (!player || isMinting || hasPlayerNFT) ? 0.5 : 1,
                marginRight: '10px'
              }}
            >
              {hasPlayerNFT ? '✅ Player NFT Owned' : (isMinting ? '🔄 Minting...' : '🎨 Mint Player NFT')}
            </button>

            {winner === 'X' && !hasVictoryNFT && (
              <button 
                onClick={mintVictoryNFT}
                disabled={isMinting}
                style={{ 
                  padding: '10px 20px', 
                  fontSize: '16px',
                  backgroundColor: isMinting ? '#6c757d' : '#ffc107',
                  color: 'black',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isMinting ? 'not-allowed' : 'pointer',
                  opacity: isMinting ? 0.7 : 1
                }}
              >
                {isMinting ? '🔄 Minting...' : '🏆 Mint Victory NFT'}
              </button>
            )}
          </>
        )}
      </div>

      {walletAddress && (
        <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
          Wallet: {walletAddress.slice(0,8)}...{walletAddress.slice(-6)} | NFTs: {nfts.length}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 100px)',
        gap: '5px',
        justifyContent: 'center',
        margin: '20px auto'
      }}>
        {board.map((square, index) => (
          <button
            key={index}
            onClick={() => makeMove(index)}
            style={{
              width: '100px',
              height: '100px',
              fontSize: '24px',
              fontWeight: 'bold',
              cursor: square || winner || !gameId || isComputerTurn ? 'not-allowed' : 'pointer',
              background: square ? (square === 'X' ? '#e6f3ff' : '#ffe6e6') : '#fff',
              border: '2px solid #333',
              borderRadius: '5px',
              color: square === 'X' ? '#0066cc' : '#cc0000'
            }}
            disabled={square || winner || !gameId || isComputerTurn}
          >
            {square}
          </button>
        ))}
      </div>

      {winner && (
        <div style={{
          background: winner === 'X' ? '#d4edda' : '#f8d7da',
          border: `1px solid ${winner === 'X' ? '#c3e6cb' : '#f5c6cb'}`,
          padding: '15px',
          borderRadius: '5px',
          margin: '20px 0'
        }}>
          <h3>{winner === 'X' ? '🎉 You Win!' : '🤖 Computer Wins!'}</h3>
          <p>{winner === 'X' ? "Congratulations! Don't forget to mint your victory NFT!" : "Better luck next time! Try again?"}</p>
        </div>
      )}

      {nfts.length > 0 && (
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          padding: '15px',
          borderRadius: '5px',
          margin: '20px 0'
        }}>
          <h3>🎨 Your NFTs ({nfts.length})</h3>
          {nfts.map((nft, index) => (
            <div key={index} style={{ margin: '5px 0', fontSize: '14px' }}>
              {nft.name} - Token ID: {nft.tokenId}
            </div>
          ))}
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '500px',
            margin: '20px'
          }}>
            <h2>🎮 How to Play Blockchain Tic-Tac-Toe</h2>
            
            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
              <h3>🔗 Getting Started</h3>
              <p>1. <strong>Connect Wallet:</strong> Click "Connect Wallet" and choose MetaMask</p>
              <p>2. <strong>Start Game:</strong> Click "Start New Game" to deploy your game contract</p>
              <p>3. <strong>Play:</strong> Click squares to make moves (X goes first)</p>
              
              <h3>🎨 NFT Rewards</h3>
              <p>• <strong>Player NFT:</strong> Mint once to get your player badge</p>
              <p>• <strong>Victory NFT:</strong> Mint after winning to claim your trophy</p>
              
              <h3>⛓️ Blockchain Features</h3>
              <p>• Each move is recorded on Somnia Network</p>
              <p>• NFTs are real blockchain assets you own</p>
              <p>• Game contracts are deployed for each session</p>
              
              <h3>💡 Tips</h3>
              <p>• You need Somnia testnet tokens for transactions</p>
              <p>• Each NFT can only be minted once per game</p>
              <p>• Game resets automatically after minting victory NFT</p>
            </div>
            
            <button 
              onClick={() => setShowHelpModal(false)}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Got it! 👍
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicTacToe;
