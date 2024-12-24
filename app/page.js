import React, { useState } from 'react';

export default function Page() {
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [legalMoves, setLegalMoves] = useState([]);

  async function makeMove(move) {
    try {
      const response = await fetch('/api/frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen, move }),
      });
      if (!response.ok) {
        throw new Error('Failed to make move');
      }
      const data = await response.json();
      setFen(data.fen);
    } catch (error) {
      console.error('Error making move:', error);
      alert('Invalid move. Please try again.');
    }
  }

  async function showLegalMoves() {
    try {
      const response = await fetch('/api/frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen, showLegalMoves: true }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch legal moves');
      }
      const data = await response.json();
      setLegalMoves(data.legalMoves);
      alert(`Legal Moves: ${data.legalMoves.map(move => move.san).join(', ')}`);
    } catch (error) {
      console.error('Error fetching legal moves:', error);
      alert('Could not retrieve legal moves.');
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-800 text-white">
      <h1 className="text-4xl font-bold mb-4">Chess Frame Game</h1>
      <p className="text-lg mb-8">Play chess directly on Farcaster!</p>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Enter move (e.g., e2e4)"
          className="p-2 border border-gray-500 rounded"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              makeMove(e.target.value);
              e.target.value = '';
            }
          }}
        />
      </div>

      <div className="flex space-x-4">
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          onClick={() => makeMove()}
        >
          Make Move
        </button>
        <button
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
          onClick={() => setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')}
        >
          New Game
        </button>
        <button
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded"
          onClick={() => showLegalMoves()}
        >
          Show Legal Moves
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl mb-4">Current FEN</h2>
        <p className="bg-gray-700 p-2 rounded break-words">{fen}</p>
      </div>

      {legalMoves.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl mb-4">Legal Moves</h2>
          <ul className="list-disc pl-4">
            {legalMoves.map((move, index) => (
              <li key={index}>{move.san}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
