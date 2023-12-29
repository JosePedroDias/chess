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
    const [a, b] = o.pressure;
    o.score =   (o.isCheckmate                   ?                     100  : 0) +
                //(o.isCheck                       ?                     0.1  : 0) +
                (o.isGoldenMove                  ?                     1    : 0) +
                (o.isCapture     && b >  a       ?                     0.8  : 0) +
                (o.canBeCaptured && a >= b       ?                     0.8  : 0) +
                //(o.isPinSkewer                   ?                     0.25 : 0) +
                //(o.fork                          ?                     0.25 : 0) +
                (o.isPromotion                   ?                     0.5  : 0) +
                (o.isStalemate                   ?                    -5    : 0) +
                (o.bestMatDiff + o.worseMatDiff) * 0.2 +
                                           o.rnd * 0.05;
}

export function playZpBot(board) {
    const candidates = Array.from( (computeOutcomes(board)).moveAttributesMap.values() );
    candidates.forEach(heuristic1);
    sortDescByScore(candidates);
    //console.table(candidates);
    return candidates[0].move;
}

// TODO: minimax
// TODO: alpha-beta pruning
