import test from 'node:test';
import { equal } from 'node:assert/strict';

//import { log } from './testUtils.mjs';
import { flatten1Level } from './utils.mjs';
import { Board } from './board.mjs';
import { bishopMoves, kingMoves, knightMoves, pawnMoves, queenMoves, rookMoves } from './moves.mjs';

test('king moves', (_t) => {
    const b = Board.empty();
    b.fill('.');
    const pos = 'c6';
    b.set(pos, 'K');
    const moves = flatten1Level(kingMoves(pos));
    for (const mv of moves) b.set(mv, '*');
    equal(b.toString(),
`. . . . . . . .
. * * * . . . .
. * K * . . . .
. * * * . . . .
. . . . . . . .
. . . . . . . .
. . . . . . . .
. . . . . . . .`);
});

test('queen moves', (_t) => {
    const b = Board.empty();
    b.fill('.');
    const pos = 'e5';
    b.set(pos, 'Q');
    const moves = flatten1Level(queenMoves(pos));
    for (const mv of moves) b.set(mv, '*');
    equal(b.toString(),
`. * . . * . . *
. . * . * . * .
. . . * * * . .
* * * * Q * * *
. . . * * * . .
. . * . * . * .
. * . . * . . *
* . . . * . . .`);
});

test('rook moves', (_t) => {
    const b = Board.empty();
    b.fill('.');
    const pos = 'b2';
    b.set(pos, 'R');
    const moves = flatten1Level(rookMoves(pos));
    for (const mv of moves) b.set(mv, '*');
    equal(b.toString(),
`. * . . . . . .
. * . . . . . .
. * . . . . . .
. * . . . . . .
. * . . . . . .
. * . . . . . .
* R * * * * * *
. * . . . . . .`);
});

test('bishop moves', (_t) => {
    const b = Board.empty();
    b.fill('.');
    const pos = 'c4';
    b.set(pos, 'B');
    const moves = flatten1Level(bishopMoves(pos));
    for (const mv of moves) b.set(mv, '*');
    equal(b.toString(),
`. . . . . . * .
. . . . . * . .
* . . . * . . .
. * . * . . . .
. . B . . . . .
. * . * . . . .
* . . . * . . .
. . . . . * . .`);
});

test('knight moves', (_t) => {
    const b = Board.empty();
    b.fill('.');
    const pos = 'd5';
    b.set(pos, 'N');
    const moves = flatten1Level(knightMoves(pos));
    for (const mv of moves) b.set(mv, '*');
    equal(b.toString(),
`. . . . . . . .
. . * . * . . .
. * . . . * . .
. . . N . . . .
. * . . . * . .
. . * . * . . .
. . . . . . . .
. . . . . . . .`);
});

test('pawn moves double white', (_t) => {
    const b = Board.empty();
    b.fill('.');
    const pos = 'b2';
    b.set(pos, 'P');
    const moves = flatten1Level(pawnMoves(pos, true));
    for (const mv of moves) b.set(mv, '*');
    equal(b.toString(),
`. . . . . . . .
. . . . . . . .
. . . . . . . .
. . . . . . . .
. * . . . . . .
* * * . . . . .
. P . . . . . .
. . . . . . . .`);
});

test('pawn moves regular white', (_t) => {
    const b = Board.empty();
    b.fill('.');
    const pos = 'b3';
    b.set(pos, 'P');
    const moves = flatten1Level(pawnMoves(pos, true));
    for (const mv of moves) b.set(mv, '*');
    equal(b.toString(),
`. . . . . . . .
. . . . . . . .
. . . . . . . .
. . . . . . . .
* * * . . . . .
. P . . . . . .
. . . . . . . .
. . . . . . . .`);
});

test('pawn moves double black', (_t) => {
    const b = Board.empty();
    b.fill('.');
    const pos = 'g7';
    b.set(pos, 'p');
    const moves = flatten1Level(pawnMoves(pos, false));
    for (const mv of moves) b.set(mv, '*');
    equal(b.toString(),
`. . . . . . . .
. . . . . . p .
. . . . . * * *
. . . . . . * .
. . . . . . . .
. . . . . . . .
. . . . . . . .
. . . . . . . .`);
});

test('pawn moves regular black', (_t) => {
    const b = Board.empty();
    b.fill('.');
    const pos = 'g6';
    b.set(pos, 'p');
    const moves = flatten1Level(pawnMoves(pos, false));
    for (const mv of moves) b.set(mv, '*');
    equal(b.toString(),
`. . . . . . . .
. . . . . . . .
. . . . . . p .
. . . . . * * *
. . . . . . . .
. . . . . . . .
. . . . . . . .
. . . . . . . .`);
});

// log(b.toString())
