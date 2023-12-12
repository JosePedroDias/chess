import test from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';

import { Board } from '../board.mjs';
import { material } from './evaluate.mjs';

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
    const b = Board.fromFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 w - - 0 1`);
    equal(material(b, true), -21);
});

test('material winning', (_t) => {
    const b = Board.fromFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 w - - 0 1`);
    equal(material(b, false), 21);
});


/*
test('validMoves2', (_t) => {
    const b = Board.fromFen(`r1q3nr/pb1pk1pp/n2b1p2/1Bp1P3/P3P3/2N1BN2/1PP2PPP/R2Q1RK1 w - a3 0 10`);

    const moves = validMoves2(b);
    deepEqual(moves.sort(), [
        'Bb5xa6', 'Bb5c6', 'Bb5xd7', 'Bb5c4',
        'Bb5d3',  'Bb5e2', 'exd6+',  'exf6+',
        'e6',     'a5',    'Nc3d5+', 'Nc3b1',
        'Nc3a2',  'Nc3e2', 'Be3d4',  'Be3xc5',
        'Be3f4',  'Be3g5', 'Be3h6',  'Be3d2',
        'Be3c1',  'Nf3d4', 'Nf3g5',  'Nf3h4',
        'Nf3e1',  'Nf3d2', 'a3',     'b3',
        'b4',     'g3',    'g4',     'h3',
        'h4',     'Ra1b1', 'Ra1c1',  'Ra1a2',
        'Ra1a3',  'Qd1c1', 'Qd1b1',  'Qd1d2',
        'Qd1d3',  'Qd1d4', 'Qd1d5',  'Qd1xd6+',
        'Qd1e2',  'Qd1e1', 'Rf1e1',  'Kg1h1'
      ].sort());
});

test('validMoves2 b', (_t) => {
    let b = Board.fromFen(`r1q3nr/pb1pk1pp/n2b1p2/1Bp1P3/P3P3/2N1BN2/1PP2PPP/R2Q1RK1 w - a3 0 10`);
    b = b.applyMove('Qd1xd6+');

    const moves = validMoves2(b);
    deepEqual(moves.sort(), [
        'Ke7d8',
        'Ke7e8',
        'Ke7f7',
    ].sort());
});

test('validMoves2 c', (_t) => {
    let b = Board.fromFen(`k7/8/8/8/8/8/8/4K2R w K - 0 1`);

    const moves = validMoves2(b);
    equal(moves.length, 15);
    deepEqual(moves.sort(), [
        'Ke1d1',
        'Ke1d2',
        'Ke1e2',
        'Ke1f1',
        'Ke1f2',
        'O-O',
        'Rh1f1',
        'Rh1g1',
        'Rh1h2',
        'Rh1h3',
        'Rh1h4',
        'Rh1h5',
        'Rh1h6',
        'Rh1h7',
        'Rh1h8+',
    ].sort());
});

test('electNextMove', async (_t) => {
    let b = Board.fromFen(`r1q3nr/pb1pk1pp/n2b1p2/1Bp1P3/P3P3/2N1BN2/1PP2PPP/R2Q1RK1 w - a3 0 10`);

    equal(isBoardChecked(b, 'Qd1xd6+', true), true);
    equal(isBoardChecked(b, 'Qd1xd6+', false), false);

    b = b.applyMove('Qd1xd6+');

    const move = electNextMove(b);

    equal(isBoardChecked(b, move, true), false);
    equal(isBoardChecked(b, move, false), false);
});
*/
