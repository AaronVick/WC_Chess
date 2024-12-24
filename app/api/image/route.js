import { ImageResponse } from '@vercel/og';
import { Chess } from 'chess.js';

export const runtime = 'edge';

const pieces = {
  'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙',
  'K': '♚', 'Q': '♛', 'R': '♜', 'B': '♝', 'N': '♞', 'P': '♟'
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // Log incoming request URL and parameters
    console.log('Request URL:', req.url);

    // Use a default FEN string
    const fen = searchParams.get('fen') || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    console.log('FEN string:', fen);

    const lastMove = searchParams.get('lastMove');
    console.log('Last move:', lastMove);

    const instructions = searchParams.get('instructions');
    console.log('Instructions:', instructions);

    const chess = new Chess();

    // Attempt to load the FEN string, but default to the initial board if invalid
    if (!chess.load(fen)) {
      console.warn(`Invalid FEN string received: ${fen}. Falling back to default.`);
      chess.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    }

    const board = chess.board();
    console.log('Generated board:', board);

    const size = 500; // Reduced size for Farcaster frame
    const squareSize = Math.floor(size * 0.8 / 8);
    const fontSize = Math.floor(squareSize * 0.6);

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1a1a',
            padding: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap', // Wraps squares into rows
              gap: '1px',
              padding: '10px',
              backgroundColor: '#404040',
              borderRadius: '8px',
              width: `${squareSize * 8}px`, // Adjusted to match new board size
              height: `${squareSize * 8}px`, // Adjusted to match new board size
            }}
          >
            {board.flat().map((piece, i) => {
              const row = Math.floor(i / 8);
              const col = i % 8;
              const isBlackSquare = (row + col) % 2 === 1;

              return (
                <div
                  key={`${row}-${col}`}
                  style={{
                    backgroundColor: isBlackSquare ? '#B58863' : '#F0D9B5',
                    width: `${squareSize}px`,
                    height: `${squareSize}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000000',
                    fontSize: `${fontSize}px`,
                    fontFamily: 'Arial Unicode MS, sans-serif', // Updated font
                  }}
                >
                  {piece ? pieces[piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()] : ''}
                </div>
              );
            })}
          </div>

          {instructions && (
            <div
              style={{
                marginTop: '10px',
                fontSize: '18px',
                textAlign: 'center',
                color: '#ffffff',
                maxWidth: '90%',
                wordWrap: 'break-word',
              }}
            >
              {decodeURIComponent(instructions)}
            </div>
          )}

          {lastMove && (
            <div
              style={{
                marginTop: '5px',
                fontSize: '16px',
                color: '#858585',
              }}
            >
              Last move: {lastMove}
            </div>
          )}
        </div>
      ),
      {
        width: size,
        height: size,
        headers: {
          'content-type': 'image/png',
          'cache-control': 'no-store, must-revalidate',
          'access-control-allow-origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error generating chess board:', error);

    // Return an error image instead of a 403 or 500
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            fontSize: '24px',
            textAlign: 'center',
          }}
        >
          Error generating chess board: {error.message}
        </div>
      ),
      {
        width: 500,
        height: 500,
        headers: {
          'content-type': 'image/png',
          'cache-control': 'no-store, must-revalidate',
          'access-control-allow-origin': '*',
        },
      }
    );
  }
}

// New POST handler for legal moves
export async function POST(req) {
  try {
    const body = await req.json();
    const { fen, showLegalMoves } = body;

    const chess = new Chess();

    if (!chess.load(fen)) {
      throw new Error(`Invalid FEN: ${fen}`);
    }

    if (showLegalMoves) {
      const moves = chess.moves({ verbose: true });
      return new Response(JSON.stringify({ legalMoves: moves }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(null, { status: 400 });
  } catch (error) {
    console.error('Error handling request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}
