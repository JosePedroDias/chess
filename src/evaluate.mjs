import { isWhitePiece } from './pieces.mjs';
import { EMPTY } from './board.mjs';
import { histogram, randomFloat } from './utils.mjs';
import { isChecking, moveToPgn } from './move.mjs';
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

export async function computeOutcomes(board) {
    const tieResult = isTie(board);
    if (tieResult) throw tieResult;

    const isWhite = board.isWhiteNext();

    const amIBeingChecked = isChecking(board, !isWhite);

    const moves = await validMoves(board);

    if (moves.length === 0) {
        throw (amIBeingChecked ? `${CHECKMATE} by ${board.getInvertedBoard()._params.next}` : DRAW_STALEMATE);
    }

    const captureMoves     = new Set();
    const saveCaptureMoves = new Set();
    const promotionMoves   = new Set();
    const checkMoves       = new Set();
    const checkmateMoves   = new Set();
    const stalemateMoves   = new Set();

    // TODO CASTLING MOVES
    // TODO DEVELOPMENT MOVES
    // TODO (UN)PROTECT OTHER PIECES OF MINE?

    for (const mv of moves) {
        const to = mv.substring(2, 4);
        const prom = mv[4];

        const isCapture = board.get(to) !== EMPTY;

        if (prom) promotionMoves.add(mv);
        const board2 = board.applyMove(mv);

        const amIChecking = isChecking(board2, isWhite);
        if (amIChecking) checkMoves.add(mv);

        const moves2 = await validMoves(board2);

        if (isCapture) {
            captureMoves.add(mv);
            let isSafe = true;
            for (const mv2 of moves2) {
                const to2 = mv2.substring(2, 4);
                if (to2 === to) {
                    isSafe = false;
                    break;
                }
            }
            if (isSafe) saveCaptureMoves.add(mv);
        }

        const numMoves = moves2.length;

        if (numMoves === 0) {
            const bag = amIChecking ? checkmateMoves : stalemateMoves;
            bag.add(mv);
        }
    }

    const moveAttributesMap = new Map();

    for (const move of moves) {
        const resultsInCheckmate = checkmateMoves.has(move);
        const isSafeCapture = saveCaptureMoves.has(move);
        const isCapture = captureMoves.has(move);
        const resultsInCheck = checkMoves.has(move);
        const isPromotion = promotionMoves.has(move);
        const rnd = Math.random();
        const resultsInStalemate = stalemateMoves.has(move);

        const pgn = moveToPgn(move, board) + (resultsInCheckmate ? '#' : resultsInCheck ? '+' : '');
        
        moveAttributesMap.set(move, {
            move,
            pgn,
            resultsInCheckmate,
            isSafeCapture,
            isCapture,
            resultsInCheck,
            isPromotion,
            rnd,
            resultsInStalemate,
        });
    }

    return {
        moves,
        moveAttributesMap,
        amIBeingChecked,

        checkMoves,
        checkmateMoves,
        stalemateMoves,
        promotionMoves,
        captureMoves,
        saveCaptureMoves,
    };
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
                (o.isSafeCapture ? 2 : 0) +
                (o.isCapture ? randomFloat(0.3) - 0.15 : 0) + // unsafe but fun. how reckless the bot is
                (o.isPromotion ? 1 : 0) +
                 o.rnd * 0.01;
}

export async function play(board) {
    const candidates = Array.from( (await computeOutcomes(board)).moveAttributesMap.values() );
    candidates.forEach(heuristic1);
    sortDescByScore(candidates);
    //console.table(candidates);
    return candidates[0].move;
}
