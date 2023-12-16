import { PAWN_B, PAWN_W, isKing, isWhitePiece, isBlackPiece } from './pieces.mjs';
import { EMPTY } from './board.mjs';
import { histogram } from './utils.mjs';
import { isChecking, moveToPgn } from './move.mjs';
import { validMoves } from './valid-moves.mjs';
import { playBoard } from './stockfish-browser-wrapper.mjs';

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
    const isMyPiece = isWhite ? isWhitePiece : isBlackPiece;
    const isOpponentPiece = isWhite ? isBlackPiece : isWhitePiece;

    const amIBeingChecked = isChecking(board, !isWhite);

    const moves = await validMoves(board);

    if (moves.length === 0) {
        throw (amIBeingChecked ? `${CHECKMATE} by ${board.getInvertedBoard()._params.next}` : DRAW_STALEMATE);
    }

    const captureMoves       = new Set();
    const promotionMoves     = new Set();
    const checkMoves         = new Set();
    const checkmateMoves     = new Set();
    const stalemateMoves     = new Set();
    const canBeCapturedMoves = new Set();
    const attackedPositions  = new Set();
    const defendedPositions  = new Set();

    const initialMaterial = getBoardMaterial(board, isWhite);

    const materialDiff = new Map();

    const myPiecePositions = board.getSidePositions(isWhite).map(([pos]) => pos);

    outerMPP: for (const pos of myPiecePositions) {
        if (isKing(board.get(pos))) continue;
        const board_ = board.clone();
        board_.set(pos, isWhite ? PAWN_B : PAWN_W);
        const moves_ = await validMoves(board_);
        for (const mv_ of moves_) {
            const to_ = mv_.substring(2, 4);
            if (to_ === pos) {
                defendedPositions.add(pos);
                continue outerMPP;
            }
        }
    }

    // TODO CASTLING MOVES
    // TODO DEVELOPMENT MOVES

    for (const mv of moves) {
        const to = mv.substring(2, 4);
        const prom = mv[4];

        let bestEndMaterial  = -100000;
        let worseEndMaterial =  100000;
        materialDiff.set(mv, [0, 0]);

        if (board.get(to) !== EMPTY) captureMoves.add(mv);

        if (prom) promotionMoves.add(mv);
        const board2 = board.applyMove(mv);

        const amIChecking = isChecking(board2, isWhite);
        if (amIChecking) checkMoves.add(mv);

        const moves2 = await validMoves(board2);

        for (const mv2 of moves2) {
            const board3 =  board2.applyMove(mv2);
            const endMaterial = getBoardMaterial(board3, isWhite);

            if (endMaterial > bestEndMaterial)  bestEndMaterial  = endMaterial;
            if (endMaterial < worseEndMaterial) worseEndMaterial = endMaterial;

            const myPiecePositions2 = board2.getSidePositions(isWhite).map(([pos]) => pos);
            const to2 = mv2.substring(2, 4);

            if (myPiecePositions.includes(to2) && board2.get(to2) !== EMPTY) attackedPositions.add(to2);
            if (myPiecePositions2.includes(to2)) canBeCapturedMoves.add(mv);
        }

        const numMoves = moves2.length;

        if (numMoves === 0) {
            const bag = amIChecking ? checkmateMoves : stalemateMoves;
            bag.add(mv);
        } else {
            materialDiff.set(
                mv, [
                    worseEndMaterial - initialMaterial,
                    bestEndMaterial  - initialMaterial,
                ]);
        }
    }

    const moveAttributesMap = new Map();

    for (const move of moves) {
        const isCheck        = checkMoves.has(move);
        const isCheckmate    = checkmateMoves.has(move);
        const isStalemate    = stalemateMoves.has(move);
        const isCapture      = captureMoves.has(move);
        const canBeCaptured  = canBeCapturedMoves.has(move);
        const isPromotion    = promotionMoves.has(move);
        const rnd = Math.random();
        const [worseMatDiff, bestMatDiff] = materialDiff.get(move);
        
        const pgn = moveToPgn(move, board, moves) + (isCheckmate ? '#' : isCheck ? '+' : '');
        
        moveAttributesMap.set(move, {
            move,
            pgn,
            isCheck,
            isCheckmate,
            isStalemate,
            isCapture,
            canBeCaptured,
            isPromotion,
            worseMatDiff,
            bestMatDiff,
            rnd,
        });
    }

    return {
        moves,
        moveAttributesMap,
        attackedPositions,
        defendedPositions,
        amIBeingChecked,
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
    o.score =   (o.isCheckmate  ?  100 : 0)      +
                (o.isStalemate  ?   -5 : 0)      +
                (o.bestMatDiff + o.worseMatDiff) +
                (o.isPromotion   ?  0.5 : 0)     +
                (o.canBeCaptured ? -1.1 : 0)     +
                 o.rnd * 0.05;
}

export async function playZpBot(board) {
    const candidates = Array.from( (await computeOutcomes(board)).moveAttributesMap.values() );
    candidates.forEach(heuristic1);
    sortDescByScore(candidates);
    //console.table(candidates);
    return candidates[0].move;
}

export async function playSF(board) {
    //console.log(board.toString());
    const fen = board.getFen();
    //console.log(`sf in: ${fen}`);
    const { bestMove } = await playBoard(fen);
    //console.log(`sf out: ${bestMove}`);
    return bestMove;
}
