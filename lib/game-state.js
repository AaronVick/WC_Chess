import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';
import { Chess } from 'chess.js';

export async function createGame() {
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

  await kv.set(`game:${id}`, gameState);
  return gameState;
}

export async function getGame(id) {
  return await kv.get(`game:${id}`);
}

export async function updateGame(id, updates) {
  const game = await getGame(id);
  if (!game) throw new Error('Game not found');

  const updatedGame = { ...game, ...updates, timestamp: Date.now() };
  await kv.set(`game:${id}`, updatedGame);
  return updatedGame;
}