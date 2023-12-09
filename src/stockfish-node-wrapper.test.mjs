import test from 'node:test';
import { equal, deepEqual, ok } from 'node:assert/strict';

import { setup, evalBoard, playBoard, getBoard, getBoardFen, getValidMoves, terminate } from './stockfish-node-wrapper.mjs';

import { Board } from './board.mjs';

await setup(20);

test('getBoardFen', async (_t) => {
    const b = Board.default();
    const fen = b.getFen();
    const fen2 = await getBoardFen();
    equal(fen2, fen);
});

test('getBoard', async (_t) => {
    const b = Board.default();
    const { board, fen } = await getBoard();
    equal(board, ` +---+---+---+---+---+---+---+---+
 | r | n | b | q | k | b | n | r | 8
 +---+---+---+---+---+---+---+---+
 | p | p | p | p | p | p | p | p | 7
 +---+---+---+---+---+---+---+---+
 |   |   |   |   |   |   |   |   | 6
 +---+---+---+---+---+---+---+---+
 |   |   |   |   |   |   |   |   | 5
 +---+---+---+---+---+---+---+---+
 |   |   |   |   |   |   |   |   | 4
 +---+---+---+---+---+---+---+---+
 |   |   |   |   |   |   |   |   | 3
 +---+---+---+---+---+---+---+---+
 | P | P | P | P | P | P | P | P | 2
 +---+---+---+---+---+---+---+---+
 | R | N | B | Q | K | B | N | R | 1
 +---+---+---+---+---+---+---+---+
   a   b   c   d   e   f   g   h`);
    equal(fen, `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`);
});

test('evalBoard', async (_t) => {
    const b = Board.default();
    const evaluation = await evalBoard(b.getFen());
    equal(evaluation, 0);
});

test('getValidMoves', async (_t) => {
    const b = Board.default();
    const moves = await getValidMoves(b.getFen());
    moves.sort();
    deepEqual(moves, [
        'a2a3', 'a2a4', 'b1a3',
        'b1c3', 'b2b3', 'b2b4',
        'c2c3', 'c2c4', 'd2d3',
        'd2d4', 'e2e3', 'e2e4',
        'f2f3', 'f2f4', 'g1f3',
        'g1h3', 'g2g3', 'g2g4',
        'h2h3', 'h2h4'
    ]);
});

test('playBoard', async (_t) => {
    const b = Board.default();
    const play = await playBoard(b.getFen());

    ok(play);
    ok(play.bestMove);
    ok(play.ponder);

    //console.log(play);
});

test('terminate', (_t) => {
    terminate();
});
