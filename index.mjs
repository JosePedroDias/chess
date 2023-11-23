import { Board } from './board.mjs';
import { material } from './evaluate.mjs';
import { kingMoves, queenMoves, rookMoves, bishopMoves, knightMoves, pawnMoves } from './moves.mjs';

const b = new Board();

//b.iterateCells((pos, _) => b.set(pos, pos));

//b.setFen(`8/8/8/8/8/8/8/8`);
//b.setFen(`rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR`);
//b.setFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1`);

//console.log(material(b, true));

b.fill('.');
const pos = 'c6';
//b.set(pos, 'k'); const moves = kingMoves(pos);
b.set(pos, 'q'); const moves = queenMoves(pos);
//b.set(pos, 'r'); const moves = rookMoves(pos);
//b.set(pos, 'b'); const moves = bishopMoves(pos);
//b.set(pos, 'n'); const moves = knightMoves(pos);
//b.set(pos, 'p'); const moves = pawnMoves(pos, false);
for (const mv of moves) b.set(mv, '*');

console.log( b.toString() );
