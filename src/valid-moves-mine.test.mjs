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
