import { ImageResponse } from '@vercel/og';
import { Chess } from 'chess.js';
import { NextResponse } from 'next/server';

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
    
    const chess = new Chess(fen);
    const board = chess.board();

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            width: '100%',
            height: '100%',
            padding: '20px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: '1px',
              backgroundColor: '#444',
              padding: '8px',
              borderRadius: '8px',
              width: '500px',
              height: '500px',
            }}
          >
            {board.flat().map((piece, i) => {
              const row = Math.floor(i / 8);
              const col = i % 8;
              const square = `${String.fromCharCode(97 + col)}${8 - row}`;
              const isBlackSquare = (row + col) % 2 === 1;
              const isLastMoveSquare = lastMove && square === lastMove;
              
              return (
                <div
                  key={i}
                  style={{
                    backgroundColor: isLastMoveSquare ? '#FFEB3B' : 
                      (isBlackSquare ? '#B58863' : '#F0D9B5'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  {piece ? pieces[piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()] : ''}
                  {col === 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '4px',
                        top: '4px',
                        fontSize: '12px',
                        color: isBlackSquare ? '#F0D9B5' : '#B58863',
                      }}
                    >
                      {8 - row}
                    </div>
                  )}
                  {row === 7 && (
                    <div
                      style={{
                        position: 'absolute',
                        right: '4px',
                        bottom: '4px',
                        fontSize: '12px',
                        color: isBlackSquare ? '#F0D9B5' : '#B58863',
                      }}
                    >
                      {String.fromCharCode(97 + col)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {instructions && (
            <div
              style={{
                marginTop: '20px',
                fontSize: '24px',
                textAlign: 'center',
                color: '#444',
                maxWidth: '480px',
                wordWrap: 'break-word'
              }}
            >
              {decodeURIComponent(instructions)}
            </div>
          )}
        </div>
      ),
      {
        width: 600,
        height: 700,
        headers: {
          'content-type': 'image/png',
          'cache-control': 'public, max-age=0, must-revalidate',
          'access-control-allow-origin': '*'
        }
      }
    );
  } catch (error) {
    console.error('Image generation error:', error);
    return new NextResponse('Error generating image', { status: 500 });
  }
}