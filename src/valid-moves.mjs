import { validMoves as _validMoves } from './valid-moves-mine.mjs';
// import { validMoves as _validMoves } from './valid-moves-sf.mjs';

const vmMap = new Map();
export async function validMoves(board) {
    const unq = board.getUniqueString();
    const tmp = vmMap.get(unq);
    if (tmp) return tmp;
    const res = await _validMoves(board);
    vmMap.set(unq, res);
    return res;
}
