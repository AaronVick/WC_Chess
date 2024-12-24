import { Chess } from 'chess.js';

const PIECE_VALUES = {
  p: 1,  // pawn
  n: 3,  // knight
  b: 3,  // bishop
  r: 5,  // rook
  q: 9,  // queen
  k: 0   // king (value not used in evaluation)
};

export class ChessEngine {
  constructor(fen, maxDepth = 3) {
    this.chess = new Chess(fen);
    this.maxDepth = maxDepth;
  }

  evaluatePosition() {
    let score = 0;
    const board = this.chess.board();

    // Material evaluation
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          const value = PIECE_VALUES[piece.type.toLowerCase()] * (piece.color === 'w' ? 1 : -1);
          score += value;
        }
      }
    }

    // Position evaluation (center control)
    const center = [[3,3], [3,4], [4,3], [4,4]];
    for (const [row, col] of center) {
      const piece = board[row][col];
      if (piece) {
        score += 0.2 * (piece.color === 'w' ? 1 : -1);
      }
    }

    // Mobility evaluation (number of legal moves)
    const moves = this.chess.moves();
    score += moves.length * 0.1 * (this.chess.turn() === 'w' ? 1 : -1);

    return score;
  }

  minimax(depth, alpha, beta, isMaximizing) {
    if (depth === 0) {
      return {
        score: this.evaluatePosition(),
        move: ''
      };
    }

    const moves = this.chess.moves({ verbose: true });
    
    if (isMaximizing) {
      let bestScore = -Infinity;
      let bestMove = moves[0]?.san || '';

      for (const move of moves) {
        this.chess.move(move);
        const evaluation = this.minimax(depth - 1, alpha, beta, false);
        this.chess.undo();

        if (evaluation.score > bestScore) {
          bestScore = evaluation.score;
          bestMove = move.san;
        }
        alpha = Math.max(alpha, bestScore);
        if (beta <= alpha) break;
      }

      return { score: bestScore, move: bestMove };
    } else {
      let bestScore = Infinity;
      let bestMove = moves[0]?.san || '';

      for (const move of moves) {
        this.chess.move(move);
        const evaluation = this.minimax(depth - 1, alpha, beta, true);
        this.chess.undo();

        if (evaluation.score < bestScore) {
          bestScore = evaluation.score;
          bestMove = move.san;
        }
        beta = Math.min(beta, bestScore);
        if (beta <= alpha) break;
      }

      return { score: bestScore, move: bestMove };
    }
  }

  getBestMove() {
    const evaluation = this.minimax(this.maxDepth, -Infinity, Infinity, true);
    return evaluation.move;
  }
}