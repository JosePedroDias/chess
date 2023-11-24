import { WHITE } from './board.mjs';
import { getMoves } from './moves.mjs';
import { isWhitePiece } from "./pieces.mjs";

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
    const moves = [];
    board.iteratePiecesOfSide(side, (pos, piece) => {
        console.log(`pos: ${pos}, piece: ${piece}`);
        const pieceMoves = getMoves(side, piece, pos);
        console.log(pieceMoves);
        // TODO: rook, queen, bishop must move
        //console.log(pos, piece);
        // TODO
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
