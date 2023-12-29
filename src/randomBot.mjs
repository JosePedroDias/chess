import { randomFromArr } from './utils.mjs';
import { computeOutcomes } from './evaluate.mjs';

export function playRandomBot(board) {
    const out = computeOutcomes(board);
    return randomFromArr(out.moves);
}
