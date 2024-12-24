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
    const fen = searchParams.get('fen') || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    console.log('Received FEN:', fen);

    const chess = new Chess();
    if (!chess.load(fen)) {
      throw new Error(`Invalid FEN string: ${fen}`);
    }

    const board = chess.board();
    const size = 500; // Optimized for Farcaster frame size
    const squareSize = Math.floor(size / 8);
    const fontSize = Math.floor(squareSize * 0.7);

    return new ImageResponse(
      (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: '#1a1a1a',
          }}
        >
          {board.flat().map((piece, i) => {
            const isDark = (Math.floor(i / 8) + (i % 8)) % 2 === 1;
            return (
              <div
                key={i}
                style={{
                  backgroundColor: isDark ? '#769656' : '#eeeed2',
                  width: `${squareSize}px`,
                  height: `${squareSize}px`,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: `${fontSize}px`,
                  color: isDark ? '#eeeed2' : '#769656',
                }}
              >
                {piece && pieces[piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()]}
              </div>
            );
          })}
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
    console.error('Error generating image:', error);
    return new Response(`Error generating image: ${error.message}`, { status: 500 });
  }
}

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
      console.log('Legal Moves:', moves);
      return new Response(JSON.stringify({ legalMoves: moves }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(null, { status: 400 });
  } catch (error) {
    console.error('Error handling POST request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}
