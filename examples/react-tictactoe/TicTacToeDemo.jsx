import React, { useState } from 'react';

const TicTacToeDemo = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [status, setStatus] = useState('Demo Mode - Click "Start Game" to begin');
  const [winner, setWinner] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

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

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const startGame = async () => {
    setStatus('Initializing SDK...');
    await delay(500);
    setStatus('Creating player...');
    await delay(500);
    setStatus('Deploying game contract...');
    await delay(1000);
    setStatus('Starting game session...');
    await delay(500);
    setStatus('Game ready! Make your move (X goes first)');
    
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setGameStarted(true);
  };

  const makeMove = async (index) => {
    if (!gameStarted || board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    setStatus('Recording move on blockchain...');
    await delay(800);

    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setStatus(`Winner: ${gameWinner}! 🎉 Minting victory NFT...`);
      await delay(1000);
      setStatus(`Winner: ${gameWinner}! Victory NFT minted! 🏆`);
    } else if (newBoard.every(square => square)) {
      setStatus("It's a draw! Game recorded on blockchain.");
    } else {
      setIsXNext(!isXNext);
      setStatus(`Next player: ${!isXNext ? 'X' : 'O'}`);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setGameStarted(false);
    setStatus('Demo Mode - Click "Start Game" to begin');
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎮 Tic-Tac-Toe on Somnia</h1>
      <p>Blockchain-powered tic-tac-toe with NFT rewards!</p>
      
      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        padding: '15px',
        borderRadius: '5px',
        margin: '20px 0'
      }}>
        <strong>Demo Mode:</strong> This simulates the blockchain game flow. 
        For real transactions, use the full SDK version.
      </div>
      
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
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Reset
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
              cursor: square || winner || !gameStarted ? 'not-allowed' : 'pointer',
              background: square ? '#e0e0e0' : '#fff',
              border: '2px solid #333',
              borderRadius: '5px'
            }}
            disabled={square || winner || !gameStarted}
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
          <p>Victory NFT minted to wallet!</p>
        </div>
      )}
    </div>
  );
};

export default TicTacToeDemo;
