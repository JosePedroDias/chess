import test from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';

import { Board, POSITIONS } from './board.mjs';
import { isChecking, isMoveCapture, moveToObject, moveToPgn, validMoves } from './move.mjs';
import { diff, randomFromArr } from './utils.mjs';
import { KING_W, KING_B } from './pieces.mjs';
import { setup, getValidMoves, terminate } from './stockfish-node-wrapper.mjs';

const USE_SF = true;

if (USE_SF) {
    await setup(20);
}

test('moveToObject not capturing', (_t) => {
    _t.todo('B, R, Q, K, O-O, O-O-O');
    const b0 = Board.default();
    deepEqual(moveToObject('e2e4', b0), { from: 'e2', to: 'e4', piece: 'P', isCapture: false, promoPiece: undefined });
    deepEqual(moveToObject('e2e3', b0), { from: 'e2', to: 'e3', piece: 'P', isCapture: false, promoPiece: undefined });
    deepEqual(moveToObject('g1f3', b0), { from: 'g1', to: 'f3', piece: 'N', isCapture: false, promoPiece: undefined });
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
    //for (const move of moves) b.set(move.substring(2, 4), '*');
    console.log(b.toString() + `\n+---------------+ ${pos}`);
};

const getValidBoardWithPiece = (isWhite, piece, pos) => {
    let b = new Board();
    if (!isWhite) b = b.getInvertedBoard();

    const positions = new Set(POSITIONS);
    positions.delete(pos);

    // set white king if not adding it later
    if (piece !== KING_W) {
        const wKPos = randomFromArr(Array.from(positions));
        b.set(wKPos, KING_W);
        const wkMoves = validMoves(b, true);
        for (const mv of wkMoves) positions.delete(mv.substring(2, 4));
    }
    
    // set black king if not adding it later
    if (piece !== KING_B) {
        const bKPos = randomFromArr(Array.from(positions));
        b.set(bKPos, KING_B);
        const bkMoves = validMoves(b, false);
        for (const mv of bkMoves) positions.delete(mv.substring(2, 4));
    }

    // set piece
    b.set(pos, piece);

    b._params.castling = new Set();

    return b;
}

const customPositions = (xs, ys) => {
    const positions = [];
    for (const x of xs.split('')) {
        for (const y of ys.split('')) positions.push(`${x}${y}`);
    }
    return positions;
}

const valid = async (piece, isWhite, xs, ys) => {
    const iter = xs ? customPositions(xs, ys) : POSITIONS;
    for (const pos of iter) {
        const b = getValidBoardWithPiece(isWhite, piece, pos);
        const moves = validMoves(b);
        moves.sort();
        if (USE_SF) {
            const movesSF = await getValidMoves(b.getFen());
            movesSF.sort();
            try {
                deepEqual(moves, movesSF);
                //console.log('OK', piece, pos);
            } catch (err) {
                printBoard(b, moves, pos);
                console.log('NOK', piece, pos);
                //console.log(`moves:     ${moves.join(',')}`);
                //console.log(`moves sf:  ${movesSF.join(',')}`);
                console.log('a:bot;b:sf: ', diff(moves, movesSF));
                //throw err;
            }
        }
    }
}

test('validMoves P', async (_t) => await valid('P', true, 'abcdefgh', '2345678'));
test('validMoves p', async (_t) => await valid('p', false, 'abcdefgh', '1234567'));

test('validMoves R', async (_t) => await valid('R', true));
test('validMoves r', async (_t) => await valid('r', false));

test('validMoves B', async (_t) => await valid('B', true));
test('validMoves b', async (_t) => await valid('b', false));

test('validMoves N', async (_t) => await valid('N', true));
test('validMoves n', async (_t) => await valid('n', false));

test('validMoves N', async (_t) => await valid('N', true));
test('validMoves n', async (_t) => await valid('n', false));

test('validMoves Q', async (_t) => await valid('Q', true));
test('validMoves q', async (_t) => await valid('q', false));

test('validMoves K', async (_t) => await valid('K', true));
test('validMoves k', async (_t) => await valid('k', false));

test('king moves without getting checked', (_t) => {
    const b = Board.fromFen(`8/8/1k6/4b3/8/3K4/r7/8 w - - 0 1`);
    console.log(b.toString(false, true));
    const moves = validMoves(b, true);
    moves.sort();
    deepEqual(moves, ['d3c4', 'd3e3', 'd3e4']);
});

test('king moves without getting checked SF', async (_t) => {
    const moves = await getValidMoves('8/8/1k6/4b3/8/3K4/r7/8 w - - 0 1');
    moves.sort();
    deepEqual(moves, ['d3c4', 'd3e3', 'd3e4']);
});

test('isChecking', (_t) => {
    {
        const b = Board.fromFen(`8/4k3/8/8/8/5R2/8/1K6 w - - 0 1`);
        equal(isChecking(b, true), false);
    }
    {
        const b = Board.fromFen(`8/4k3/8/8/8/4R3/8/1K6 w - - 0 1`);
        equal(isChecking(b, true), true);
    }
});

test('isMoveCapture', (_t) => {
    const b = Board.fromFen(`8/8/1k6/4b3/8/3K1N2/r7/8 w - - 0 1`);
    equal(isMoveCapture(b, 'f3e5'), true);
    equal(isMoveCapture(b, 'f5g5'), false);
});

// TODO PAWN TAKES ARE FILTERED IF NO ENEMY THERE OR HAS BEEN THERE (EN PASSANT)

// TODO KING CASTLING OK
// TODO KING CASTLING NOK BECAUSE FLAGS
// TODO KING CASTLING NOK BECAUSE NON EMPTY
// TODO KING CASTLING NOK BECAUSE POSITION CHECKED

// TODO VALID MOVES PROMOTION

test('last', (_t) => {
    USE_SF && terminate();
});
