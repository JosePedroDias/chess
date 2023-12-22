import test from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';

import { puzzle } from './puzzle.mjs';

test('puzzle only kings', async (_t) => {
    const b = await puzzle('');
    console.log(b.toString()); console.log(b.getFen());
});

test('puzzle 2 white rooks', async (_t) => {
    const b = await puzzle('KkRR');
    console.log(b.toString()); console.log(b.getFen());
});

test('puzzle 2 white bishops', async (_t) => {
    const b = await puzzle('KkBB');
    console.log(b.toString()); console.log(b.getFen());
});

test('puzzle white queen and rook', async (_t) => {
    const b = await puzzle('KkQR');
    console.log(b.toString()); console.log(b.getFen());
});
