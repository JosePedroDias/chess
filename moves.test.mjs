import test from 'node:test';
import { equal } from 'node:assert/strict';

//import { log } from './testUtils.mjs';
import { BLACK, Board } from './board.mjs';
import { flatten1Level } from './utils.mjs';
import { KING_W, QUEEN_W, ROOK_W, BISHOP_W, KNIGHT_W, PAWN_B, PAWN_W } from './pieces.mjs';
import { bishopMoves, kingMoves, knightMoves, pawnMoves, queenMoves, rookMoves, illustrateMoves, isMoveCapture, isMoveCheck } from './moves.mjs';

test('king moves', (_t) => {
    const pos = 'c6';
    const piece = KING_W;
    const moves = flatten1Level(kingMoves(pos));
    const b = illustrateMoves(moves, piece, pos);
    equal(b.toString(),
` . . . . . . . .
 . * * * . . . .
 . * K * . . . .
 . * * * . . . .
 . . . . . . . .
 . . . . . . . .
 . . . . . . . .
 . . . . . . . .`);
});

test('queen moves', (_t) => {
    const pos = 'e5';
    const piece = QUEEN_W;
    const moves = flatten1Level(queenMoves(pos));
    const b = illustrateMoves(moves, piece, pos);
    equal(b.toString(),
` . * . . * . . *
 . . * . * . * .
 . . . * * * . .
 * * * * Q * * *
 . . . * * * . .
 . . * . * . * .
 . * . . * . . *
 * . . . * . . .`);
});

test('rook moves', (_t) => {
    const pos = 'b2';
    const piece = ROOK_W;
    const moves = flatten1Level(rookMoves(pos));
    const b = illustrateMoves(moves, piece, pos);
    equal(b.toString(),
` . * . . . . . .
 . * . . . . . .
 . * . . . . . .
 . * . . . . . .
 . * . . . . . .
 . * . . . . . .
 * R * * * * * *
 . * . . . . . .`);
});

test('bishop moves', (_t) => {
    const pos = 'c4';
    const piece = BISHOP_W;
    const moves = flatten1Level(bishopMoves(pos));
    const b = illustrateMoves(moves, piece, pos);
    equal(b.toString(),
` . . . . . . * .
 . . . . . * . .
 * . . . * . . .
 . * . * . . . .
 . . B . . . . .
 . * . * . . . .
 * . . . * . . .
 . . . . . * . .`);
});

test('knight moves', (_t) => {
    const pos = 'd5';
    const piece = KNIGHT_W;
    const moves = flatten1Level(knightMoves(pos));
    const b = illustrateMoves(moves, piece, pos);
    equal(b.toString(),
` . . . . . . . .
 . . * . * . . .
 . * . . . * . .
 . . . N . . . .
 . * . . . * . .
 . . * . * . . .
 . . . . . . . .
 . . . . . . . .`);
});

test('pawn moves double white', (_t) => {
    const pos = 'b2';
    const piece = PAWN_W;
    const moves = flatten1Level(pawnMoves(pos, Board.empty()));
    const b = illustrateMoves(moves, piece, pos);
    equal(b.toString(),
` . . . . . . . .
 . . . . . . . .
 . . . . . . . .
 . . . . . . . .
 . * . . . . . .
 . * . . . . . .
 . P . . . . . .
 . . . . . . . .`);
});

test('pawn moves regular white', (_t) => {
    const pos = 'b3';
    const piece = PAWN_W;
    const moves = flatten1Level(pawnMoves(pos, Board.empty()));
    const b = illustrateMoves(moves, piece, pos);
    equal(b.toString(),
` . . . . . . . .
 . . . . . . . .
 . . . . . . . .
 . . . . . . . .
 . * . . . . . .
 . P . . . . . .
 . . . . . . . .
 . . . . . . . .`);
});

test('pawn moves double black', (_t) => {
    const pos = 'g7';
    const piece = PAWN_B;
    const b0 = Board.empty();
    b0._params.next = BLACK;
    const moves = flatten1Level(pawnMoves(pos, b0));
    const b = illustrateMoves(moves, piece, pos);
    equal(b.toString(),
` . . . . . . . .
 . . . . . . p .
 . . . . . . * .
 . . . . . . * .
 . . . . . . . .
 . . . . . . . .
 . . . . . . . .
 . . . . . . . .`);
});

test('pawn moves regular black', (_t) => {
    const pos = 'g6';
    const piece = PAWN_B;
    const b0 = Board.empty();
    b0._params.next = BLACK;
    const moves = flatten1Level(pawnMoves(pos, b0));
    const b = illustrateMoves(moves, piece, pos);
    equal(b.toString(),
` . . . . . . . .
 . . . . . . . .
 . . . . . . p .
 . . . . . . * .
 . . . . . . . .
 . . . . . . . .
 . . . . . . . .
 . . . . . . . .`);
});

test('isMoveCapture', (_t) => {
    _t.todo();
    //isMoveCapture();
});

test('isMoveCheck', (_t) => {
    _t.todo();
    //isMoveCheck();
});

// log(b.toString())
