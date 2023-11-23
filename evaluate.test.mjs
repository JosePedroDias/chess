import test from 'node:test';
import { equal } from 'node:assert/strict';

//import { log } from './utils.mjs';
import { Board } from './board.mjs';
import { material, validMoves, electNextMove } from './evaluate.mjs';
import { deepEqual } from 'node:assert';

test('material empty', (_t) => {
    const b = Board.empty();
    equal(material(b, true), 0);
});

test('material queen is worth 9', (_t) => {
    const b = Board.empty();
    b.set('b4', 'Q');
    equal(material(b, true), 9);
});

test('material losing', (_t) => {
    const b = Board.fromFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1`);
    equal(material(b, true), -21);
});

test('material winning', (_t) => {
    const b = Board.fromFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1`);
    equal(material(b, false), 21);
});

test('valid moves', (_t) => {
    _t.todo();
    const b = Board.default();
    deepEqual(validMoves(b), []);
});

test('elect new move', async (_t) => {
    _t.todo();
    const b = Board.default();
    const move = await electNextMove(b);
    equal(move, 'b2b3');
});

// log(b.toString())
