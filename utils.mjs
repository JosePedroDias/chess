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
