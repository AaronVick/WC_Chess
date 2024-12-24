import { ImageResponse } from '@vercel/og';
import { Chess } from 'chess.js';

const pieces = {
  'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙',
  'K': '♚', 'Q': '♛', 'R': '♜', 'B': '♝', 'N': '♞', 'P': '♟'
};

export async function GET(req) {
  const searchParams = req.nextUrl.searchParams;
  const fen = searchParams.get('fen') || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const lastMove = searchParams.get('lastMove');
  
  const chess = new Chess(fen);
  const board = chess.board();

  // Parse last move to highlight squares
  let fromSquare = null;
  let toSquare = null;
  if (lastMove) {
    const move = chess.moves({ verbose: true }).find(m => m.san === lastMove);
    if (move) {
      fromSquare = move.from;
      toSquare = move.to;
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'white',
          width: '100%',
          height: '100%',
          padding: '20px',
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: '2px',
          width: '600px',
          height: '600px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '2px solid #444',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          {board.flat().map((piece, i) => {
            const row = Math.floor(i / 8);
            const col = i % 8;
            const square = `${String.fromCharCode(97 + col)}${8 - row}`;
            const isBlackSquare = (row + col) % 2 === 1;
            const isLastMoveSquare = square === fromSquare || square === toSquare;
            
            return (
              <div key={i} style={{
                backgroundColor: isLastMoveSquare 
                  ? '#FFEB3B' 
                  : (isBlackSquare ? '#B58863' : '#F0D9B5'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                position: 'relative',
                transition: 'background-color 0.3s',
              }}>
                {piece ? pieces[piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()] : ''}
                {(col === 0) && (
                  <div style={{
                    position: 'absolute',
                    left: '4px',
                    top: '4px',
                    fontSize: '14px',
                    color: isBlackSquare ? '#F0D9B5' : '#B58863',
                  }}>
                    {8 - row}
                  </div>
                )}
                {(row === 7) && (
                  <div style={{
                    position: 'absolute',
                    right: '4px',
                    bottom: '4px',
                    fontSize: '14px',
                    color: isBlackSquare ? '#F0D9B5' : '#B58863',
                  }}>
                    {String.fromCharCode(97 + col)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {lastMove && (
          <div style={{
            marginTop: '12px',
            fontSize: '24px',
            textAlign: 'center',
            color: '#444',
          }}>
            Last move: {lastMove}
          </div>
        )}
      </div>
    ),
    {
      width: 640,
      height: 700,
    },
  );
}