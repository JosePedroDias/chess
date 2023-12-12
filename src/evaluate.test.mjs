import test from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';

import { Board } from './board.mjs';
import { getBoardMaterial } from './evaluate.mjs';

test('material empty', (_t) => {
    const b = Board.empty();
    equal(getBoardMaterial(b, true), 0);
});

test('material queen is worth 9', (_t) => {
    const b = Board.empty();
    b.set('b4', 'Q');
    equal(getBoardMaterial(b, true), 9);
});

test('material losing', (_t) => {
    const b = Board.fromFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 w - - 0 1`);
    equal(getBoardMaterial(b, true), -21);
});

test('material winning', (_t) => {
    const b = Board.fromFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 w - - 0 1`);
    equal(getBoardMaterial(b, false), 21);
});
