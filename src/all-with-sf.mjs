/*
import { play, evaluate, heuristic1, sortDescByScore } from '../evaluate.mjs';
import { validMoves, moveToPgn, moveToObject, isChecking, isBeingAttacked } from '../move.mjs';
*/

import { EMPTY } from './board.mjs';
import { isChecking } from './move.mjs';
import { CHECKMATE, DRAW_STALEMATE, isTie } from './evaluate.mjs';
import { setup as setupStockfish, getValidMoves } from './stockfish-browser-wrapper.mjs';

setupStockfish(20);

const vmMap = new Map();
export async function validMoves(board) {
    const unq = board.getUniqueString();
    const tmp = vmMap.get(unq);
    if (tmp) return tmp;

    const fen = board.getFen();
    const res = await getValidMoves(fen);
    vmMap.set(unq, res);
    return res;
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
