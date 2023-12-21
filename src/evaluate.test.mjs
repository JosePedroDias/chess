import test from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';

import { Board } from './board.mjs';
import { getBoardMaterial, isFork, isPinSkewer } from './evaluate.mjs';

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

test('fork', { only: true }, async (_t) => {
    {
        const b = Board.fromFen(`7k/2q1b3/8/3N4/8/8/8/1K6 w - - 0 1`);
        const { result, potentialCaptures } = await isFork(b, true);
        equal(result, true);
        deepEqual(potentialCaptures, ['q', 'b']);
    }
    {
        const b = Board.fromFen(`4b2k/2q5/8/3N4/8/8/8/1K6 w - - 0 1`);
        const { result, potentialCaptures } = await isFork(b, true);
        equal(result, false);
        deepEqual(potentialCaptures, ['q']);
    }
});

test('pin/skewer', { only: true }, (_t) => {
    {
        const b = Board.fromFen(`4b1k1/8/1n2q3/2p5/8/4Q3/8/1K6 w - - 0 1`);
        const { result, attackedPiecePacks } = isPinSkewer(b, true);
        equal(result, true);
        deepEqual(attackedPiecePacks, [['p', 'n'], ['q', 'b']]);
    }
    {
        const b = Board.fromFen(`3b2k1/8/1n2q3/2P5/8/4Q3/8/1K6 w - - 0 1`);
        const { result, attackedPiecePacks } = isPinSkewer(b, true);
        equal(result, false);
        deepEqual(attackedPiecePacks, []);
    }
});
