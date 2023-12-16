import test from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';

import { Board } from './board.mjs';
import { isChecking, isBeingAttacked, isMoveCapture, moveToObject, moveToPgn } from './move.mjs';
import { computeOutcomes } from './evaluate.mjs';

test('moveToObject not capturing', (_t) => {
    _t.todo('B, R, Q, K, O-O, O-O-O');
    const b0 = Board.default();
    deepEqual(moveToObject('e2e4', b0), { from: 'e2', to: 'e4', piece: 'P', pieceChar: 'P', isCapture: false, promoPiece: undefined });
    deepEqual(moveToObject('e2e3', b0), { from: 'e2', to: 'e3', piece: 'P', pieceChar: 'P', isCapture: false, promoPiece: undefined });
    deepEqual(moveToObject('g1f3', b0), { from: 'g1', to: 'f3', piece: 'N', pieceChar: 'N', isCapture: false, promoPiece: undefined });
});

test('moveToObject capturing', (_t) => {
    _t.todo('P, N B, R, Q, K');
});

test('moveToPgn not capturing', async (_t) => {
    _t.todo('B, R, Q, K, O-O, O-O-O');
    const b0 = Board.default();
    equal(moveToPgn('e2e4', b0), 'e4');
    equal(moveToPgn('e2e3', b0), 'e3');

    equal(moveToPgn('g1f3', b0), 'Ng1f3');

    const out = await computeOutcomes(b0);
    const moves = out.moves;
    equal(moveToPgn('g1f3', b0, moves), 'Nf3');
});

test('isMoveCapture', (_t) => {
    const b = Board.fromFen(`8/8/1k6/4b3/8/3K1N2/r7/8 w - - 0 1`);
    equal(isMoveCapture(b, 'f3e5'), true);
    equal(isMoveCapture(b, 'f5g5'), false);
});

test('isChecking', (_t) => {
    const b0 = Board.default();
    equal(isChecking(b0, true), false);

    const b = Board.fromFen(`1nbqk1nr/1ppp1ppp/4p3/8/2P1P3/3P4/3B1PPP/3rK1NR w KQk - 0 11`);
    equal(isChecking(b, false), true);
});

test('isBeingAttacked', (_t) => {
    // TODO
});

// TODO PAWN TAKES ARE FILTERED IF NO ENEMY THERE OR HAS BEEN THERE (EN PASSANT)

// TODO KING CASTLING OK
// TODO KING CASTLING NOK BECAUSE FLAGS
// TODO KING CASTLING NOK BECAUSE NON EMPTY
// TODO KING CASTLING NOK BECAUSE POSITION CHECKED

// TODO VALID MOVES PROMOTION
