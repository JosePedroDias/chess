import test from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';

import { Board, EMPTY } from './board.mjs';
import { getBoardMaterial, getBoardCaptures, computeOutcomes, canFork, canPinSkewer, pawnStructure } from './evaluate.mjs';

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

test('fork', (_t) => {
    {
        const b = Board.fromFen(`7k/2q1b3/8/3N4/8/8/8/1K6 w - - 0 1`);
        const { result, potentialCaptures } = canFork(b, true);
        equal(result, true);
        deepEqual(potentialCaptures, ['q', 'b']);
    }
    {
        const b = Board.fromFen(`4b2k/2q5/8/3N4/8/8/8/1K6 w - - 0 1`);
        const { result, potentialCaptures } = canFork(b, true);
        equal(result, false);
        deepEqual(potentialCaptures, ['q']);
    }
});

test('pin/skewer', (_t) => {
    {
        const b = Board.fromFen(`4b1k1/8/1n2q3/2p5/8/4Q3/8/1K6 w - - 0 1`);
        const { result, attackedPiecePacks } = canPinSkewer(b, true);
        equal(result, true);
        deepEqual(attackedPiecePacks, [['p', 'n'], ['q', 'b']]);
    }
    {
        const b = Board.fromFen(`3b2k1/8/1n2q3/2P5/8/4Q3/8/1K6 w - - 0 1`);
        const { result, attackedPiecePacks } = canPinSkewer(b, true);
        equal(result, false);
        deepEqual(attackedPiecePacks, []);
    }
});

/* test('computeOutcomes finds fork on next move', async (_t) => {
    const b = Board.fromFen(`7k/2q1b3/8/8/5N2/8/8/1K6 w - - 0 1`);
    const out = await computeOutcomes(b);
    equal(out.forkMoves.size, 1);
    equal(out.forkMoves.has('f4d5'), true);
    deepEqual(out.forkMoves.get('f4d5'), ['q', 'b']);
    equal(out.moveAttributesMap.get('f4d5').isFork, true);
}); */

/* test('computeOutcomes finds pin on next move', async (_t) => {
    const b = Board.fromFen(`4b1k1/8/1n2q3/2p5/8/7Q/8/1K6 w - - 0 1`);
    const out = await computeOutcomes(b);
    equal(out.pinSkewerMoves.size, 4);

    equal(out.pinSkewerMoves.has('h3e3'), true);
    deepEqual(out.pinSkewerMoves.get('h3e3'), [ ['p', 'n'], ['q', 'b'] ]);

    equal(out.pinSkewerMoves.has('h3b3'), true);
    deepEqual(out.pinSkewerMoves.get('h3b3'), [ ['q', 'k'] ]);

    equal(out.pinSkewerMoves.has('h3h6'), true);
    deepEqual(out.pinSkewerMoves.get('h3h6'), [ ['q', 'n'] ]);

    equal(out.pinSkewerMoves.has('h3h8'), true);
    deepEqual(out.pinSkewerMoves.get('h3h8'), [ ['k', 'b'] ]);

    equal(out.moveAttributesMap.get('h3e3').isPinSkewer, true);
    equal(out.moveAttributesMap.get('h3b3').isPinSkewer, true);
    equal(out.moveAttributesMap.get('h3h6').isPinSkewer, true);
    equal(out.moveAttributesMap.get('h3h8').isPinSkewer, true);
}); */

test('getBoardCaptures default', (_t) => {
    const b = Board.default();
    const o = getBoardCaptures(b);
    deepEqual(o, [
        new Map([
            ['q', 0],
            ['r', 0],
            ['b', 0],
            ['n', 0],
            ['p', 0],
        ]),
        new Map([
            ['q', 0],
            ['r', 0],
            ['b', 0],
            ['n', 0],
            ['p', 0],
        ]),
        0,
    ]);
});

test('getBoardCaptures empty', (_t) => {
    const b = Board.empty();
    const o = getBoardCaptures(b);
    deepEqual(o, [
        new Map([
            ['q', 1],
            ['r', 2],
            ['b', 2],
            ['n', 2],
            ['p', 8],
        ]),
        new Map([
            ['q', 1],
            ['r', 2],
            ['b', 2],
            ['n', 2],
            ['p', 8],
        ]),
        0,
    ]);
});

test('pawnStructure start', (_t) => {
    const b = Board.default();
    const { count, clusters, doubled, isolated, backward, passed } = pawnStructure(b);
    equal(count, 8);
    equal(clusters.length, 1);
    deepEqual(clusters, [
        [['a2'], ['b2'], ['c2'], ['d2'], ['e2'], ['f2'], ['g2'], ['h2']],
    ]);
    equal(doubled.length, 0);
    equal(isolated.length, 0);
    equal(backward.length, 0);
    equal(passed.length, 0);
});

test('pawnStructure e2 to d3', (_t) => {
    const b = Board.default();
    b.set('e2', EMPTY);
    b.set('d3', 'P');
    const { count, clusters, doubled, isolated, backward, passed } = pawnStructure(b);
    equal(count, 8);
    equal(clusters.length, 2);
    deepEqual(clusters, [
        [['a2'], ['b2'], ['c2'], ['d2', 'd3']],
        [['f2'], ['g2'], ['h2']],
    ]);
    equal(doubled.length, 1);
    deepEqual(doubled, [
        ['d2', 'd3'],
    ]);
    equal(isolated.length, 0);
    equal(backward.length, 1);
    deepEqual(backward, ['d2']);
    equal(passed.length, 0);
});

test('pawnStructure remove g2', (_t) => {
    const b = Board.default();
    b.set('g2', EMPTY);
    const { count, clusters, doubled, isolated, backward, passed } = pawnStructure(b);
    equal(count, 7);
    equal(clusters.length, 2);
    deepEqual(clusters, [
        [['a2'], ['b2'], ['c2'], ['d2'], ['e2'], ['f2']], 
        [['h2']],
    ]);
    equal(doubled.length, 0);
    equal(isolated.length, 1);
    deepEqual(isolated, [
        ['h2'],
    ]);
    equal(backward.length, 0);
    equal(passed.length, 0);
});

test('pawnStructure remove g7 (passed)', (_t) => {
    const b = Board.default();
    b.set('g7', EMPTY);
    const { count, clusters, doubled, isolated, backward, passed } = pawnStructure(b);
    equal(count, 8);
    equal(clusters.length, 1);
    deepEqual(clusters, [
        [['a2'], ['b2'], ['c2'], ['d2'], ['e2'], ['f2'], ['g2'], ['h2']],
    ]);
    equal(doubled.length, 0);
    equal(isolated.length, 0);
    equal(backward.length, 0);
    equal(passed.length, 1);
    deepEqual(passed, ['g2']);
});
