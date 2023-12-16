import test from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';

import { validMoves } from './valid-moves-mine.mjs';
import { Board } from './board.mjs';
//import { isChecking, isBeingAttacked, isMoveCapture, moveToObject, moveToPgn } from './move.mjs';
//import { computeOutcomes } from './evaluate.mjs';

test('validMoves start pos', async (_t) => {
    const b = Board.default();
    const moves = await validMoves(b);
    moves.sort();
    equal(moves.length, 20); // 16 pawns + 4 knights
});


test('validMoves check', async (_t) => {
    const b = Board.fromFen(`1nbqk1nr/1ppp1ppp/4p3/8/2P1P3/3P4/5PPP/3rK1NR w KQk - 0 12`);
    const moves = await validMoves(b);
    moves.sort();
    deepEqual(moves, ['e1d1', 'e1e2']);
});

test('validMoves checkmate', async (_t) => {
    let b = Board.fromFen(`4k1r1/4P3/3Q2P1/5K2/7p/2b5/7P/8 w - - 5 46`);
    b = b.applyMove('d6d8');
    const moves = await validMoves(b);
    moves.sort();
    deepEqual(moves, []);
});
