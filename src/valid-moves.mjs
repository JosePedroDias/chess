import { validMoves as _validMoves } from './valid-moves-mine.mjs';
// import { validMoves as _validMoves } from './valid-moves-sf.mjs';

const vm = new Map();
export function validMoves(board) {
    const unq = board.getUniqueString();
    const tmp = vm.get(unq);
    if (tmp) return tmp;
    const res = _validMoves(board);
    vm.set(unq, res);
    return res;
}

// to check memoize resources / impact
// setInterval(() => console.log(`vm:${vm.size}`), 5000);
