import test from 'node:test';
import { deepEqual, throws, ok } from 'node:assert/strict';

import {
    flatten1Level,
    zip2,
    zip3,
    intersection,
    subtraction,
    memoFactory,
    weightedRandom,
} from './utils.mjs';

test('flatten1Level', (_t) => {
    const arr1 = ['a', 2];
    deepEqual(flatten1Level(arr1), ['a', 2]);

    const arr2 = ['a', [2, 5], [true, 'b']];
    deepEqual(flatten1Level(arr2), ['a', 2, 5, true, 'b']);

    const arr3 = ['a', [2, 5, [6, 7]], [true, 'b']];
    deepEqual(flatten1Level(arr3), ['a', 2, 5, [6, 7], true, 'b']);
});

test('zip2', (_t) => {
    let arr1 = ['a', 'b', 'c'];
    let arr2 = [1, 2, 3];
    deepEqual(zip2(arr1, arr2), [['a', 1], ['b', 2], ['c', 3]]);

    arr1 = ['a', 'b', 'c', 'd'];
    arr2 = [1, 2, 3];
    throws(() => zip2(arr1, arr2));
});

test('zip3', (_t) => {
    let arr1 = ['a', 'b', 'c'];
    let arr2 = ['A', 'B', 'C'];
    let arr3 = [1, 2, 3];
    deepEqual(zip3(arr1, arr2, arr3), [['a', 'A', 1], ['b', 'B', 2], ['c', 'C', 3]]);

    arr1 = ['a', 'b', 'c', 'd'];
    arr2 = ['A', 'B', 'C'];
    arr3 = [1, 2, 3];
    throws(() => zip3(arr1, arr2, arr3));
});

test('intersection', (_t) => {
    deepEqual(intersection([2, 4, 6, 8], [1, 3, 5, 7]), []);
    deepEqual(intersection([2, 4, 6, 8], [3, 6, 9]), [6]);
});

test('subtraction', (_t) => {
    deepEqual(subtraction([2, 4, 6, 8], [1, 3, 5, 7]), [2, 4, 6, 8]);
    deepEqual(subtraction([2, 4, 6, 8], [3, 6, 9]), [2, 4, 8]);
});

test('memoFactory', (_t) => {
    const _sin = (n) => Math.sin(n);
    const sinMap = new Map();
    const sin = memoFactory(_sin, sinMap);
    deepEqual(sin(0), 0);
    deepEqual(sin(Math.PI/2), 1);
    deepEqual(sin(0), 0);
    deepEqual(sin(Math.PI/2), 1);
    deepEqual(sinMap, new Map([[0, 0], [Math.PI/2, 1]]));

    const _pow = (a, b) => Math.pow(a, b);
    const powMap = new Map();
    const pow = memoFactory(_pow, powMap, (a, b) => `${a}|${b}`);
    deepEqual(pow(1, 1), 1);
    deepEqual(pow(2, 1), 2);
    deepEqual(pow(1, 2), 1);
    deepEqual(pow(2, 2), 4);
    deepEqual(pow(1, 1), 1);
    deepEqual(pow(2, 1), 2);
    deepEqual(pow(1, 2), 1);
    deepEqual(pow(2, 2), 4);
    deepEqual(powMap, new Map([['1|1', 1], ['1|2', 1], ['2|1', 2], ['2|2', 4]]));
});

test('weightedRandom', (_t) => {
    const config = [
        ['a', 60], // 60% or 0.6
        ['b', 30], // 30% or 0.3
        ['c', 10], // 10% or 0.1
    ];
    const numRuns = 10000;
    const histo = { a: 0, b: 0, c: 0 };
    for (let i = 0; i < numRuns; ++i) {
        const outcome = weightedRandom(config);
        ++histo[outcome];
    }
    for (const k of Object.keys(histo)) histo[k] /= numRuns;

    const e = 0.01;

    ok(histo.a > 0.6 - e && histo.a < 0.6 + e);
    ok(histo.b > 0.3 - e && histo.b < 0.3 + e);
    ok(histo.c > 0.1 - e && histo.c < 0.1 + e);
});
