import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

stdin.setEncoding('utf-8');

let completerArr;

import { Board, WHITE } from './board.mjs';
import { electNextMove } from './evaluate.mjs';
import { moveToString, validMoves } from './moves.mjs';

const BOT_VS_BOT = true;
const HUMAN_SIDE = WHITE;

let b = Board.default();
//let b = Board.fromFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 b Kq h2 3 6`);

const rl = createInterface({
    input: stdin,
    output: stdout,
    terminal: true,
    completer: (line) => [completerArr.filter(it => it.includes(line)), line],
});

while (true) {
    console.log('\n\n');
    console.log(b.toPrettyString({
        //details: true,
        //fen: true,
    }));

    let move;
    try {
        if (!BOT_VS_BOT && b._params.next === HUMAN_SIDE) {
            const moves = validMoves2(b);
            completerArr = moves;
            do {
                move = await rl.question('move?');
                if (move === '') console.log(b.getPgn());
            } while (!moves.includes(move));
        } else {
            move = electNextMove(b);
        }
    } catch (err) {
        console.log(err);
        //break;
        process.exit(0);
    }

    console.log(`best move: ${move}`);
    b = b.applyMove(move, true);
}
