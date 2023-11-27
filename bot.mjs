import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

import { Board } from './board.mjs';
import { electNextMove } from './evaluate.mjs';
import { inbound, outbound, loggingDone } from './logger.mjs';

stdin.setEncoding('utf-8');

const rl = createInterface({
    input: stdin,
    output: stdout,
    terminal: true,
    //terminal: false,
});

let b = Board.default();

let debug = false;

//let readyProm = Promise.resolve(); // override if something isn't ready

const out = (msg) => {
    if (typeof msg !== 'string') msg = JSON.stringify(msg);
    outbound(msg);
    console.log(msg);
}

rl.on('line', (line) => {
    inbound(line);
    const words = line.split(' ');
    const [command, ...args] = words;

    if (command === 'uci') {
        out(`id name naivebot 0.0.1`);
        out(`id author José Pedro Dias`);
        out(`uciok`); // irrelevant?
    } else if (command === 'debug') {
        debug = args[0] === 'on';
        out(`debug is now ${debug ? 'on' : 'off'}`);
    } else if (command === 'isready') {
        //readyProm.then(() => console.log('readyok'));
        out('readyok');
    } else if (command === 'ucinewgame') {
        out('TODO');
    } else if (command === 'go') {
        electNextMove(b, out)
        .then((move) => {
            b = b.applyMove(move, true);
            out(`bestmove ${move}`);
        });
    } else if (command === 'position') {
        let otherArgs;
        if (args[0] === 'startpos') {
            b = Board.default();
            otherArgs = args.slice(1);
        } else {
            const fen = args.slice(0, 6).join(' ');
            b = Board.fromFen(fen);
            otherArgs = args.slice(6);
        }
        if (otherArgs[0] && otherArgs[0] === 'moves') {
            const moves = otherArgs.slice(1);
            for (let mv of moves) b = b.applyMove(mv);
        }
        out(b.toPrettyString({ details: true }));
    } else if (command === 'quit') {
        loggingDone();
        rl.close();
    } else { // setoption, register
        out(`ignoring unsupported command: ${command}`);
    }
});
