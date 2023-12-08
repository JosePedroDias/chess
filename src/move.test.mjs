import test from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';

import { Board, EMPTY } from './board.mjs';
import { moveToObject, moveToPgn } from './move.mjs';

test('moveToObject not capturing', (_t) => {
    _t.todo('B, R, Q, K, O-O, O-O-O');
    const b0 = Board.default();
    deepEqual(moveToObject('e2e4', b0), { from: 'e2', to: 'e4', piece: 'P', isCapture: false });
    deepEqual(moveToObject('e2e3', b0), { from: 'e2', to: 'e3', piece: 'P', isCapture: false });
    deepEqual(moveToObject('g1f3', b0), { from: 'g1', to: 'f3', piece: 'N', isCapture: false });
});

test('moveToObject capturing', (_t) => {
    _t.todo('P, N B, R, Q, K');
});

test('moveToPgn not capturing', (_t) => {
    _t.todo('B, R, Q, K, O-O, O-O-O');
    const b0 = Board.default();
    equal(moveToPgn('e2e4', b0), 'e4');
    equal(moveToPgn('e2e3', b0), 'e3');
    equal(moveToPgn('g1f3', b0), 'Ng1f3');
});

test('moveToPgn capturing', (_t) => {
    _t.todo('P, N B, R, Q, K');
});
