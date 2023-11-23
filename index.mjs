import { Board, kingMoves } from "./board.mjs";
//import { BG, FG } from './colors.mjs';

const b = new Board();
//b.iterateCells((pos, _) => b.set(pos, pos));
b.setFen(`8/8/8/8/8/8/8/8`);
//b.setFen(`rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR`);
//b.setFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1`);


b.fill('.');
const pos = 'h8';
b.set(pos, 'k');
const kms = kingMoves(pos);
//console.log(kms);
for (const mv of kms) b.set(mv, '*');

console.log( b.toString() );

//console.log( b._cells );

//console.log(`xx ${FG.black}${BG.white}AAAA${FG.reset}${BG.reset} bbb`);
