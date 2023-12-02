import { isBoardChecked, isMoveStringCheck, isMoveStringCapture, moveToString, validMoves, isMoveStringPromotion } from './moves.mjs';
import { isWhitePiece } from './pieces.mjs';
import { randomFromArr, weightedRandom } from './utils.mjs';

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

export function validMoves2(board) {
    let moves = validMoves(board);
    moves = moves.filter((move) => {
        if (isBoardChecked(board, move, false)) {
            //console.log(`removing illegal move: We would remain/get into check! `, moveToString(move));
            return false;
        }
        return true;
    });
    moves = moves.map((move) => {
        let str = moveToString(move);
        if (isBoardChecked(board, move, true)) {
            str = `${str}+`;
        }
        return str;
    });

    //console.log('moves', moves);
    return moves;
}

const promotionProbWeights = [
    ['=Q', 90],
    ['=R', 40],
    ['=B', 20],
    ['=N', 10],
];

export function electNextMove(board) {
    const moves = validMoves2(board);

    if (moves.length === 0) {
        const isCheckMate = isMoveStringCheck(board.getLastMove());
        if (isCheckMate) board.makeLastMoveMate();
        const outcome = isCheckMate ? 'check mate' : 'stale mate';
        throw outcome;
    }

    const promotionMoves = moves.filter(isMoveStringPromotion);
    const checkMoves = moves.filter(isMoveStringCheck);
    const captureMoves = moves.filter(isMoveStringCapture);

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
