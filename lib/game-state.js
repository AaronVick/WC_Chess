import { Chess } from 'chess.js';
import { nanoid } from 'nanoid';

// In-memory store for active games (note: this will reset on server restarts)
let gameStore = new Map();

// Clean up old games periodically (older than 1 hour)
function cleanupOldGames() {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const [id, game] of gameStore.entries()) {
    if (game.timestamp < oneHourAgo) {
      gameStore.delete(id);
    }
  }
}

export async function createGame() {
  cleanupOldGames();
  
  const chess = new Chess();
  const id = nanoid();
  const playerColor = Math.random() < 0.5 ? 'w' : 'b';
  
  const gameState = {
    id,
    fen: chess.fen(),
    lastMove: null,
    playerColor,
    status: 'active',
    timestamp: Date.now()
  };

  gameStore.set(id, gameState);
  return gameState;
}

export async function getGame(id) {
  cleanupOldGames();
  return gameStore.get(id) || null;
}

export async function updateGame(id, updates) {
  const game = await getGame(id);
  if (!game) {
    throw new Error('Game not found');
  }

  const updatedGame = { 
    ...game, 
    ...updates, 
    timestamp: Date.now() 
  };
  
  gameStore.set(id, updatedGame);
  return updatedGame;
}