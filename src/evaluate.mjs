import { isWhitePiece } from './pieces.mjs';
import { randomFromArr, weightedRandom } from './utils.mjs';
import { validMoves, isMoveCapture, isChecking } from './move.mjs';

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

const promotionProbWeights = [
    ['q', 90],
    ['r', 40],
    ['b', 20],
    ['n', 10],
];

export async function play(board) {
    const isWhite = board.isWhiteNext();
    const moves = validMoves(board);

    const promotionMoves = moves.filter((mv) => mv[4]);
    const checkMoves = moves.filter((mv) => isChecking(board.applyMove(mv), isWhite));
    const captureMoves = moves.filter((mv) => isMoveCapture(board, mv));

    if (promotionMoves.length > 0) {
        const piecePart = weightedRandom(promotionProbWeights);
        return promotionMoves.find((mv) => mv.includes(piecePart));
    }

    if (checkMoves && captureMoves) {
        if (Math.random < 0.5) captureMoves = []; // when faced with both, capture 50% of the time
    }

    if (captureMoves.length > 0) return randomFromArr(captureMoves);
    if (checkMoves.length > 0) return randomFromArr(checkMoves);

    return randomFromArr(moves);
}
