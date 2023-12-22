import { isEmpty, isKing } from './pieces.mjs';
import { Board, EMPTY } from './board.mjs';
import { randomFromArr } from './utils.mjs';
import { isChecking, deltaMovesXY } from './move.mjs';

export async function puzzle(pieces) {
    if (typeof pieces === 'string') pieces = pieces.split('');
    if (!pieces.includes('k')) pieces.unshift('k');
    if (!pieces.includes('K')) pieces.unshift('K');
    
    const b = Board.empty();
    while (true) {
        const p = pieces.shift();
        if (!p) return b;
        const emptyPositions = b.positionsHaving(isEmpty);
        const pos = randomFromArr(emptyPositions);
        b.set(pos, p);
        try {
            if (await isChecking(b, true )) throw 'check';
            if (await isChecking(b, false)) throw 'check';

            if (isKing(p)) {
                const kingPositions = b.positionsHaving(isKing);
                if (kingPositions.length > 1) {
                    const [p1, p2] = kingPositions;
                    const [dx, dy] = deltaMovesXY(p1, p2);
                    if ((Math.abs(dx) < 2) && (Math.abs(dy) < 2)) throw 'kings are too close';
                }
            }
        } catch (err) {
            //console.log(err);
            b.set(pos, EMPTY);
            pieces.unshift(p);
        }
    }
}
