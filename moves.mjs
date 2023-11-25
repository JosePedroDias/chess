import { Board, POSITIONS_TO_INDICES, INDICES_TO_POSITIONS, WHITE, EMPTY } from './board.mjs';
import {
    KING_W, KING_B,
    QUEEN_W, QUEEN_B,
    ROOK_W, ROOK_B,
    BISHOP_W, BISHOP_B,
    KNIGHT_W, KNIGHT_B,
    PAWN_W, PAWN_B,
    isPiece, isWhitePiece, isBlackPiece,
} from './pieces.mjs';

const CASTLE_W_QUEENSIDE = 'O-O-O';
const CASTLE_B_QUEENSIDE = 'o-o-o';
const CASTLE_W_KINGSIDE = 'O-O';
const CASTLE_B_KINGSIDE = 'o-o';
const CASTLE_MOVES = [CASTLE_W_QUEENSIDE, CASTLE_B_QUEENSIDE, CASTLE_W_KINGSIDE, CASTLE_B_KINGSIDE];

export function isCastleMove(s) {
    return CASTLE_MOVES.includes(s);
}

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

export function kingMoves(pos, board) {
    const [x, y] = posToXY(pos);
    const moves = [
        [x-1, y-1],
        [x,   y-1],
        [x+1, y-1],
        [x-1, y],
        [x+1, y],
        [x-1, y+1],
        [x,   y+1],
        [x+1, y+1],
    ].map((pos) => xysToValidPositions([pos]));

    const side = board._params.next;
    const sideIsWhite = side === WHITE;

    const castlingFlags = board._params.castling;
    const canCastleKS = castlingFlags.indexOf(sideIsWhite ? KING_W : KING_B) !== -1;
    const canCastleQS = castlingFlags.indexOf(sideIsWhite ? QUEEN_W : QUEEN_B) !== -1;

    if (canCastleKS) {
        const posMustBeEmpty = sideIsWhite ? ['f1', 'g1'] : ['f8', 'g8'];
        const canDoIt = posMustBeEmpty.every((pos) => !isPiece(board.get(pos)));
        canDoIt && moves.push([sideIsWhite ? CASTLE_W_KINGSIDE : CASTLE_B_KINGSIDE]);
    }

    if (canCastleQS) {
        const posMustBeEmpty = sideIsWhite ? ['b1', 'c1', 'd1'] : ['b8', 'c8', 'd8'];
        const canDoIt = posMustBeEmpty.every((pos) => !isPiece(board.get(pos)));
        canDoIt && moves.push([sideIsWhite ? CASTLE_W_QUEENSIDE : CASTLE_B_QUEENSIDE]);
    }

    return moves;
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
    const sideIsWhite = side === WHITE;
    const dy = sideIsWhite ? -1 : 1;

    const canBeCaptured = sideIsWhite ? (p) => isBlackPiece(p) : (p) => isWhitePiece(p);

    const moves = [];

    const capture1Pos = xyToValidPosition([x-1, y+dy]);
    const capture2Pos = xyToValidPosition([x+1, y+dy]);
    if (capture1Pos) {
        if (canBeCaptured(board.get(capture1Pos)))
            moves.push([capture1Pos]);
    }
    if (capture2Pos) {
        if (canBeCaptured(board.get(capture2Pos)))
            moves.push([capture2Pos]);
    }

    const advance1Pos = xyToValidPosition([x, y+dy]);
    let advance2Pos;
    if ((sideIsWhite && y === 6) || (!sideIsWhite && y === 1)) {
        advance2Pos = xyToValidPosition([x, y+dy*2]);
    }
    const advanceMoves = [];
    if (advance1Pos && !isPiece(board.get(advance1Pos))) {
        advanceMoves.push(advance1Pos);
        if (advance2Pos && !isPiece(board.get(advance2Pos)))
            advanceMoves.push(advance2Pos);
    }
    if (advanceMoves.length > 0) moves.push(advanceMoves);

    return moves;
}

export function getMoves(board, piece, pos) {
    switch (piece) {
        case KING_W:
        case KING_B:
            return kingMoves(pos, board);
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

export function isMoveCapture(board, move) {
    // TODO
}

export function isMoveCheck(board, move) {
    // TODO
}

export function validMoves(board) {
    const side = board._params.next;
    const sideIsWhite = side === WHITE;
    const isOk = sideIsWhite ? (p) => !isWhitePiece(p) : (p) => !isBlackPiece(p);
    const moves = [];
    board.iteratePiecesOfSide(side, (pos, piece) => {
        const pieceMoves = getMoves(board, piece, pos);
        for (let directionArr of pieceMoves) {
            dirLoop: for (let pos2 of directionArr) {
                if (isCastleMove(pos2)) {
                    // TODO: check king in not in danger (check) nor during the move to destination

                    let toKingPos, fromRookPos, toRookPos;
                    const fromRook = sideIsWhite ? ROOK_W : ROOK_B;

                    // K: e1 -> g1; R: h1 -> f1
                    if      (pos2 === CASTLE_W_KINGSIDE) { toKingPos = 'g1'; fromRookPos = 'h1'; toRookPos = 'f1'; }
                    // K: e8 -> g8; R: h8 -> f8
                    else if (pos2 === CASTLE_B_KINGSIDE) { toKingPos = 'g8'; fromRookPos = 'h8'; toRookPos = 'f8'; }
                    // K: e1 -> c1; R: a1 -> d1
                    else if (pos2 === CASTLE_W_QUEENSIDE) { toKingPos = 'c1'; fromRookPos = 'a1'; toRookPos = 'd1'; }
                    // K: e8 -> c8; R: d8 -> d8
                    else if (pos2 === CASTLE_B_QUEENSIDE) { toKingPos = 'c8'; fromRookPos = 'a8'; toRookPos = 'd8'; }
                    
                    moves.push([{
                        from: { pos, piece },
                        to: { pos: toKingPos, piece: EMPTY },
                    }, {
                        from: { pos: fromRookPos, piece: fromRook },
                        to: { pos: toRookPos, piece: EMPTY},
                    }]);
                } else {
                    const piece2 = board.get(pos2);
                    const ok = isOk(piece2);
                    if (ok) {
                        moves.push({
                            from: { pos, piece },
                            to: { pos: pos2, piece: piece2 },
                        });
                        if (piece2 !== EMPTY) break dirLoop;
                    } else {
                        break dirLoop;
                    }
                }
            }
        }
    });
    return moves;
}
