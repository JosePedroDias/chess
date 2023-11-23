import { POSITIONS_TO_INDICES, INDICES_TO_POSITIONS } from './board.mjs';

function posToXY(pos) {
    const index = POSITIONS_TO_INDICES.get(pos);
    return xyFromIndex(index);
}

function indexFromXY([x, y]) {
    if (x < 0 || x > 7 || y < 0 || y > 7) return;
    return x + y * 8;
}

function xyFromIndex(index) {
    const y = Math.floor(index / 8);
    const x = index - 8 * y;
    return [x, y];
}

function xysToValidPositions(xys) {
    return xys
    .map(indexFromXY)
    .filter((v) => v !== undefined)
    .map((idx) => INDICES_TO_POSITIONS.get(idx));
}

// TODO: plus castling
export function kingMoves(pos) {
    const [x, y] = posToXY(pos);
    return xysToValidPositions([
        [x-1, y-1],
        [x,   y-1],
        [x+1, y-1],
        [x-1, y],
        [x+1, y],
        [x-1, y+1],
        [x,   y+1],
        [x+1, y+1],
    ]);
}

export function queenMoves(pos) {
    const [x, y] = posToXY(pos);
    const moves = [];
    const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (let [dx, dy] of dirs)
        for (let r = 1; r < 8; ++r)
            moves.push([x + r*dx, y + r*dy]);
    return xysToValidPositions(moves);
}

export function rookMoves(pos) {
    const [x, y] = posToXY(pos);
    const moves = [];
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (let [dx, dy] of dirs)
        for (let r = 1; r < 8; ++r)
            moves.push([x + r*dx, y + r*dy]);
    return xysToValidPositions(moves);
}

export function bishopMoves(pos) {
    const [x, y] = posToXY(pos);
    const moves = [];
    const dirs = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
    for (let [dx, dy] of dirs)
        for (let r = 1; r < 8; ++r)
            moves.push([x + r*dx, y + r*dy]);
    return xysToValidPositions(moves);
}

export function knightMoves(pos) {
    const [x, y] = posToXY(pos);
    return xysToValidPositions([
        [x-1, y-2],
        [x-2, y-1],
        [x+1, y-2],
        [x+2, y-1],
        [x-1, y+2],
        [x-2, y+1],
        [x+1, y+2],
        [x+2, y+1],
    ]);
}

// TODO: plus en passant kinda. it's a capture...
export function pawnMoves(pos, isWhite) {
    const [x, y] = posToXY(pos);
    const dy = isWhite ? -1 : 1;
    const moves = [
        [x-1, y+dy],
        [x,   y+dy],
        [x+1, y+dy],
    ];
    if ((isWhite && y === 6) || (!isWhite && y === 1)) {
        moves.push([x, y+dy*2])
    }

    return xysToValidPositions(moves);
}
