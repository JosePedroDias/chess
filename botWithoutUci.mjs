import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

stdin.setEncoding('utf-8');

let completerArr;

import { Board, WHITE } from './board.mjs';
import { electNextMove } from './evaluate.mjs';
import { moveToString, validMoves } from './moves.mjs';

const BOT_VS_BOT = false;
const HUMAN_SIDE = WHITE;

const debug = false;
const log = (msg) => console.log(msg);

let b = Board.default();
//let b = Board.fromFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 b Kq h2 3 6`);
//let b = Board.fromFen(`8/8/8/8/8/8/PPPPPPPP/R3KBNR w KQkq - 0 1`);
//let b = Board.fromFen(`8/8/8/8/8/8/PPPPPPPP/RNBQK2R w KQkq - 0 1`);
//let b = Board.fromFen(`r3kbnr/pppppppp/8/8/8/8/8/8 b KQkq - 0 1`);
//let b = Board.fromFen(`rnbqk2r/pppppppp/8/8/8/8/8/8 b KQkq - 0 1`);

const rl = createInterface({
    input: stdin,
    output: stdout,
    terminal: true,
    completer: (line) => [completerArr.filter(it => it.includes(line)), line],
});

//while (b._params.fullMoveNumber < 20) {
//while (b._params.halfMoveClock === 0) {
while (true) {
    console.log('\n\n');
    console.log(b.toPrettyString({
        details: true,
        //fen: true,
    }));

    let move;
    try {
        if (!BOT_VS_BOT && b._params.next === HUMAN_SIDE) {
            const possibleMoves = validMoves(b).map(moveToString);
            completerArr = possibleMoves;
            //possibleMoves.forEach((mv) => console.log(`* ${mv}`));
            do {
                move = await rl.question('move?');
                if (move === '') console.log(b.getPgn());
            } while (!possibleMoves.includes(move));
        } else {
            move = await electNextMove(b, debug ? log: undefined);
        }
    } catch (err) {
        console.log(err);
        break;
    }

    //const move = 'O-O-O';
    //const move = 'Ra1b1';

    //const move = 'O-O';
    //const move = 'Rh1g1';

    //const move = 'o-o-o';
    //const move = 'Ra8b8';

    //const move = 'o-o';
    //const move = 'Rh8g8';

    console.log(`best move: ${move}`);
    b = b.applyMove(move, true);

    //console.log(b.toPrettyString({ details: true }));
}
