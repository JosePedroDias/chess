import { pc } from './vendor/colorette.mjs';
import { Board } from "./board.mjs";

const b = Board.default();

const tr1 = (p, isWhiteCell) => isWhiteCell ? pc.bgRed(p) : pc.bgRedBright(p);
const tr2 = (p, isWhiteCell) => isWhiteCell ? pc.bgGreen(p) : pc.bgGreenBright(p);

b.setTransformation('a2', tr1); b.setTransformation('a3', tr1);

b.setTransformation('b1', tr2); b.setTransformation('c3', tr2);

// console.log(b);
console.log(b.toString());

console.log('-------')

console.log(b.toPrettyString({ details: true }));
