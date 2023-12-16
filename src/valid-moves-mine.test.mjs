import test from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';

import { validMoves } from './valid-moves-mine.mjs';
import { Board } from './board.mjs';
//import { isChecking, isBeingAttacked, isMoveCapture, moveToObject, moveToPgn } from './move.mjs';
//import { computeOutcomes } from './evaluate.mjs';

test('validMoves', async (_t) => {
    const b = Board.fromFen(`1nbqk1nr/1ppp1ppp/4p3/8/2P1P3/3P4/5PPP/3rK1NR w KQk - 0 12`);
    const moves = await validMoves(b);
    //console.log(moves);
    deepEqual(moves, ['e1d1', 'e1e2']);
    equal(moves.length, 2);
});
