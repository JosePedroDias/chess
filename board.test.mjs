import test from 'node:test';
import { equal, deepEqual, notDeepEqual } from 'node:assert/strict';

//import { log } from './utils.mjs';
import { Board } from './board.mjs';

test('empty board', (_t) => {
    const b = Board.empty();
    equal(b.toString(),
`               
               
               
               
               
               
               
               `);
    equal(b._params.next, 'w');
    deepEqual(b._params.castling.split('').sort(), 'KQkq'.split(''));
    equal(b._params.enPassantPos, '-');
    equal(b._params.halfMoveClock, 0);
    equal(b._params.fullMoveNumber, 1);
});

test('default board', (_t) => {
    const b = Board.default();
    equal(b.toString(),
`r n b q k b n r
p p p p p p p p
               
               
               
               
P P P P P P P P
R N B Q K B N R`);
    equal(b._params.next, 'w');
    deepEqual(b._params.castling.split('').sort(), 'KQkq'.split(''));
    equal(b._params.enPassantPos, '-');
    equal(b._params.halfMoveClock, 0);
    equal(b._params.fullMoveNumber, 1);
});

test('setFen', (_t) => {
    const b = new Board();
    b.setFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 b Kq h2 3 6`);
    equal(b.toString(),
`r   b k       r
p     p B p N p
n         n    
  p   N P     P
            P  
      P        
P   P   K      
q           b  `);
    equal(b._params.next, 'b');
    deepEqual(b._params.castling.split('').sort(), 'Kq'.split(''));
    equal(b._params.enPassantPos, 'h2');
    equal(b._params.halfMoveClock, 3);
    equal(b._params.fullMoveNumber, 6);
});

test('cell positions and iterateCells', (_t) => {
    const b = new Board();
    b.iterateCells((pos, _) => b.set(pos, pos));
    equal(b.toString(),
`a8 b8 c8 d8 e8 f8 g8 h8
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
    b.setFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 b Kq h2 3 6`);
    equal(b.getFen(), `r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 b Kq h2 3 6`);
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
    b3._params.next = 'b';
    notDeepEqual(b, b3);
});

test('applyMove', (_t) => {
    _t.todo();
})

// log(b.toString())
