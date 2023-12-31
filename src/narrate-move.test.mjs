import test from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';

import { Board, EMPTY } from './board.mjs';
import { moveToObject } from './move.mjs';
import { getPieceName, narrateMove } from './narrate-move.mjs';

test('getPieceName', (_t) => {
    equal(getPieceName('K'), 'king');
    equal(getPieceName('Q'), 'queen');
    equal(getPieceName('R'), 'rook');
    equal(getPieceName('B'), 'bishop');
    equal(getPieceName('N'), 'knight');
    equal(getPieceName('P'), 'pawn');
});

test('narrateMove pawn move', (_t) => {
    const b = Board.default();
    equal(narrateMove('h2h3', b), `pawn to H3`);
    equal(narrateMove('g2g4', b), `pawn to G4`);
});

test('narrateMove pawn regular take', (_t) => {
    const b = Board.default();
    b.set('g7', EMPTY);
    b.set('g3', 'p');
    //console.log(b.toString());
    equal(narrateMove('h2g3', b), `pawn takes G3`);
});

test('narrateMove pawn en passant take', (_t) => {
    let b = Board.default();
    b.set('h7', EMPTY);
    b.set('h2', EMPTY);
    b.set('h5', 'P');
    b = b.getInvertedBoard();
    //console.log(b.toString());

    b = b.applyMove('g7g5');
    //console.log(b.toString());
    //console.log(b._params.enPassant); // g6

    //console.log(b.getFen());
    //const o = moveToObject('h5g6', b); console.log(o);

    //const b2 = b.applyMove('h5g6');
    //console.log(b2.getFen());
    //console.log(b2.toString());
    //console.log(b2._params.enPassant);

    equal(narrateMove('h5g6', b), `pawn takes G6 en passant`);
});

test('narrateMove knight move', (_t) => {
    const b = Board.default();
    equal(narrateMove('g1f3', b), `knight to F3`);
});

test('narrateMove knight take', (_t) => {
    const b = Board.default();
    b.set('f7', EMPTY);
    b.set('f3', 'p');
    equal(narrateMove('g1f3', b), `knight takes F3`);
});

test('narrateMove pawn promotion to queen', (_t) => {
    const b = Board.fromFen(`8/2k3P1/8/8/8/8/8/1K6 w - - 0 1`);
    equal(narrateMove('g7g8q', b), `pawn to G8 and promotes to queen`);
});

test('narrateMove pawn take and promotion to queen', (_t) => {
    const b = Board.fromFen(`6r1/2k4P/8/8/8/8/8/1K6 w - - 0 1`);
    equal(narrateMove('h7g8q', b), `pawn takes G8 and promotes to queen`);
});

test('narrateMove castling king side', (_t) => {
    const b = Board.fromFen(`rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQK2R w KQkq - 0 1`);
    equal(narrateMove('e1g1', b), `castling king side`);
});

test('narrateMove castling queen side', (_t) => {
    const b = Board.fromFen(`rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R3KBNR w KQkq - 0 1`);
    equal(narrateMove('e1c1', b), `castling queen side`);
});
