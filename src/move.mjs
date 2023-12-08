import { EMPTY } from './board.mjs';
import { isKing } from './pieces.mjs';

export const CASTLE_QUEENSIDE = 'O-O-O';
export const CASTLE_KINGSIDE = 'O-O';
export const CASTLE_MOVES = [CASTLE_QUEENSIDE, CASTLE_KINGSIDE];

function posToXY(pos) {
    const index = POSITIONS_TO_INDICES.get(pos);
    return xyFromIndex(index);
}

function isXYValid([x, y]) {
    if (x < 0 || x > 7 || y < 0 || y > 7) return;
    return true;
}

// returns undefined for indices outside the board
/* function indexFromXY([x, y]) {
    if (x < 0 || x > 7 || y < 0 || y > 7) return;
    return x + y * 8;
} */

function deltaMovesXY(pos1, pos2) {
    const xy1 = posToXY(pos1);
    const xy2 = posToXY(pos2);
    return [
        xy2[0] - xy1[0],
        xy2[1] - xy1[1],
    ];
}

export function moveFromPgn(pgnMove, board) {
    // TODO
}

/*
    {
        from:     [a-h][1-8]
        to        [a-h][1-8]
        piece     [PNBRQK]
        from2?    [a-h][1-8]
        to2?      [a-h][1-8]
        //piece2? R
        isCapture boolean
    }
*/
export function moveToObject(move, board) {
    const from = move.substring(0, 2);
    const to = move.substring(2, 4);
    const piece = board.get(from).toUpperCase();
    const isCapture = board.get(to) !== EMPTY;
    const o = { piece, from, to, isCapture };

    // castle
    if (isKing(piece) && Math.abs(deltaMovesXY(from, to)[0]) > 1) {
        const fromRank = from[1]; // '1'|'8' (whites, blacks)
        const toFile = to[0];     // 'g'|'c' (king, queen side)
        const isKingSide = toFile === 'g';
        o.from2 = isKingSide ? `h${fromRank}` : `a${fromRank}`;
        o.to2 = isKingSide ? `f${fromRank}` : `d${fromRank}`;
        //o.piece2 = 'R';
    }
    
    return o;
}

export function moveToPgn(move, board) {
    const o = moveToObject(move, board);
    if (o.from2) return o.to[0] === 'g' ? CASTLE_KINGSIDE : CASTLE_QUEENSIDE;
    if (o.piece === 'P') return o.isCapture ? 'x' + o.to : o.to;
    return `${o.piece}${o.from}${o.isCapture ? 'x' : ''}${o.to}`;
}
