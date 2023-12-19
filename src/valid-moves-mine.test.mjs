import test from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';

import { validMoves } from './valid-moves-mine.mjs';
import { Board } from './board.mjs';

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

test('validMoves checkmate', async (_t) => {
    let b = Board.fromFen(`4k1r1/4P3/3Q2P1/5K2/7p/2b5/7P/8 w - - 5 46`);
    b = b.applyMove('d6d8');
    const moves = await validMoves(b);
    moves.sort();
    deepEqual(moves, []);
});

test('validMoves castling impossible under check', async (_t) => {
    const b = Board.fromFen(`1nb2b2/1ppp1kr1/r4ppp/p3p2B/P6P/N2qPPN1/1P1P2P1/2BQK2R w K - 0 19`);
    const moves = await validMoves(b);
    moves.sort();
    deepEqual(moves, [
        'a3b1', 'a3b5', 'a3c2',
        'a3c4', 'b2b3', 'b2b4',
        'd1b3', 'd1c2', 'd1e2',
        'e1f2', /*'e1g1',*/ 'e3e4',
        'f3f4', 'g3e2', 'g3e4',
        'g3f1', 'g3f5', 'h1f1',
        'h1g1', 'h1h2', 'h1h3',
        'h5g4', 'h5g6'
    ]);
});

test('validMoves castling ??',  async (_t) => {
    const b = Board.fromFen(`B1bqkb2/2p1pp2/2np2pr/p6p/1P2N3/5P2/P1PPQ1PP/R1B1K1NR b KQq - 0 9`);
    const moves = await validMoves(b);
    moves.sort();
    deepEqual(moves, [
        'a5a4',
        'a5b4',
        'c6a7',
        'c6b4',
        'c6b8',
        'c6d4',
        'c6e5',
        'c8a6',
        'c8b7',
        'c8d7',
        'c8e6',
        'c8f5',
        'c8g4',
        'c8h3',
        'd6d5',
        'd8d7',
        'e7e5',
        'e7e6',
        //'e8c8', // O-O !!
        'e8d7',
        'f7f5',
        'f7f6',
        'f8g7',
        'g6g5',
        'h5h4',
        'h6h7',
        'h6h8',
    ]);
    //console.log(moves);
});
