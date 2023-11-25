import test from 'node:test';
import { equal } from 'node:assert/strict';

import { pc } from './vendor/picocolors.mjs';

import { log } from './testUtils.mjs';
import { Board } from './board.mjs';
import { illustrateMoves } from './moves.mjs';
import { material, validMoves, electNextMove } from './evaluate.mjs';

test('material empty', (_t) => {
    const b = Board.empty();
    equal(material(b, true), 0);
});

test('material queen is worth 9', (_t) => {
    const b = Board.empty();
    b.set('b4', 'Q');
    equal(material(b, true), 9);
});

test('material losing', (_t) => {
    const b = Board.fromFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1`);
    equal(material(b, true), -21);
});

test('material winning', (_t) => {
    const b = Board.fromFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1`);
    equal(material(b, false), 21);
});

/* test('valid moves', (_t) => {
    _t.todo();
    const b = Board.default();
    const moves = validMoves(b);
    const b2 = b.clone();
    for (const { from ,to } of moves) {
        const b3 = illustrateMoves([to.pos], pc.bgCyan(from.piece), from.pos, pc.bgMagenta(to.piece), '', b2);
        log(b3.toString());
    }
}); */

test('elect new move', async (_t) => {
    _t.todo();
    const b = Board.default();
    const move = await electNextMove(b);
    equal(move, 'b2b3');
});

// log(b.toString())

//console.log(`before ${blue('blue')} ${red('red')} after`)
//log(`before ${blue('blue')} ${red('red')} after`)


if (false) {
    //const b = Board.default();
    const b = Board.fromFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 b Kq h2 3 6`);
    const moves = validMoves(b);

    for (const { from, to } of moves) {
        const b2 = b.clone();
        //log({ from, to })
        //const b3 = illustrateMoves([to.pos], pc.bgCyan(from.piece), from.pos, pc.bgMagenta(to.piece), '*', '+', b2);
        //const b3 = illustrateMoves([to.pos], pc.bgCyan(from.piece), from.pos, pc.bgMagenta(to.piece), '*', b2);
        b2.set(from.pos, pc.bgCyan(from.piece));
        b2.set(to.pos, pc.bgBlue(to.piece));
        //b2.set(from.pos, from.piece);
        //b2.set(to.pos, to.piece);
        //log(pc.bgMagenta(b2.toString()));
        log(b2.toString());
        //console.log(b2.toString())
        log('\n --- // --- \n');
        //log(b2);
    }
}

/* 
console.log(
    'before',
    blue("I'm blue"),
    bold(blue("da ba dee")),
    underline(bold(blue("da ba daa"))),
    'end'
)
 */
