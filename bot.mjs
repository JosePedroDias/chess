import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

import { Board } from './board.mjs';
import { electNextMove } from './evaluate.mjs';

stdin.setEncoding('utf-8');

const rl = createInterface({
    input: stdin,
    output: stdout,
    terminal: false,
});

let b = Board.default();

let debug = false;

//let readyProm = Promise.resolve(); // override if something isn't ready

rl.on('line', (line) => {
    const words = line.split(' ');
    const [command, ...args] = words;

    //console.error(command, args);

    if (command === 'uci') {
        console.log(`id naivebot 0.0.1`);
    } else if (command === 'debug') {
        debug = args[0] === 'on';
        console.log(`debug is now ${debug ? 'on' : 'off'}`);
    } else if (command === 'isready') {
        //readyProm.then(() => console.log('readyok'));
        console.log('readyok');
    } else if (command === 'ucinewgame') {
        console.log('TODO');
    } else if (command === 'go') {
        electNextMove(b)
        .then((move) => {
            b = b.applyMove(move);
            console.log(`bestmove ${move}`);
        });
    } else if (command === 'position') {
        if (args[0] === 'startpos') {
            b = Board.default();
        } else {
            b = Board.fromFen(args[0]);
        }
        if (args[1] && args[1] === 'moves') {
            const [_, __, ...moves] = args;
            for (let mv of moves) b = b.applyMove(mv);
        }
        console.log(b.toString()); // TODO ASCII ART
        console.log(b._params);
    } else if (command === 'quit') {
        rl.close();
    } else { // setoption, register
        console.log(`ignoring unsupported command: ${command}`);
    }
});
