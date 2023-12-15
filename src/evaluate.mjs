import { isWhitePiece } from './pieces.mjs';
import { EMPTY } from './board.mjs';
import { histogram } from './utils.mjs';
import { isChecking } from './move.mjs';
import { validMoves } from './valid-moves.mjs';

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
    if (h1.n > 0 || h2.n > 0) return;
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

export async function outcomes(board) {
    const tieResult = isTie(board);
    if (tieResult) throw tieResult;

    const isWhite = board.isWhiteNext();

    const amIBeingChecked = isChecking(board, !isWhite);

    const moves = await validMoves(board);

    if (moves.length === 0) {
        throw (amIBeingChecked ? `${CHECKMATE} by ${board.getInvertedBoard()._params.next}` : DRAW_STALEMATE);
    }

    const captureMoves = moves.filter((mv) => {
        const to = mv.substring(2, 4);
        return board.get(to) !== EMPTY;
    });

    const promotionMoves = [];
    const checkMoves = [];
    const checkmateMoves = [];
    const stalemateMoves = [];

    for (const mv of moves) {
        const prom = mv[4];

        if (prom) promotionMoves.push(mv);
        const board2 = board.applyMove(mv);

        const amIChecking = isChecking(board2, isWhite);
        if (amIChecking) {
            checkMoves.push(mv);
        }

        const moves2 = await validMoves(board2);

        const numMoves = moves2.length;

        if (numMoves === 0) {
            const bag = amIChecking ? checkmateMoves : stalemateMoves;
            bag.push(mv);
        }
    }

    const captureIsntTradedMoves = [];
    outer: for (const mv of captureMoves) {
        const to = mv.substring(2, 4);
        const board2 = board.applyMove(mv);
        const moves2 = await validMoves(board2);
        
        for (const mv2 of moves2) {
            const to2 = mv2.substring(2, 4);
            if (to2 === to) break outer;
        }
        captureIsntTradedMoves.push(mv);
    }

    return {
        moves,
        amIBeingChecked,
        checkMoves,
        checkmateMoves,
        stalemateMoves,
        promotionMoves,
        captureMoves,
        captureIsntTradedMoves,
    };
}

export async function evaluate(board) {
    const {
        moves,
        checkMoves,
        checkmateMoves,
        stalemateMoves,
        promotionMoves,
        //captureMoves,
        captureIsntTradedMoves,
    } = await outcomes(board);

    const candidates = [];
    for (const move of moves) {
        const rnd = Math.random();

        const isPromotion = promotionMoves.includes(move);
        const resultsInCheck = checkMoves.includes(move);
        const resultsInCheckmate = checkmateMoves.includes(move);
        const resultsInStalemate = stalemateMoves.includes(move);
        //const isCapture = captureMoves.includes(move);
        const isGoodCapture = captureIsntTradedMoves.includes(move);

        candidates.push({
            move,
            resultsInCheckmate,
            isGoodCapture,
            resultsInCheck,
            isPromotion,
            rnd,
            resultsInStalemate,
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
    o.score =   (o.resultsInCheckmate ? 100 : 0) +
                (o.resultsInStalemate ? -5 : 0) +
                (o.isGoodCapture ? 2 : 0) +
                (o.isPromotion ? 1 : 0) +
                 o.rnd * 0.01;
}

export async function play(board) {
    const candidates = await evaluate(board);
    candidates.forEach(heuristic1);
    sortDescByScore(candidates);
    //console.table(candidates);

    return candidates[0].move;
}
