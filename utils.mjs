export function flatten1Level(arrOfArrs) {
    return arrOfArrs.reduce((prev, curr) => prev.concat(curr), []);
}
