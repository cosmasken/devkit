import React, { useState, useEffect } from 'react';
import { SomniaGameKit } from '../../dist/index.js';

const TicTacToe = () => {
  const [sdk] = useState(new SomniaGameKit());
  const [player, setPlayer] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [status, setStatus] = useState('Click "Start Game" to begin');
  const [winner, setWinner] = useState(null);

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

  const startGame = async () => {
    try {
      setStatus('Initializing SDK...');
      await sdk.initialize({ network: 'somnia-testnet' });
      
      setStatus('Creating player...');
      const newPlayer = sdk.createPlayer({ 
        username: 'TicTacToePlayer', 
        avatar: 'https://example.com/avatar.png' 
      });
      setPlayer(newPlayer);
      
      setStatus('Deploying game...');
      const game = await sdk.deployGame(1);
      setGameId(game.id);
      
      setStatus('Starting game session...');
      await sdk.startGame(game.id, [newPlayer.id]);
      
      setStatus('Game ready! Make your move (X goes first)');
      setBoard(Array(9).fill(null));
      setIsXNext(true);
      setWinner(null);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const makeMove = async (index) => {
    if (!player || !gameId || board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    try {
      // Record move on blockchain
      await sdk.makeMove(gameId, player.id, {
        position: index,
        symbol: isXNext ? 'X' : 'O',
        board: newBoard
      });

      const gameWinner = calculateWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner);
        setStatus(`Winner: ${gameWinner}! 🎉`);
        
        // Mint winner NFT
        await sdk.mintNFT(player.id, {
          name: 'Tic-Tac-Toe Victory',
          description: `Won as ${gameWinner}`,
          image: 'https://example.com/trophy.png'
        });
        
        // End game session
        await sdk.endGame(gameId, { winner: gameWinner, board: newBoard });
      } else if (newBoard.every(square => square)) {
        setStatus("It's a draw!");
        await sdk.endGame(gameId, { winner: 'draw', board: newBoard });
      } else {
        setIsXNext(!isXNext);
        setStatus(`Next player: ${!isXNext ? 'X' : 'O'}`);
      }
    } catch (error) {
      setStatus(`Move error: ${error.message}`);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setStatus('Game reset! X goes first');
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
        <button 
          onClick={startGame}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px', 
            marginRight: '10px',
            cursor: 'pointer' 
          }}
        >
          Start New Game
        </button>
        <button 
          onClick={resetGame}
          disabled={!gameId}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px',
            cursor: gameId ? 'pointer' : 'not-allowed',
            opacity: gameId ? 1 : 0.5
          }}
        >
          Reset Board
        </button>
      </div>

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
              cursor: square || winner ? 'not-allowed' : 'pointer',
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
          <p>Victory NFT minted to your wallet!</p>
        </div>
      )}
    </div>
  );
};

export default TicTacToe;
