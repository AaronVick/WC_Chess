import { NextResponse } from 'next/server';
import { Chess } from 'chess.js';
import { ChessEngine } from '@/lib/chess-engine';
import { createGame, getGame, updateGame } from '@/lib/game-state';

const BASE_URL = process.env.NEXT_PUBLIC_HOST;

// Generate move hints based on current position
function generateMoveHints(fen) {
  const chess = new Chess(fen);
  const legalMoves = chess.moves({ verbose: true });
  // Get a few sample moves to show as examples
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

function generateFrameHtml({ gameState, errorMessage }) {
  const instructions = generateInstructions(gameState);
  const imageUrl = `${BASE_URL}/api/image?fen=${encodeURIComponent(gameState.fen)}${gameState.lastMove ? `&lastMove=${encodeURIComponent(gameState.lastMove)}` : ''}&instructions=${encodeURIComponent(instructions)}`;
  
  const inputHint = errorMessage ? 'Invalid move. Try again with a legal move.' :
    'Type a move like "e4" (pawn to e4) or "Nf3" (knight to f3)';

  return `<!DOCTYPE html>
    <html>
      <head>
        <title>Chess Frame Game</title>
        <meta property="og:title" content="Chess Frame Game" />
        <meta property="og:description" content="Play chess against an AI opponent on Farcaster" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${imageUrl}" />
        <meta property="fc:frame:image:aspect_ratio" content="1:1" />
        <meta property="fc:frame:input:text" content="${inputHint}" />
        <meta property="fc:frame:button:1" content="Make Move" />
        <meta property="fc:frame:button:2" content="New Game" />
        <meta property="fc:frame:button:3" content="Show Legal Moves" />
        ${errorMessage ? `<meta property="fc:frame:state" content="${encodeURIComponent(JSON.stringify({ error: errorMessage }))}" />` : ''}
      </head>
    </html>`;
}

// POST handler
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
      return new NextResponse(
        JSON.stringify({
          frames: [{
            version: 'vNext',
            image: `${BASE_URL}/api/image?fen=${encodeURIComponent(gameState.fen)}&instructions=New game started! White to move.`,
            buttons: [
              { text: 'Make Move' },
              { text: 'New Game' },
              { text: 'Show Legal Moves' }
            ],
            inputText: 'Enter a move like "e4" for pawn to e4',
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
            image: `${BASE_URL}/api/image?fen=${encodeURIComponent(gameState.fen)}&instructions=Legal moves: ${moveDisplay}`,
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
              image: `${BASE_URL}/api/image?fen=${encodeURIComponent(gameState.fen)}&instructions=Please enter a move first!`,
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
        chess.move(inputText, { sloppy: true });
        
        // Make computer's move
        const engine = new ChessEngine(chess.fen());
        const computerMove = engine.getBestMove();
        
        if (computerMove) {
          chess.move(computerMove);
        }

        // Update game state
        gameState = await updateGame(gameState.id, {
          fen: chess.fen(),
          lastMove: computerMove,
          status: chess.isGameOver() ? 
            (chess.isCheckmate() ? 'checkmate' : chess.isDraw() ? 'draw' : 'stalemate') : 
            'active'
        });

        const instructions = generateInstructions(gameState);

        return new NextResponse(
          JSON.stringify({
            frames: [{
              version: 'vNext',
              image: `${BASE_URL}/api/image?fen=${encodeURIComponent(gameState.fen)}&lastMove=${computerMove}&instructions=${encodeURIComponent(instructions)}`,
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
        return new NextResponse(
          JSON.stringify({
            frames: [{
              version: 'vNext',
              image: `${BASE_URL}/api/image?fen=${encodeURIComponent(gameState.fen)}&instructions=Invalid move! Try one of these: ${generateMoveHints(gameState.fen)}`,
              buttons: [
                { text: 'Make Move' },
                { text: 'New Game' },
                { text: 'Show Legal Moves' }
              ],
              inputText: 'Invalid move. Try again with a legal move.',
              state: { gameId: gameState.id, error: 'Invalid move' }
            }]
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

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