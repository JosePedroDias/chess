import test from 'node:test';
import { equal } from 'node:assert/strict';

// import { pc } from './vendor/colorette.mjs';

// import { log } from './testUtils.mjs';
import { Board } from './board.mjs';
//import { illustrateMoves } from './moves.mjs';
import { material, electNextMove } from './evaluate.mjs';

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

test('elect new move', async (_t) => {
    _t.todo();
    const b = Board.default();
    //const move = await electNextMove(b);
    //equal(move, 'b2b3');
});
