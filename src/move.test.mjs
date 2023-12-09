import test from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';

import { Board, POSITIONS } from './board.mjs';
import { moveToObject, moveToPgn, validMoves } from './move.mjs';
import { randomFromArr } from './utils.mjs';
import { KING_W, KING_B } from './pieces.mjs';
import { setup, getValidMoves, terminate } from './stockfish-node-wrapper.mjs';

const USE_SF = true;

if (USE_SF) {
    await setup(20);
}

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

    b._params.castling = '-';

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
                console.log(`moves:     ${moves.join(',')}`);
                console.log(`moves sf:  ${movesSF.join(',')}`);
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


// TODO PAWN TAKES ARE FILTERED IF NO ENEMY THERE OR HAS BEEN THERE (EN PASSANT)

// TODO KING CASTLING OK
// TODO KING CASTLING NOK BECAUSE FLAGS
// TODO KING CASTLING NOK BECAUSE NON EMPTY
// TODO KING CASTLING NOK BECAUSE POSITION CHECKED

test('last', (_t) => {
    USE_SF && terminate();
});
