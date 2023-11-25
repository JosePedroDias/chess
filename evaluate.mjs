import { WHITE, EMPTY } from './board.mjs';
import { getMoves } from './moves.mjs';
import { isBlackPiece, isWhitePiece } from "./pieces.mjs";

const values = {
    'q': 9,
    'r': 5,
    'b': 3,
    'n': 3,
    'p': 1,
};

export function material(board, isWhite) {
    let mat = 0;
    board.iterateCells((_, piece) => {
        let v = values[piece.toLowerCase()] || 0;
        if (v) {
            const sign = (isWhitePiece(piece) === isWhite) ? 1 : -1;
            mat += sign * v;
        }
    });
    return mat;
}

export function validMoves(board) {
    const side = board._params.next;
    const isOk = side === WHITE ? (p) => !isWhitePiece(p) : (p) => !isBlackPiece(p);
    const moves = [];
    board.iteratePiecesOfSide(side, (pos, piece) => {
        //console.log(`pos: ${pos}, piece: ${piece}`);
        const pieceMoves = getMoves(board, piece, pos);
        for (let directionArr of pieceMoves) {
            dirLoop: for (let pos2 of directionArr) {
                const piece2 = board.get(pos2);
                if (isOk(piece2)) {
                    moves.push({
                        from: { pos, piece },
                        to: { pos: pos2, piece: piece2 },
                    });
                    if (piece2 === EMPTY) break dirLoop;
                } else {
                    break dirLoop;
                }
            }
        }
    });
    return moves;
}

// TODO use AbortController
export function electNextMove(board) {
    return new Promise((resolve, reject) => {
        const move = (board._params.next === WHITE) ? 'b2b3' : 'b7b6';
        resolve(move);
    });
}
