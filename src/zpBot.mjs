import { randomFloat } from './utils.mjs';
import { computeOutcomes } from './evaluate.mjs';

function sortDescByScore(arr) {
    arr.sort((a, b) => {
        a = a.score;
        b = b.score;
        return a > b ? -1 : a < b ? 1 : 0;
    });
}

function heuristic1(o) {
    o.score =   (o.isCheckmate                   ?                     100 : 0) +
                (o.isCapture && !o.canBeCaptured ?                     0.8 : 0) +
                (o.isPromotion                   ?                     0.5 : 0) +
                (o.isCapture &&  o.canBeCaptured ? randomFloat(0.5) - 0.15 : 0) +
                (o.isStalemate                   ?                      -5 : 0) +
                (o.bestMatDiff + o.worseMatDiff) * 0.2 +
                                           o.rnd * 0.05;
}

export async function playZpBot(board) {
    const candidates = Array.from( (await computeOutcomes(board)).moveAttributesMap.values() );
    candidates.forEach(heuristic1);
    sortDescByScore(candidates);
    console.table(candidates);
    return candidates[0].move;
}
