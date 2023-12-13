import { isWhitePiece } from './pieces.mjs';
import { histogram } from './utils.mjs';
import { validMoves, isMoveCapture, isChecking, isBeingAttacked, moveToPgn } from './move.mjs';

export const PIECE_VALUE = {
    'q': 9,
    'r': 5,
    'b': 3,
    'n': 3,
    'p': 1,
};

export const CHECKMATE      = 'checkmate';
export const DRAW_STALEMATE = 'draw: stalemate';
export const DRAW_3FOLD     = 'draw: threefold repetition';
export const DRAW_50MOVE    = 'draw: 50 moves wo/ captures or pawn moves';

export function getPieceMaterial(piece) {
    return PIECE_VALUE[piece.toLowerCase()] || 0;
}

export function getBoardMaterial(board, isWhite) {
    let mat = 0;
    for (const [_, piece] of board) {
        let v = getPieceMaterial(piece);
        if (v) {
            const sign = (isWhitePiece(piece) === isWhite) ? 1 : -1;
            mat += sign * v;
        }
    }
    return mat;
}

export function findMaterialDraws(board) {
    const p1 = board.getSidePositions(true ).map(([_, piece]) => piece.toLowerCase());
    const p2 = board.getSidePositions(false).map(([_, piece]) => piece.toLowerCase());
    const h1 = histogram(p1);
    const h2 = histogram(p2);

    if (h1.p > 0 || h2.p > 0) return;
    if (h1.r > 0 || h2.r > 0) return;
    if (h1.q > 0 || h2.q > 0) return;

    // K+B vs K
    if (h1.n === 0 && h2.n === 0 && ((h1.b === 0 && h2.b === 1) || (h1.b === 1 && h2.b === 0))) return 'draw: K+B vs K';

    // K+N vs K
    if (h1.b === 0 && h2.b === 0 && ((h1.n === 0 && h2.n === 1) || (h1.n === 1 && h2.n === 0))) return 'draw: K+N vs K';

    // TODO: KBw vs KBw || KBb vs KBb

    // K vs K
    if (h1.b > 0 || h2.b > 0) return;
    if (h1.n > 0 && h2.n > 0) return;
    return 'draw: K vs K';
}

export function isTie(board) {
    // threefold repetition
    if (board._moves.length >= 6) {
        const fenRepsMap = new Map();
        const boards = [...board._pastBoards, board];
        for (let b of boards) {
            const [boardFen, sideFen] = b.getFen().split(' ');
            const key = [boardFen, sideFen].join('_');
            const v = fenRepsMap.get(key);
            if (!v) fenRepsMap.set(key, 1);
            else if (v === 2) {
                console.log(b.toString()); // board which happened 3 times for the same side
                return DRAW_3FOLD;
            }
            else fenRepsMap.set(key, v + 1);
        }
    }

    // fifty move rule
    if (board._params.halfMoveClock === 100) return DRAW_50MOVE;

    return findMaterialDraws(board);
}

export function evaluate(board) {
    const isWhite = board.isWhiteNext();
    const moves = validMoves(board);

    const amIBeingChecked = isChecking(board, !isWhite);

    if (moves.length === 0) throw (amIBeingChecked ? CHECKMATE : DRAW_STALEMATE);

    const drawReason = isTie(board);
    if (drawReason) throw drawReason;

    const startMaterial = getBoardMaterial(board, isWhite);

    const candidates = [];

    for (const move of moves) {
        const pgn = moveToPgn(move, board);

        const isPromotion = Boolean(move[4]);
        const isCapture = isMoveCapture(board, move);

        const board2 = board.applyMove(move);

        const isCheck = isChecking(board2, isWhite);

        const resultingMaterial = getBoardMaterial(board2, isWhite);
        const diffMaterial = resultingMaterial - startMaterial;

        const numMovesWeGet = validMoves(board2).length;

        const ourPositions = board2.getSidePositions(isWhite);
        const theirPositions = board2.getSidePositions(!isWhite);

        const whatWeCanLose =   ourPositions.filter((pair) => isBeingAttacked(pair[0], board2, !isWhite)).map(pair => pair[1]);
        const whatWeCanWin  = theirPositions.filter((pair) => isBeingAttacked(pair[0], board2,  isWhite)).map(pair => pair[1]);

        const maxLoss = whatWeCanLose.reduce((prev, curr) => Math.min(prev, -1 * getPieceMaterial(curr)), 0);
        const maxWin  = whatWeCanWin.reduce( (prev, curr) => Math.max(prev,      getPieceMaterial(curr)), 0);

        // TODO value forks
        // TODO check if maxLoss is defended
        // TODO check if maxWin  is defended

        const rnd = Math.random();

        candidates.push({
            move, pgn,
            rnd,
            numMovesWeGet,
            isPromotion, isCapture, isCheck,
            diffMaterial,
            maxWin, maxLoss,
        });
    }

    return candidates;
}

export function sortDescByScore(arr) {
    arr.sort((a, b) => {
        a = a.score;
        b = b.score;
        return a > b ? -1 : a < b ? 1 : 0;
    });
}

export function heuristic1(o) {
    o.score =   o.diffMaterial + 
                0.1 * o.maxWin + 0.12 * o.maxLoss +
                (o.isCheck ? 2 : 0) +
                o.numMovesWeGet * 0.02 +
                o.rnd * 0.01;
                0;
}

export async function play(board) {
    const candidates = evaluate(board);
    candidates.forEach(heuristic1);
    sortDescByScore(candidates);

    //console.table(candidates);

    return candidates[0].move;
}
