import test from 'node:test';
import { equal } from 'node:assert/strict';

//import { log } from './utils.mjs';
import { Board } from './board.mjs';
import { material } from './evaluate.mjs';

test('material empty', (_t) => {
    const b = Board.empty();
    equal(material(b, true), 0);
});

test('material losing', (_t) => {
    const b = Board.fromFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1`);
    equal(material(b, true), -21);
});

test('material winning', (_t) => {
    const b = Board.fromFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1`);
    equal(material(b, false), 21);
});

// log(b.toString())
