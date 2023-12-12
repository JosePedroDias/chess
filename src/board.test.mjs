import test from 'node:test';
import { equal, deepEqual, notDeepEqual } from 'node:assert/strict';

import { Board, WHITE, BLACK } from './board.mjs';

test('empty board', (_t) => {
    const b = Board.empty();
    equal(b.toString(),
`                
                
                
                
                
                
                
                `);
    equal(b._params.next, WHITE);
    deepEqual(b._params.castling, new Set(['K', 'Q', 'k', 'q']));
    equal(b._params.enPassant, undefined);
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
    deepEqual(b._params.castling, new Set(['K', 'Q', 'k', 'q']));
    equal(b._params.enPassant, undefined);
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
    deepEqual(b._params.castling, new Set(['K', 'q']));
    equal(b._params.enPassant, 'h2');
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
    const moves = ['g1f3', 'b8a6', 'f3e5', 'h7h6', 'f2f4', 'f7f6', 'g2g3', 'f6e5', 'f1h3', 'e5f4', 'e1g1', 'f4g3', 'd1e1', 'g3h2', 'g1h2', 'h8h7', 'b2b4', 'a6b4', 'c2c3', 'b4a2', 'c1a3', 'a2c3', 'd2c3', 'c7c5'];
    let b = Board.default();
    for (const mv of moves) b = b.applyMove(mv);
    equal(b.getPgn(), '1. Ng1f3 Nb8a6 2. Nf3e5 h6 3. f4 f6 4. g3 xe5 5. Bf1h3 xf4 6. O-O xg3 7. Qd1e1 xh2 8. Kg1xh2 Rh8h7 9. b4 Na6xb4 10. c3 Nb4xa2 11. Bc1a3 Na2xc3 12. xc3 c5');
});

test('getPgn odd num of moves', (_t) => {
    const moves = ['g1f3', 'b8a6', 'f3e5', 'h7h6', 'f2f4', 'f7f6', 'g2g3', 'f6e5', 'f1h3', 'e5f4', 'e1g1', 'f4g3', 'd1e1', 'g3h2', 'g1h2', 'h8h7', 'b2b4', 'a6b4', 'c2c3', 'b4a2', 'c1a3', 'a2c3', 'd2c3'];
    let b = Board.default();
    for (const mv of moves) b = b.applyMove(mv);
    equal(b.getPgn(), '1. Ng1f3 Nb8a6 2. Nf3e5 h6 3. f4 f6 4. g3 xe5 5. Bf1h3 xf4 6. O-O xg3 7. Qd1e1 xh2 8. Kg1xh2 Rh8h7 9. b4 Na6xb4 10. c3 Nb4xa2 11. Bc1a3 Na2xc3 12. xc3');
});

test('applyMove', (_t) => {
    {
        // regular king move
        const b = Board.fromFen(`k7/8/8/8/8/8/8/7K w - - 0 1`);
        const b2 = b.applyMove('h1g1');
        equal(b2.getFen(), `k7/8/8/8/8/8/8/6K1 b - - 1 1`);
    }
    {
        // regular pawn move
        const b = Board.fromFen(`k7/8/7P/8/8/8/8/7K w - - 0 1`);
        const b2 = b.applyMove('h6h7');
        equal(b2.getFen(), `k7/7P/8/8/8/8/8/7K b - - 1 1`);
    }
    {
        // pawn move with promotion
        const b = Board.fromFen(`8/7P/8/8/k7/8/8/7K w - - 0 1`);
        const b2 = b.applyMove('h7h8q');
        equal(b2.getFen(), `7Q/8/8/8/k7/8/8/7K b - - 1 1`);
    }
    {
        // castling move
        const b = Board.fromFen(`rnbqkbnr/pppppppp/8/8/8/6P1/PPPPPP1P/RNBQK2R w KQkq - 0 1`);
        const b2 = b.applyMove('e1g1');
        equal(b2.getFen(), `rnbqkbnr/pppppppp/8/8/8/6P1/PPPPPP1P/RNBQ1RK1 b kq - 1 1`);
    }
});
