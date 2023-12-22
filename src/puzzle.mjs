import { isEmpty, isBishop, isKing } from './pieces.mjs';
import { Board, EMPTY, isWhiteCell } from './board.mjs';
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
            if (isKing(p)) {
                // kings can't be direct neighbors
                const [p1, p2] = b.positionsHaving(isKing);
                if (p2) {
                    const [dx, dy] = deltaMovesXY(p1, p2);
                    if ((Math.abs(dx) < 2) && (Math.abs(dy) < 2)) throw 'kings are too close';
                }
            } else if (isBishop(p)) {
                // bishops of the same side must occupy different cell colors (ie, there must be 1 white and 1 black bishop)
                const [p1, p2] = b.positionsHaving(p_ => p === p_);
                console.log('positions', p1, p2);
                if (p2) {
                    console.log('is', isWhiteCell(p1), isWhiteCell(p2));
                    if (isWhiteCell(p1) === isWhiteCell(p2)) throw 'bishops of this side are on a cell of the same color';
                }
            }

            if (await isChecking(b, true )) throw 'check';
            if (await isChecking(b, false)) throw 'check';
        } catch (err) {
            console.log(err);
            b.set(pos, EMPTY);
            pieces.unshift(p);
        }
    }
}
