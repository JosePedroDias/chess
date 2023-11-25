import { Board } from "./board.mjs";

const b = Board.default();

// console.log(b);
console.log(b.toString());

console.log('-------')

console.log(b.toPrettyString({ details: true }));
