import test from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';

import { Board, EMPTY, POSITIONS } from './board.mjs';
import { moveToObject, moveToPgn, validMoves } from './move.mjs';

test('moveToObject not capturing', (_t) => {
    _t.todo('B, R, Q, K, O-O, O-O-O');
    const b0 = Board.default();
    deepEqual(moveToObject('e2e4', b0), { from: 'e2', to: 'e4', piece: 'P', isCapture: false });
    deepEqual(moveToObject('e2e3', b0), { from: 'e2', to: 'e3', piece: 'P', isCapture: false });
    deepEqual(moveToObject('g1f3', b0), { from: 'g1', to: 'f3', piece: 'N', isCapture: false });
});

test('moveToObject capturing', (_t) => {
    _t.todo('P, N B, R, Q, K');
});

test('moveToPgn not capturing', (_t) => {
    _t.todo('B, R, Q, K, O-O, O-O-O');
    const b0 = Board.default();
    equal(moveToPgn('e2e4', b0), 'e4');
    equal(moveToPgn('e2e3', b0), 'e3');
    equal(moveToPgn('g1f3', b0), 'Ng1f3');
});

test('moveToPgn capturing', (_t) => {
    _t.todo('P, N B, R, Q, K');
});

const printBoard = (b, moves, pos) => {
    for (const move of moves) b.set(move.substring(2, 4), '*');
    console.log(b.toString() + `\n+---------------+ ${pos}`);
};

const customPositions = (xs, ys) => {
    const positions = [];
    for (const x of xs.split('')) {
        for (const y of ys.split('')) {
            positions.push(`${x}${y}`);
        }
    }
    return positions;
}

test('validMoves P', (_t) => {
    for (const pos of customPositions('abcdefgh', '2345678')) {
        const b = new Board();
        b.set(pos, 'P');
        const moves = validMoves(b);
        printBoard(b, moves, pos);
    }
});

test('validMoves p', (_t) => {
    for (const pos of customPositions('abcdefgh', '1234567')) {
        const b = new Board();
        b.set(pos, 'p');
        const moves = validMoves(b, false);
        printBoard(b, moves, pos);
    }
});

test('validMoves R', (_t) => {
    for (const pos of POSITIONS) {
        const b = new Board();
        b.set(pos, 'R');
        const moves = validMoves(b);
        printBoard(b, moves, pos);
    }
});

test('validMoves R', (_t) => {
    for (const pos of POSITIONS) {
        const b = new Board();
        b.set(pos, 'r');
        const moves = validMoves(b, false);
        printBoard(b, moves, pos);
    }
});

test('validMoves B', (_t) => {
    for (const pos of POSITIONS) {
        const b = new Board();
        b.set(pos, 'B');
        const moves = validMoves(b);
        printBoard(b, moves, pos);
    }
});

test('validMoves b', (_t) => {
    for (const pos of POSITIONS) {
        const b = new Board();
        b.set(pos, 'b');
        const moves = validMoves(b, false);
        printBoard(b, moves, pos);
    }
});

test('validMoves N', (_t) => {
    for (const pos of POSITIONS) {
        const b = new Board();
        b.set(pos, 'N');
        const moves = validMoves(b);
        printBoard(b, moves, pos);
    }
});

test('validMoves n', (_t) => {
    for (const pos of POSITIONS) {
        const b = new Board();
        b.set(pos, 'n');
        const moves = validMoves(b, false);
        printBoard(b, moves, pos);
    }
});

test('validMoves Q', (_t) => {
    for (const pos of POSITIONS) {
        const b = new Board();
        b.set(pos, 'Q');
        const moves = validMoves(b);
        printBoard(b, moves, pos);
    }
});

test('validMoves q', (_t) => {
    for (const pos of POSITIONS) {
        const b = new Board();
        b.set(pos, 'q');
        const moves = validMoves(b, false);
        printBoard(b, moves, pos);
    }
});

test('validMoves K', (_t) => {
    for (const pos of POSITIONS) {
        const b = new Board();
        b.set(pos, 'K');
        const moves = validMoves(b);
        printBoard(b, moves, pos);
    }
});

test('validMoves k', (_t) => {
    for (const pos of POSITIONS) {
        const b = new Board();
        b.set(pos, 'k');
        const moves = validMoves(b, false);
        printBoard(b, moves, pos);
    }
});

// TODO PAWN TAKES ARE FILTERED IF NO ENEMY THERE OR HAS BEEN THERE (EN PASSANT)

// TODO KING CASTLING OK
// TODO KING CASTLING NOK BECAUSE FLAGS
// TODO KING CASTLING NOK BECAUSE NON EMPTY
// TODO KING CASTLING NOK BECAUSE POSITION CHECKED
