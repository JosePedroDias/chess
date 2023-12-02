import test from 'node:test';
import { equal, deepEqual, notDeepEqual } from 'node:assert/strict';

import { Board, WHITE, BLACK } from './board.mjs';

const SKIP_THEMED = true;

test('empty board', (_t) => {
    const b = Board.empty();
    equal(b.toString(),
`                
                
                
                
                
                
                
                `);
    equal(b._params.next, WHITE);
    deepEqual(b._params.castling.split('').toSorted(), 'KQkq'.split(''));
    equal(b._params.enPassantPos, '-');
    equal(b._params.halfMoveClock, 0);
    equal(b._params.fullMoveNumber, 1);
});

test('default board', (_t) => {
    const b = Board.default();
    equal(b.toString(),
` r n b q k b n r
 p p p p p p p p
                
                
                
                
 P P P P P P P P
 R N B Q K B N R`);
    equal(b._params.next, WHITE);
    deepEqual(b._params.castling.split('').toSorted(), 'KQkq'.split(''));
    equal(b._params.enPassantPos, '-');
    equal(b._params.halfMoveClock, 0);
    equal(b._params.fullMoveNumber, 1);
});

test('setFen', (_t) => {
    const b = new Board();
    b.setFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 b Kq h2 1 6`);
    equal(b.toString(),
` r   b k       r
 p     p B p N p
 n         n    
   p   N P     P
             P  
       P        
 P   P   K      
 q           b  `);
    equal(b._params.next, BLACK);
    deepEqual(b._params.castling.split('').toSorted(), 'Kq'.split(''));
    equal(b._params.enPassantPos, 'h2');
    equal(b._params.halfMoveClock, 1);
    equal(b._params.fullMoveNumber, 6);
});

test('cell positions and iterateCells', (_t) => {
    const b = new Board();
    for (const [pos] of b) b.set(pos, pos);
    equal(b.toString(),
` a8 b8 c8 d8 e8 f8 g8 h8
 a7 b7 c7 d7 e7 f7 g7 h7
 a6 b6 c6 d6 e6 f6 g6 h6
 a5 b5 c5 d5 e5 f5 g5 h5
 a4 b4 c4 d4 e4 f4 g4 h4
 a3 b3 c3 d3 e3 f3 g3 h3
 a2 b2 c2 d2 e2 f2 g2 h2
 a1 b1 c1 d1 e1 f1 g1 h1`);
});

test('getFen', (_t) => {
    const b = new Board();
    b.setFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 b Kq h2 1 6`);
    equal(b.getFen(), `r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 b Kq h2 1 6`);
});

test('set', (_t) => {
    const b = new Board();
    b.set('b2', 'K');
    equal(b.toString(),
`                
                
                
                
                
                
   K            
                `);
});

test('get', (_t) => {
    const b = new Board();
    b.set('b3', 'Q');
    equal(b.get('b3'), 'Q');
    equal(b.get('b4'), ' ');
});

test('clone', (_t) => {
    const b = new Board();
    const b2 = b.clone();
    const b3 = b.clone();
    deepEqual(b, b2);
    deepEqual(b, b3);
    b2.set('a1', 'R');
    notDeepEqual(b, b2);
    b3._params.next = BLACK;
    notDeepEqual(b, b3);
});

test('getPgn', (_t) => {
    const b = Board.default();
    b._moves = ['e4', 'e5', 'Nc3', 'Qf6', 'f3', 'Bc5'];
    equal(b.getPgn(), '1. e4 e5 2. Nc3 Qf6 3. f3 Bc5');
});

test('getPgn odd num of moves', (_t) => {
    const b = Board.default();
    b._moves = ['e4', 'e5', 'Nc3', 'Qf6', 'f3'];
    equal(b.getPgn(), '1. e4 e5 2. Nc3 Qf6 3. f3');
});

test('applyMove', (_t) => {
    {
        // regular king move
        const b = Board.fromFen(`k7/8/8/8/8/8/8/7K w - - 0 1`);
        const b2 = b.applyMove('Kh1g1');
        equal(b2.getFen(), `k7/8/8/8/8/8/8/6K1 b - - 1 1`);
    }
    {
        // regular pawn move
        const b = Board.fromFen(`k7/8/7P/8/8/8/8/7K w - - 0 1`);
        const b2 = b.applyMove('h7');
        equal(b2.getFen(), `k7/7P/8/8/8/8/8/7K b - - 1 1`);
    }
    {
        // pawn move with promotion
        const b = Board.fromFen(`8/7P/8/8/k7/8/8/7K w - - 0 1`);
        const b2 = b.applyMove('h8=Q');
        equal(b2.getFen(), `7Q/8/8/8/k7/8/8/7K b - - 1 1`);
    }
});

test('toPrettyString simplest', { skip: SKIP_THEMED }, (_t) => {
    const b = Board.default();
    equal(b.toPrettyString({}),
` 8 ♖ ♘ ♗ ♕ ♔ ♗ ♘ ♖
 7 ♙ ♙ ♙ ♙ ♙ ♙ ♙ ♙
 6                
 5                
 4                
 3                
 2 ♟︎ ♟︎ ♟︎ ♟︎ ♟︎ ♟︎ ♟︎ ♟︎
 1 ♜ ♞ ♝ ♛ ♚ ♝ ♞ ♜
   a b c d e f g h`);
});

test('toPrettyString fromBlacks + details', { skip: SKIP_THEMED }, (_t) => {
    const b = Board.default();
    equal(b.toPrettyString({ fromBlacks: true, details: true }),
` 1 ♜ ♞ ♝ ♚ ♛ ♝ ♞ ♜
 2 ♟︎ ♟︎ ♟︎ ♟︎ ♟︎ ♟︎ ♟︎ ♟︎
 3                
 4                
 5                
 6                
 7 ♙ ♙ ♙ ♙ ♙ ♙ ♙ ♙
 8 ♖ ♘ ♗ ♔ ♕ ♗ ♘ ♖
   h g f e d c b a
next: white
en passant: -
castling: KQkq
half: 0  move #: 1`);
});