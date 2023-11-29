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

export function randomInt(n) {
    return Math.floor( n * Math.random() );
}

export function randomFromArr(arr) {
    const l = arr.length;
    const i = randomInt(l);
    return arr[i];
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

export const identity = (a) => a;

export const memoFactory = (fn, map, keyFn = identity) => (a, b) => {
    let k = keyFn(a, b);
    let v = map.get(k);
    if (v) return v;
    v = fn(a, b);
    map.set(k, v);
    return v;
}
