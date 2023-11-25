import { WHITE } from './board.mjs';
import { isWhitePiece } from "./pieces.mjs";
// import { log } from './testUtils.mjs';

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

// TODO use AbortController
export function electNextMove(board) {
    return new Promise((resolve, reject) => {
        const move = (board._params.next === WHITE) ? 'b2b3' : 'b7b6';
        resolve(move);
    });
}
