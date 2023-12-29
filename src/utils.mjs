export function flatten1Level(arrOfArrs) {
    return arrOfArrs.reduce((prev, curr) => prev.concat(curr), []);
}

export function zip2(arr1, arr2) {
    if (arr1.length !== arr2.length) throw new Error('arrays must be of the same length!');
    return arr1.map((el1, i1) => [el1, arr2[i1]]);
}

export function zip3(arr1, arr2, arr3) {
    if (arr1.length !== arr2.length || arr1.length !== arr3.length) throw new Error('arrays must be of the same length!');
    return arr1.map((el1, idx1) => [el1, arr2[idx1], arr3[idx1]]);
}

export function randomFloat(n) {
    return n * Math.random();
}

export function randomInt(n) {
    return Math.floor( n * Math.random() );
}

export function randomFromArr(arr) {
    const l = arr.length;
    const i = randomInt(l);
    return arr[i];
}

// array of [outcome, weight]
// TODO FIX BUG!!!
export function weightedRandom(arr) {
    const outcomeCuts = [];
    let accum = 0;
    for (const [out, weight] of arr) {
        accum += weight;
        outcomeCuts.push([out, accum]);
    }
    const r = accum * Math.random();
    let best;
    outcomeCuts.reverse();
    for (const [out, cutAt] of outcomeCuts) {
        if (r <= cutAt) best = out;
        else break;
    }
    return best;
}

export function diff(arr1, arr2) {
    const onlyInA = subtraction(arr1, arr2);
    const onlyInB = subtraction(arr2, arr1);
    //const int = intersection(arr1, arr2);
    const o = {};
    //if (int.length     > 0) o.int     = int;
    if (onlyInA.length > 0) o.onlyInA = onlyInA;
    if (onlyInB.length > 0) o.onlyInB = onlyInB;
    return o;
}

export function intersection(arr1, arr2) {
    const biggerArr = arr1.length >= arr2.length ? arr1 : arr2;
    const smallerArr = arr1.length < arr2.length ? arr1 : arr2;
    const biggerSet = new Set(biggerArr);
    const res = [];
    for (const it of smallerArr) {
        if (biggerSet.has(it)) res.push(it);
    }
    return res;
}

export function subtraction(arr1, arr2) {
    const resSet = new Set(arr1);
    for (const it of arr2) {
        resSet.delete(it);
    }
    return Array.from(resSet);
}

export function histogram(arr) {
    const res = {};
    for (const it of arr) {
        if (!res[it]) res[it] = 0;
        res[it]++;
    }
    return res;
}

export const identity = (a) => a;

export const alwaysTrue = () => true;

export const memoFactory = (fn, map, keyFn = identity) => (a, b) => {
    let k = keyFn(a, b);
    if (map.has(k)) return map.get(k);
    const v = fn(a, b);
    map.set(k, v);
    //console.log(`${fn.name} memo recorded #${map.size}`);
    return v;
}

export const times = (n) => {
    return new Array(n).fill(true).map((_, i) => i);
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// export const randomColor = () => `rgb(${randomInt(256)}, ${randomInt(256)}, ${randomInt(256)})`;
export const randomColor = () => `hsl(${randomFloat(360)}, 30%, ${35 + randomFloat(30)}%)`;

//const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function randomString(n = 5) {
    let str = '';
    for (let i = 0; i < n; i++) {
        str += ALPHABET[randomInt(ALPHABET.length)];
    }
    return str;
}

export function clamp(n, min, max) {
    if (n < min) return min;
    if (n > max) return max;
    return n;
}

export function pairUp(arr) {
    return arr.reduce((prev, curr, idx) => {
        if (idx % 2 === 0) prev.push([curr]);
        else prev[prev.length - 1].push(curr);
        return prev;
    }, []);
}
