import { randomFromArr } from './utils.mjs';
import { computeOutcomes } from './evaluate.mjs';

export async function playRandomBot(board) {
    const out = await computeOutcomes(board);
    return randomFromArr(out.moves);
}
