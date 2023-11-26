import test from 'node:test';
import { equal } from 'node:assert/strict';

import { pc } from './vendor/colorette.mjs';

import { log } from './testUtils.mjs';
import { BLACK, Board } from './board.mjs';
import { flatten1Level, zip3 } from './utils.mjs';
import { KING_W, QUEEN_W, ROOK_W, BISHOP_W, KNIGHT_W, PAWN_B, PAWN_W } from './pieces.mjs';
import { bishopMoves, kingMoves, knightMoves, pawnMoves, queenMoves, rookMoves, illustrateMoves, validMoves, moveToString, moveFromString, isMoveCapture, isMoveCheck } from './moves.mjs';

test('king moves', (_t) => {
    const pos = 'c6';
    const piece = KING_W;
    const moves = flatten1Level(kingMoves(pos, Board.empty()));
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

test('valid pawn moves start', { skip: true}, (_t) => {
    _t.todo();
    const b = Board.fromFen(`8/8/8/8/8/8/1P6/8 w - 0 1`);
    const moves = validMoves(b);
    log(moves);
})

/* test('valid moves', (_t) => {
    _t.todo();
    const b = Board.default();
    const moves = validMoves(b);
    const b2 = b.clone();
    for (const { from ,to } of moves) {
        const b3 = illustrateMoves([to.pos], pc.bgCyan(from.piece), from.pos, pc.bgMagenta(to.piece), '', b2);
        log(b3.toString());
    }
}); */

test('moveFromString', (_t) => {
    _t.todo();
});

if (false) { // TODO TESTED MANUALLY
    //const b = Board.default();
    //const b = Board.fromFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 b Kq h2 3 6`);
    // castling
    const b = Board.fromFen(`8/8/8/8/8/8/PPPPPPPP/R3KBNR w KQkq - 0 1`);
    //const b = Board.fromFen(`8/8/8/8/8/8/PPPPPPPP/RNBQK2R w KQkq - 0 1`);
    //const b = Board.fromFen(`r3kbnr/pppppppp/8/8/8/8/8/8 b KQkq - 0 1`);
    //const b = Board.fromFen(`rnbqk2r/pppppppp/8/8/8/8/8/8 b KQkq - 0 1`);

    //log(b.toPrettyString())
    const moves = validMoves(b);
    //console.log(moves);

    const moveStrings = moves.map(moveToString);

    //log(moveStrings);

    const moves2 = moveStrings.map((st) => moveFromString(st, b));
    //deepEqual(moves, moves2)

    const trios = zip3(moves, moveStrings, moves2);
    for (const [a, b, c] of trios) {
        if (JSON.stringify(a) === JSON.stringify(c)) continue;
        log('a');
        log(a);
        log('b');
        log(b);
        log('c');
        log(c);
        log('------')
    }

    if (false) {
        const tr1 = (p, isWhiteCell) => isWhiteCell ? pc.bgRedBright(p) : pc.bgRed(p);
        const tr2 = (p, isWhiteCell) => isWhiteCell ? pc.bgGreenBright(p) : pc.bgGreen(p);

        for (const move of moves) {
            if (move instanceof Array) { // castling
                const b2 = b.clone();
                for (const { from, to } of move) {
                    b2.setTransformation(from.pos, tr1);
                    b2.setTransformation(to.pos, tr2);
                }
                log(b2.toPrettyString());
            } else {
                const { from, to } = move;
                const b2 = b.clone();
                b2.setTransformation(from.pos, tr1);
                b2.setTransformation(to.pos, tr2);
                log(b2.toPrettyString());
            }
        }
    }
}

// log(b.toString())
