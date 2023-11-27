import test from 'node:test';
import { deepEqual, throws } from 'node:assert/strict';
// https://nodejs.org/dist/latest-v20.x/docs/api/assert.html

import { log } from './testUtils.mjs';
import {
    flatten1Level,
    zip2,
    zip3,
    intersection,
    subtraction,
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
