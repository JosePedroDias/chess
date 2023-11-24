export const STROKED = {
    k: '♔',
    q: '♕',
    r: '♖',
    b: '♗',
    n: '♘',
    p: '♙',
};

export const FILLED = {
    k: '♚',
    q: '♛',
    r: '♜',
    b: '♝',
    n: '♞',
    p: '♟︎',
};

export const DARK = {};
export const LIGHT = {};

for (const [k, v] of Object.entries(STROKED)) {
    LIGHT[k.toUpperCase()] = v;
    DARK[k] = v;
}

for (const [k, v] of Object.entries(FILLED)) {
    DARK[k.toUpperCase()] = v;
    LIGHT[k] = v;
}

/*
console.log('LIGHT');
console.log(LIGHT);

console.log('DARK');
console.log(DARK);
*/
