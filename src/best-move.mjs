import test from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';

import { Board } from './board.mjs';
import { setup, playBoard, terminate } from './stockfish-node-wrapper.mjs';

await setup(20);

import { playZpBot } from './zpBot.mjs';

export async function playSfBot(board, maxMs = 2000) {
    const { bestMove } = await playBoard(board.getFen(), maxMs);
    return bestMove;
}

test(`puzzle move closer to promotion`, { skip: true }, async (_t) => {
    const b = Board.fromFen(`6k1/5p2/PR6/8/1P6/1Knp4/5r2/8 b - - 0 1`);
    //console.log(b.toString(true, true));
    const mv1 = playZpBot(b);
    const mv1_ = await playSfBot(b);
    console.log('zp:', mv1);
    console.log('sf1:', mv1_); // move pawn up
    equal(mv1, mv1_);
});

test(`puzzle checkmate in 3 (depth 5?)`, async (_t) => {
    let b = Board.fromFen(`3q1k1r/r2b4/p1p2ppp/1p2Rp2/7P/1BPQ1N2/PP3PP1/6K1 w - - 0 1`);
    console.log(b.toString(false, true));
    const mv1 = playZpBot(b);
    const mv1_ = await playSfBot(b);
    console.log('zp:', mv1);
    console.log('sf:', mv1_); // d3d6
    //equal(mv1, mv1_);

    b = b.applyMove(mv1_);
    const mv2_ = await playSfBot(b);
    console.log('sf2:', mv2_); // f8g7

    b = b.applyMove(mv2_);
    const mv3_ = await playSfBot(b);
    console.log('sf3:', mv3_); // e5d7

    b = b.applyMove(mv3_);
    const mv4_ = await playSfBot(b);
    console.log('sf4:', mv4_); // d8e7

    b = b.applyMove(mv4_);
    const mv5_ = await playSfBot(b);
    console.log('sf5:', mv5_); // d6e7
});

// 

test('last', () => {
    terminate();
});
