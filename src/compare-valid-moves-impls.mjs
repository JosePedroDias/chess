import { Board } from './board.mjs';
import { diff, randomFromArr } from './utils.mjs';
import { isChecking } from './move.mjs';
import { setup, terminate } from './stockfish-node-wrapper.mjs';
import { validMoves as validMovesMine } from './valid-moves-mine.mjs';
import { validMoves as validMovesSF } from './valid-moves-sf.mjs';

await setup(20);

let b = Board.default();

while (true) {
    console.log('BOARD', b.getFen());
    console.log('am i in check?', isChecking(b, !b.isWhiteNext()));

    const vm1 = await validMovesMine(b);
    vm1.sort();

    const vm2 = await validMovesSF(b);
    vm2.sort();

    if (vm1.join('_') !== vm2.join('_')) {
        //console.log(`FEN: ${b.getFen()}`);
        console.log(b.toString());

        // console.log(`\na) zpBot:`);     console.log(vm1);
        // console.log(`\nb) stockfish:`); console.log(vm2);

        const { onlyInA, onlyInB } = diff(vm1, vm2);
        onlyInA && console.log(`\nonly in zpBot:`, onlyInA);
        onlyInB && console.log(`\nonly in stockfish:`, onlyInB);

        let differentMoves = [];
        if (onlyInA) differentMoves = differentMoves.concat(onlyInA);
        if (onlyInB) differentMoves = differentMoves.concat(onlyInB);
        //console.log(differentMoves);

        for (const move of differentMoves) {
            const from = move.substring(0, 2);
            const to = move.substring(2, 4);
            const piece = b.get(from);
            console.log(`${piece}: ${from} -> ${to}`);
        }

        process.exit(1);
    }

    if (vm1.length === 0) break;

    const move = randomFromArr(vm1);
    console.log(move);
    b = b.applyMove(move);
}

console.log('all done');

terminate();
