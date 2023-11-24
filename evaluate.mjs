import { WHITE, isWhitePiece } from './board.mjs';

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
    //TODO
    return [];
}

// TODO use AbortController
export function electNextMove(board) {
    return new Promise((resolve, reject) => {
        const move = (board._params.next === WHITE) ? 'b2b3' : 'b7b6';
        resolve(move);
    });
}
