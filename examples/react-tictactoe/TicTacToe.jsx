import React, { useState, useEffect } from 'react';
import { SomniaGameKit } from '../../dist/esm/index.js';

const TicTacToe = () => {
  const [sdk] = useState(new SomniaGameKit());
  const [player, setPlayer] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [status, setStatus] = useState('Connect your wallet to start playing');
  const [winner, setWinner] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);

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

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      setStatus('Initializing SDK...');
      await sdk.initialize({ network: 'somnia-testnet' });
      
      setStatus('Connecting wallet...');
      const address = await sdk.connectWallet();
      setWalletAddress(address);
      
      setStatus('Creating player...');
      const newPlayer = sdk.createPlayer({ 
        username: 'Player', 
        avatar: 'https://example.com/avatar.png' 
      });
      setPlayer(newPlayer);
      
      setStatus(`Connected! ${address.slice(0,8)}... - Click "Start Game"`);
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
      setStatus('Deploying game contract...');
      const game = await sdk.deployGame(1);
      setGameId(game.id);
      
      setStatus('Starting game session...');
      await sdk.startGame(game.id, [player.id]);
      
      setStatus('Game ready! X goes first');
      setBoard(Array(9).fill(null));
      setIsXNext(true);
      setWinner(null);
    } catch (error) {
      setStatus(`Game start failed: ${error.message}`);
    } finally {
      setIsStartingGame(false);
    }
  };

  const makeMove = async (index) => {
    if (!player || !gameId || board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    try {
      setStatus('Recording move on blockchain...');
      await sdk.makeMove(gameId, player.id, {
        position: index,
        symbol: isXNext ? 'X' : 'O',
        board: newBoard
      });

      const gameWinner = calculateWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner);
        setStatus(`Winner: ${gameWinner}! 🎉 Click "Mint Victory NFT"`);
        await sdk.endGame(gameId, { winner: gameWinner, board: newBoard });
      } else if (newBoard.every(square => square)) {
        setStatus("It's a draw! Game recorded on blockchain");
        await sdk.endGame(gameId, { winner: 'draw', board: newBoard });
      } else {
        setIsXNext(!isXNext);
        setStatus(`Next player: ${!isXNext ? 'X' : 'O'}`);
      }
    } catch (error) {
      setStatus(`Move failed: ${error.message}`);
    }
  };

  const mintVictoryNFT = async () => {
    if (!winner || !player || isMinting) return;
    
    setIsMinting(true);
    try {
      setStatus('Minting victory NFT...');
      const nft = await sdk.mintNFT(player.id, {
        name: `Tic-Tac-Toe Victory (${winner})`,
        description: `Won as ${winner} on ${new Date().toLocaleDateString()}`,
        image: 'https://example.com/trophy.png'
      });
      
      // Generate token ID if not provided
      const tokenId = nft.tokenId || Math.floor(Math.random() * 10000);
      const nftWithId = { ...nft, tokenId };
      
      setNfts(prev => [...prev, nftWithId]);
      setStatus(`Victory NFT minted! Token ID: ${tokenId} 🏆`);
    } catch (error) {
      setStatus(`NFT mint failed: ${error.message}`);
    } finally {
      setIsMinting(false);
    }
  };

  const mintCollectibleNFT = async () => {
    if (!player || isMinting) return;
    
    setIsMinting(true);
    try {
      setStatus('Minting collectible NFT...');
      const nft = await sdk.mintNFT(player.id, {
        name: 'Tic-Tac-Toe Player',
        description: 'Played tic-tac-toe on Somnia Network',
        image: 'https://example.com/player-badge.png'
      });
      
      // Generate token ID if not provided
      const tokenId = nft.tokenId || Math.floor(Math.random() * 10000);
      const nftWithId = { ...nft, tokenId };
      
      setNfts(prev => [...prev, nftWithId]);
      setStatus(`Player NFT minted! Token ID: ${tokenId}`);
    } catch (error) {
      setStatus(`NFT mint failed: ${error.message}`);
    } finally {
      setIsMinting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (sdk && typeof sdk.cleanup === 'function') {
        sdk.cleanup();
      }
    };
  }, [sdk]);

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
      
      <div style={{ marginBottom: '20px' }}>
        {!walletAddress ? (
          <button 
            onClick={connectWallet}
            disabled={isConnecting}
            style={{ 
              padding: '12px 24px', 
              fontSize: '16px', 
              backgroundColor: isConnecting ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              opacity: isConnecting ? 0.7 : 1
            }}
          >
            {isConnecting ? '🔄 Connecting...' : '🔗 Connect Wallet'}
          </button>
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
              disabled={!player || isMinting}
              style={{ 
                padding: '10px 20px', 
                fontSize: '16px',
                backgroundColor: isMinting ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: (!player || isMinting) ? 'not-allowed' : 'pointer',
                opacity: (!player || isMinting) ? 0.5 : 1,
                marginRight: '10px'
              }}
            >
              {isMinting ? '🔄 Minting...' : '🎨 Mint Player NFT'}
            </button>

            {winner && (
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
              cursor: square || winner || !gameId ? 'not-allowed' : 'pointer',
              background: square ? '#e0e0e0' : '#fff',
              border: '2px solid #333',
              borderRadius: '5px'
            }}
            disabled={square || winner || !gameId}
          >
            {square}
          </button>
        ))}
      </div>

      {winner && (
        <div style={{
          background: '#d4edda',
          border: '1px solid #c3e6cb',
          padding: '15px',
          borderRadius: '5px',
          margin: '20px 0'
        }}>
          <h3>🏆 Game Over!</h3>
          <p>Winner: {winner}</p>
          <p>Don't forget to mint your victory NFT!</p>
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
    </div>
  );
};

export default TicTacToe;
