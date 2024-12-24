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
    const lastMove = searchParams.get('lastMove');
    const instructions = searchParams.get('instructions');

    const chess = new Chess();

    // Validate FEN string
    const validation = chess.validateFen(fen);
    if (!validation.valid) {
      throw new Error(`Invalid FEN string: ${validation.error}`);
    }

    chess.load(fen);
    const board = chess.board();

    const size = 1000;
    const squareSize = Math.floor(size * 0.8 / 8); // 80% of size for board
    const fontSize = Math.floor(squareSize * 0.7); // 70% of square size for pieces

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
            padding: '20px',
          }}
        >
          {/* Render Chess Board */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: '2px',
              padding: '10px',
              backgroundColor: '#404040',
              borderRadius: '12px',
              width: `${squareSize * 8 + 20}px`,
              height: `${squareSize * 8 + 20}px`,
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
                    fontFamily: 'serif',
                  }}
                >
                  {piece ? pieces[piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()] : ''}
                </div>
              );
            })}
          </div>

          {/* Render Instructions */}
          {instructions && (
            <div
              style={{
                marginTop: '20px',
                fontSize: '32px',
                textAlign: 'center',
                color: '#ffffff',
                maxWidth: '90%',
                wordWrap: 'break-word',
              }}
            >
              {decodeURIComponent(instructions)}
            </div>
          )}

          {/* Render Last Move */}
          {lastMove && (
            <div
              style={{
                marginTop: '10px',
                fontSize: '24px',
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
    console.error('Image generation error:', error);
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
        width: 1000,
        height: 1000,
        headers: {
          'content-type': 'image/png',
          'cache-control': 'no-store, must-revalidate',
          'access-control-allow-origin': '*',
        },
      }
    );
  }
}