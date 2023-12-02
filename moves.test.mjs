import test from 'node:test';
import { equal } from 'node:assert/strict';

import { Board, EMPTY } from './board.mjs';
import { flatten1Level } from './utils.mjs';
import {
    KING_W,
    QUEEN_W,
    ROOK_W,
    BISHOP_W,
    KNIGHT_W,
    PAWN_B,
    PAWN_W,
    KING_B,
} from './pieces.mjs';
import {
    bishopMoves,
    kingMoves,
    knightMoves,
    pawnMoves,
    queenMoves,
    rookMoves,
    illustrateMoves,
    validMoves,
    moveToString,
    moveFromString,
    isMoveCapture,
    isMoveCheck,
    isMoveStringCheck,
} from './moves.mjs';
import { deepEqual } from 'node:assert';

test('king moves',  (_t) => {
    const pos = 'c6';
    const piece = KING_W;
    const b0 = Board.fromFen(`8/8/2K5/8/8/8/8/8 w - - 0 1`);
    const moves = flatten1Level(kingMoves(pos, b0));
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

test('king moves 2',  (_t) => {
    const pos = 'h1';
    const piece = KING_W;
    const b0 = Board.fromFen(`8/8/8/8/8/8/8/7K w - - 0 1`);
    const moves = flatten1Level(kingMoves(pos, b0));
    const b = illustrateMoves(moves, piece, pos);
    equal(b.toString(),
` . . . . . . . .
 . . . . . . . .
 . . . . . . . .
 . . . . . . . .
 . . . . . . . .
 . . . . . . . .
 . . . . . . * *
 . . . . . . * K`);
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
    const b0 = Board.fromFen(`8/8/8/8/8/8/1P6/8 w - - 0 1`);
    const moves = flatten1Level(pawnMoves(pos, b0));
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
    const b0 = Board.fromFen(`8/8/8/8/8/1P6/8/8 w - - 0 1`);
    const moves = flatten1Level(pawnMoves(pos, b0));
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
    const b0 = Board.fromFen(`8/6p1/8/8/8/8/8/8 b - - 1 1`);
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
    const b0 = Board.fromFen(`8/8/6p1/8/8/8/8/8 b - - 1 1`);
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
    equal(isMoveCapture({ from: { pos: 'b2', piece: PAWN_W }, to: { pos: 'b4', piece: EMPTY } }), false);
    equal(isMoveCapture({ from: { pos: 'b2', piece: PAWN_W }, to: { pos: 'b4', piece: PAWN_B } }), true);
});

test('isMoveCheck', (_t) => {
    equal(isMoveCheck({ from: { pos: 'b2', piece: PAWN_W }, to: { pos: 'b4', piece: EMPTY } }), false);
    equal(isMoveCheck({ from: { pos: 'b2', piece: PAWN_W }, to: { pos: 'b4', piece: KING_B } }), true);
});

test('isMoveStringCheck', (_t) => {
    equal(isMoveStringCheck('b2b3'), false);
    equal(isMoveStringCheck('b2b3+'), true);
});

test('valid pawn moves start', (_t) => {
    _t.todo();
    const b = Board.fromFen(`8/8/8/8/8/8/1P6/8 w - - 0 1`);
    const moves = validMoves(b);
    deepEqual(moves, [{"from":{"pos":"b2","piece":"P"},"to":{"pos":"b3","piece":" "}},{"from":{"pos":"b2","piece":"P"},"to":{"pos":"b4","piece":" "}}]);
    //log(moves);
})

test('valid moves', (_t) => {
    {
        const b = Board.fromFen(`k7/8/8/8/8/8/8/K7 w - - 0 1`);
        const cells = validMoves(b).map(m => m?.to.pos).sort();
        deepEqual(cells, ['a2', 'b1', 'b2']);
    }
    {
        const b = Board.fromFen(`k7/8/8/8/8/8/8/7K w - - 0 1`);
        const cells = validMoves(b).map(m => m?.to.pos).sort();
        deepEqual(cells, ['g1', 'g2', 'h2']);
    }
    {
        const b = Board.fromFen(`k7/8/8/8/8/8/8/4K2R w K - 0 1`);
        //const cells = validMoves(b).map(m => m[1] ? m[0]?.to.pos : m?.to.pos);
        const moves = validMoves(b);
        equal(moves.some(m => m instanceof Array), true);
        equal(moves.length, 15);
    }
});

test('moveFromString', (_t) => {
    //log(Board.fromFen(`8/8/8/8/8/2p5/1P6/8 w - - 0 1`).toPrettyString());
    deepEqual(moveFromString('b4', Board.default()), { from: { pos: 'b2', piece: PAWN_W }, to: { pos: 'b4', piece: EMPTY } }); // TODO
    deepEqual(moveFromString('bxc3', Board.fromFen(`8/8/8/8/8/2p5/1P6/8 w - - 0 1`)), { from: { pos: 'b2', piece: PAWN_W }, to: { pos: 'c3', piece: PAWN_B } }); // TODO
    deepEqual(moveFromString('O-O-O', Board.fromFen(`8/8/8/8/8/8/PPPPPPPP/R3KBNR w KQkq - 0 1`)), [{ from: { piece: KING_W, pos: 'e1' }, to: { piece: EMPTY, pos: 'c1' } }, { from: { piece: ROOK_W, pos: 'a1' }, to: { piece: EMPTY, pos: 'd1' } }]);
});

test('moveToString', (_t) => {
    equal('b4', moveToString({ from: { pos: 'b2', piece: PAWN_W }, to: { pos: 'b4', piece: EMPTY } }));
    //equal('b4+', moveToString({ from: { pos: 'b2', piece: PAWN_W }, to: { pos: 'b4', piece: KING_B } }));
    equal('bxc3', moveToString({ from: { pos: 'b2', piece: PAWN_W }, to: { pos: 'c3', piece: PAWN_B } }));
    equal('O-O-O', moveToString([{ from: { piece: KING_W, pos: 'e1' }, to: { piece: EMPTY, pos: 'c1' } }, { from: { piece: ROOK_W, pos: 'a1' }, to: { piece: EMPTY, pos: 'd1' } }]));
});

// log(b.toString())
