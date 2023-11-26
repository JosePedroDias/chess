import { Board } from './board.mjs';
import { electNextMove } from './evaluate.mjs';

let b = Board.default();
//let b = Board.fromFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 b Kq h2 3 6`);
//let b = Board.fromFen(`8/8/8/8/8/8/PPPPPPPP/R3KBNR w KQkq - 0 1`);
//let b = Board.fromFen(`8/8/8/8/8/8/PPPPPPPP/RNBQK2R w KQkq - 0 1`);
//let b = Board.fromFen(`r3kbnr/pppppppp/8/8/8/8/8/8 b KQkq - 0 1`);
//let b = Board.fromFen(`rnbqk2r/pppppppp/8/8/8/8/8/8 b KQkq - 0 1`);

const debug = false;

const log = (msg) => console.log(msg);

while (b._params.fullMoveNumber < 20) {
//while (b._params.halfMoveClock === 0) {
    //console.log('\n\n'); console.log(b.toPrettyString({ details: true }));
    const move = await electNextMove(b, debug ? log: undefined);

    //const move = 'O-O-O';
    //const move = 'Ra1b1';

    //const move = 'O-O';
    //const move = 'Rh1g1';

    //const move = 'o-o-o';
    //const move = 'Ra8b8';

    //const move = 'o-o';
    //const move = 'Rh8g8';

    console.log(`best move: ${move}`);
    b = b.applyMove(move);

    //console.log(b.toPrettyString({ details: true }));
}
