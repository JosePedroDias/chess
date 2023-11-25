import { Board, POSITIONS_TO_INDICES, INDICES_TO_POSITIONS, WHITE } from './board.mjs';
import {
    KING_W, KING_B,
    QUEEN_W, QUEEN_B,
    ROOK_W, ROOK_B,
    BISHOP_W, BISHOP_B,
    KNIGHT_W, KNIGHT_B,
    PAWN_W, PAWN_B,
    isPiece, isWhitePiece, isBlackPiece,
} from './pieces.mjs';

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

function xyToValidPosition(xy) {
    const idx = indexFromXY(xy);
    if (idx === undefined) return;
    return INDICES_TO_POSITIONS.get(idx);
}

// TODO: plus castling
export function kingMoves(pos) {
    const [x, y] = posToXY(pos);
    return [
        [x-1, y-1],
        [x,   y-1],
        [x+1, y-1],
        [x-1, y],
        [x+1, y],
        [x-1, y+1],
        [x,   y+1],
        [x+1, y+1],
    ].map((pos) => xysToValidPositions([pos]));
}

export function queenMoves(pos) {
    const [x, y] = posToXY(pos);
    const moves = [];
    const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (let [dx, dy] of dirs) {
        const dirMoves = [];
        for (let r = 1; r < 8; ++r)
            dirMoves.push([x + r*dx, y + r*dy]);
        moves.push(xysToValidPositions(dirMoves));
    }
    return moves;
}

export function rookMoves(pos) {
    const [x, y] = posToXY(pos);
    const moves = [];
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (let [dx, dy] of dirs) {
        const dirMoves = [];
        for (let r = 1; r < 8; ++r)
            dirMoves.push([x + r*dx, y + r*dy]);
        moves.push(xysToValidPositions(dirMoves));
    }
    return moves;
}

export function bishopMoves(pos) {
    const [x, y] = posToXY(pos);
    const moves = [];
    const dirs = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
    for (let [dx, dy] of dirs) {
        const dirMoves = [];
        for (let r = 1; r < 8; ++r)
            dirMoves.push([x + r*dx, y + r*dy]);
        moves.push(xysToValidPositions(dirMoves));
    }
    return moves;
}

export function knightMoves(pos) {
    const [x, y] = posToXY(pos);
    return [
        [x-1, y-2],
        [x-2, y-1],
        [x+1, y-2],
        [x+2, y-1],
        [x-1, y+2],
        [x-2, y+1],
        [x+1, y+2],
        [x+2, y+1],
    ].map((pos) => xysToValidPositions([pos]));
}

export function pawnMoves(pos, board) {
    const side = board._params.next;

    const [x, y] = posToXY(pos);
    const isWhite = side === WHITE;
    const dy = isWhite ? -1 : 1;

    const isCapturable = isWhite ? (p) => isBlackPiece(p) : (p) => isWhitePiece(p); 

    const capture1 = xyToValidPosition([x-1, y+dy]);
    const capture2 = xyToValidPosition([x+1, y+dy]);

    const advance1 = xyToValidPosition([x, y+dy]);
    let advance2;
    if ((isWhite && y === 6) || (!isWhite && y === 1)) {
        advance2 = xyToValidPosition([x, y+dy*2]);
    }

    const moves = [];

    if (advance1 && !isPiece(advance1)) moves.push([advance1]);
    if (advance2 && !isPiece(advance2)) moves.push([advance2]);

    let captured1 = false;

    if (capture1) {
        const pieceAtCap = board.get(capture1);
        if (isCapturable(pieceAtCap)) {
            moves.push([capture1]);
            captured1 = true;
        }
    }

    if (captured1 && capture2) {
        const pieceAtCap = board.get(capture2);
        if (isCapturable(pieceAtCap)) moves.push([capture2]);
    }

    return moves;
}

export function getMoves(board, piece, pos) {
    switch (piece) {
        case KING_W:
        case KING_B:
            return kingMoves(pos);
        case QUEEN_W:
        case QUEEN_B:
            return queenMoves(pos);
        case ROOK_W:
        case ROOK_B:
            return rookMoves(pos);
        case BISHOP_W:
        case BISHOP_B:
            return bishopMoves(pos);
        case KNIGHT_W:
        case KNIGHT_B:
            return knightMoves(pos);
        case PAWN_W:
        case PAWN_B:
            return pawnMoves(pos, board);
    }
}

export function illustrateMoves(moves, piece, pos, possibleMove = '*', nonMove = '.') {
    const b = Board.empty();
    b.fill(nonMove);
    b.set(pos, piece);
    for (const mv of moves) b.set(mv, possibleMove);
    return b;
}
