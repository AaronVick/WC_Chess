import { NextResponse } from 'next/server';
import { Chess } from 'chess.js';
import { ChessEngine } from '../../../lib/chess-engine';
import { createGame, getGame, updateGame } from '../../../lib/game-state';

const BASE_URL = process.env.NEXT_PUBLIC_HOST;

// Generate move hints based on current position
function generateMoveHints(fen) {
  const chess = new Chess(fen);
  const legalMoves = chess.moves({ verbose: true });
  const sampleMoves = legalMoves.slice(0, 3).map(move => move.san);
  return sampleMoves.join(', ');
}

function generateInstructions(gameState) {
  const chess = new Chess(gameState.fen);
  const turn = chess.turn() === 'w' ? 'White' : 'Black';
  const moveHints = generateMoveHints(gameState.fen);
  
  if (gameState.status === 'active') {
    return `${turn} to move. Example moves: ${moveHints}`;
  } else if (gameState.status === 'checkmate') {
    return 'Game Over - Checkmate! Start a new game.';
  } else if (gameState.status === 'draw') {
    return 'Game Over - Draw! Start a new game.';
  } else if (gameState.status === 'stalemate') {
    return 'Game Over - Stalemate! Start a new game.';
  }
  return 'Start a new game or make your move!';
}

function getImageUrl(gameState, instructions = '') {
  const imageUrl = new URL('/api/image', BASE_URL);
  imageUrl.searchParams.set('fen', gameState.fen);
  if (gameState.lastMove) {
    imageUrl.searchParams.set('lastMove', gameState.lastMove);
  }
  if (instructions) {
    imageUrl.searchParams.set('instructions', encodeURIComponent(instructions));
  }
  return imageUrl.toString();
}

// GET: Initial frame load
export async function GET(req) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const gameId = searchParams.get('gameId');
    
    let gameState;
    if (gameId) {
      gameState = await getGame(gameId);
    }
    
    if (!gameState) {
      gameState = await createGame();
    }

    const instructions = generateInstructions(gameState);
    const imageUrl = getImageUrl(gameState, instructions);

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Chess Frame Game</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${imageUrl}" />
          <meta property="fc:frame:image:aspect_ratio" content="1:1" />
          <meta property="fc:frame:button:1" content="Make Move" />
          <meta property="fc:frame:button:2" content="New Game" />
          <meta property="fc:frame:button:3" content="Show Legal Moves" />
          <meta property="fc:frame:input:text" content="Type a move (e.g., e4, Nf3)" />
          <meta property="og:title" content="Chess Frame Game" />
          <meta property="og:description" content="Play chess against an AI opponent on Farcaster" />
          <meta property="og:image" content="${imageUrl}" />
        </head>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error) {
    console.error('Frame error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}

// POST: Handle frame interactions
export async function POST(req) {
  try {
    const data = await req.json();
    const { untrustedData } = data;
    
    if (!untrustedData) {
      throw new Error('Invalid frame data');
    }

    const { buttonIndex, inputText, state } = untrustedData;
    let gameState;

    // Handle New Game
    if (buttonIndex === 2) {
      gameState = await createGame();
      const instructions = 'New game started! White to move.';
      return new NextResponse(
        JSON.stringify({
          frames: [{
            version: 'vNext',
            image: getImageUrl(gameState, instructions),
            buttons: [
              { text: 'Make Move' },
              { text: 'New Game' },
              { text: 'Show Legal Moves' }
            ],
            inputText: 'Enter a move like "e4" or "Nf3"',
            state: { gameId: gameState.id }
          }]
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle Show Legal Moves
    if (buttonIndex === 3) {
      gameState = await getGame(state?.gameId) || await createGame();
      const chess = new Chess(gameState.fen);
      const legalMoves = chess.moves({ verbose: true }).slice(0, 5);
      const moveDisplay = legalMoves.map(m => `${m.piece.toUpperCase()}${m.from}-${m.to}`).join(', ');
      
      return new NextResponse(
        JSON.stringify({
          frames: [{
            version: 'vNext',
            image: getImageUrl(gameState, `Legal moves: ${moveDisplay}`),
            buttons: [
              { text: 'Make Move' },
              { text: 'New Game' },
              { text: 'Show Legal Moves' }
            ],
            inputText: 'Choose one of the shown legal moves',
            state: { gameId: gameState.id }
          }]
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle Make Move
    if (buttonIndex === 1) {
      gameState = await getGame(state?.gameId) || await createGame();
      const chess = new Chess(gameState.fen);

      if (!inputText) {
        return new NextResponse(
          JSON.stringify({
            frames: [{
              version: 'vNext',
              image: getImageUrl(gameState, 'Please enter a move first!'),
              buttons: [
                { text: 'Make Move' },
                { text: 'New Game' },
                { text: 'Show Legal Moves' }
              ],
              inputText: 'Type a move (e.g., "e4" or "Nf3")',
              state: { gameId: gameState.id }
            }]
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }

      try {
        // Make player's move
        const playerMove = chess.move(inputText, { sloppy: true });
        
        // Make computer's move if the game isn't over
        if (!chess.isGameOver()) {
          const engine = new ChessEngine(chess.fen());
          const computerMove = engine.getBestMove();
          
          if (computerMove) {
            chess.move(computerMove);
          }
        }

        // Update game state
        gameState = await updateGame(gameState.id, {
          fen: chess.fen(),
          lastMove: playerMove.san,
          status: chess.isGameOver() ? 
            (chess.isCheckmate() ? 'checkmate' : chess.isDraw() ? 'draw' : 'stalemate') : 
            'active'
        });

        const instructions = generateInstructions(gameState);

        return new NextResponse(
          JSON.stringify({
            frames: [{
              version: 'vNext',
              image: getImageUrl(gameState, instructions),
              buttons: [
                { text: 'Make Move' },
                { text: 'New Game' },
                { text: 'Show Legal Moves' }
              ],
              inputText: 'Your turn! Enter your next move',
              state: { 
                gameId: gameState.id,
                status: gameState.status
              }
            }]
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );

      } catch (moveError) {
        const moveHints = generateMoveHints(gameState.fen);
        return new NextResponse(
          JSON.stringify({
            frames: [{
              version: 'vNext',
              image: getImageUrl(gameState, `Invalid move! Try: ${moveHints}`),
              buttons: [
                { text: 'Make Move' },
                { text: 'New Game' },
                { text: 'Show Legal Moves' }
              ],
              inputText: 'Invalid move. Try a legal move.',
              state: { gameId: gameState.id, error: 'Invalid move' }
            }]
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    throw new Error('Invalid button index');

  } catch (error) {
    console.error('Frame error:', error);
    return new NextResponse(
      JSON.stringify({
        frames: [{
          version: 'vNext',
          image: `${BASE_URL}/api/image?error=internal&instructions=Something went wrong. Try again.`,
          buttons: [
            { text: 'Try Again' },
            { text: 'New Game' },
            { text: 'Show Legal Moves' }
          ],
          inputText: 'Start a new game or try your move again',
          state: { error: 'Internal server error' }
        }]
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
}