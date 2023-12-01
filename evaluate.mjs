import { isMoveStringCheck, moveToString, validMoves } from './moves.mjs';
import { isWhitePiece } from "./pieces.mjs";
import { randomFromArr } from './utils.mjs';

const values = {
    'q': 9,
    'r': 5,
    'b': 3,
    'n': 3,
    'p': 1,
};

export function material(board, isWhite) {
    let mat = 0;
    for (const [_, piece] of board) {
        let v = values[piece.toLowerCase()] || 0;
        if (v) {
            const sign = (isWhitePiece(piece) === isWhite) ? 1 : -1;
            mat += sign * v;
        }
    }
    return mat;
}

// TODO use AbortController
export function electNextMove(board, log) {
    return new Promise((resolve, reject) => {
        const moves = validMoves(board).map(moveToString);
        if (log) {
            for (const move of moves) {
                log(`info ${move}`);
            }
        }
        if (moves.length === 0) {
            reject( isMoveStringCheck(board.getLastMove()) ? 'check mate' : 'stale mate' );
            return;
        }

        const checkMoves = moves.filter(isMoveStringCheck);

        const chosenMove = checkMoves.length > 0 ? randomFromArr(checkMoves) : randomFromArr(moves);
        resolve(chosenMove);
    });
}
