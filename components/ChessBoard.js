export function ChessBoard({ fen, lastMove, onMove }) {
    return (
      <div className="grid grid-cols-8 gap-0.5 bg-gray-800 p-1 rounded-lg">
        {fen.split(' ')[0].split('/').map((row, rowIndex) => {
          let colIndex = 0;
          const squares = [];
          
          for (const char of row) {
            if (isNaN(char)) {
              const pieceColor = char === char.toUpperCase() ? 'white' : 'black';
              const piece = char.toLowerCase();
              const squareColor = (rowIndex + colIndex) % 2 === 0 ? 'bg-[#F0D9B5]' : 'bg-[#B58863]';
              
              squares.push(
                <div 
                  key={`${rowIndex}-${colIndex}`}
                  className={`aspect-square ${squareColor} flex items-center justify-center`}
                >
                  <div className={`chess-piece text-4xl ${
                    lastMove?.includes(`${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`) 
                      ? 'chess-piece-move' 
                      : ''
                  }`}>
                    {getPieceSymbol(piece, pieceColor)}
                  </div>
                </div>
              );
              colIndex++;
            } else {
              const emptySquares = parseInt(char);
              for (let i = 0; i < emptySquares; i++) {
                const squareColor = (rowIndex + colIndex) % 2 === 0 ? 'bg-[#F0D9B5]' : 'bg-[#B58863]';
                squares.push(
                  <div 
                    key={`${rowIndex}-${colIndex}`}
                    className={`aspect-square ${squareColor}`}
                  />
                );
                colIndex++;
              }
            }
          }
          return squares;
        })}
      </div>
    );
  }
  
  function getPieceSymbol(piece, color) {
    const pieces = {
      'p': color === 'white' ? '♙' : '♟',
      'n': color === 'white' ? '♘' : '♞',
      'b': color === 'white' ? '♗' : '♝',
      'r': color === 'white' ? '♖' : '♜',
      'q': color === 'white' ? '♕' : '♛',
      'k': color === 'white' ? '♔' : '♚'
    };
    return pieces[piece];
  }