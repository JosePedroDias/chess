import { Board, POSITIONS_TO_INDICES, INDICES_TO_POSITIONS, WHITE, EMPTY, otherSide } from './board.mjs';
import {
    KING_W, KING_B,
    QUEEN_W, QUEEN_B,
    ROOK_W, ROOK_B,
    BISHOP_W, BISHOP_B,
    KNIGHT_W, KNIGHT_B,
    PAWN_W, PAWN_B,
    isPiece, isWhitePiece, isBlackPiece, isPawn, isKing
} from './pieces.mjs';
import { intersection } from './utils.mjs';

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

        if (canDoIt) {
            const moves = [];//validMoves(board, otherSide(board._params.next));
            const positions = getThreatenedPositions(moves);
            const cantBeThreatenedPositions = sideIsWhite ? ['e1', 'f1', 'g1'] : ['e8', 'f8', 'g8'];
            if (intersection(positions, cantBeThreatenedPositions).length === 0) {
                moves.push([sideIsWhite ? CASTLE_W_KINGSIDE : CASTLE_B_KINGSIDE]);
            }
        }
    }

    if (canCastleQS) {
        const posMustBeEmpty = sideIsWhite ? ['d1', 'c1', 'b1'] : ['d8', 'c8', 'b8'];
        const canDoIt = posMustBeEmpty.every((pos) => !isPiece(board.get(pos)));

        if (canDoIt) {
            const moves = [];//validMoves(board, otherSide(board._params.next)); // TODO
            const positions = getThreatenedPositions(moves);
            const cantBeThreatenedPositions = sideIsWhite ? ['e1', 'd1', 'c1'] : ['e8', 'd8', 'c8'];
            if (intersection(positions, cantBeThreatenedPositions).length === 0) {
                moves.push([sideIsWhite ? CASTLE_W_QUEENSIDE : CASTLE_B_QUEENSIDE]);
            }
        }
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
        if (canBeCaptured(board.get(capture1Pos)) || board._params.enPassantPos === capture1Pos)
            moves.push([capture1Pos]);
    }
    if (capture2Pos) {
        if (canBeCaptured(board.get(capture2Pos)) || board._params.enPassantPos === capture2Pos)
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

export function isMoveCapture(move) {
    if (move instanceof Array) return false; // castling
    return (move.to.piece !== EMPTY);
}

export function isMoveCheck(move) {
    if (move instanceof Array) return false; // castling
    return isKing(move.to.piece);
}

export function validMoves(board, fromSide) {
    const side = fromSide || board._params.next;
    const sideIsWhite = side === WHITE;
    const isOk = sideIsWhite ? (p) => !isWhitePiece(p) : (p) => !isBlackPiece(p);
    const moves = [];
    board.iteratePiecesOfSide(side, (pos, piece) => {
        const pieceMoves = getMoves(board, piece, pos);
        for (let directionArr of pieceMoves) {
            dirLoop: for (let pos2 of directionArr) {
                if (isCastleMove(pos2)) {
                    // TODO: check king in not in danger (check) nor during the move to destination

                    let toKPos, fromRPos, toRPos;
                    const fromRPiece = sideIsWhite ? ROOK_W : ROOK_B;

                    // K: e1 -> g1; R: h1 -> f1 (O-O)
                    if      (pos2 === CASTLE_W_KINGSIDE) { toKPos = 'g1'; fromRPos = 'h1'; toRPos = 'f1'; }
                    // K: e8 -> g8; R: h8 -> f8 (o-o)
                    else if (pos2 === CASTLE_B_KINGSIDE) { toKPos = 'g8'; fromRPos = 'h8'; toRPos = 'f8'; }
                    // K: e1 -> c1; R: a1 -> d1 (O-O-O)
                    else if (pos2 === CASTLE_W_QUEENSIDE) { toKPos = 'c1'; fromRPos = 'a1'; toRPos = 'd1'; }
                    // K: e8 -> c8; R: d8 -> d8 (o-o-o)
                    else if (pos2 === CASTLE_B_QUEENSIDE) { toKPos = 'c8'; fromRPos = 'a8'; toRPos = 'd8'; }
                    
                    moves.push([{
                        from: { pos, piece },
                        to: { pos: toKPos, piece: EMPTY },
                    }, {
                        from: { pos: fromRPos, piece: fromRPiece },
                        to: { pos: toRPos, piece: EMPTY},
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

export function moveToString(move) {
    if (move instanceof Array) {
        const toKingPos = move[0].to.pos;
        if (toKingPos === 'g1') return CASTLE_W_KINGSIDE;
        if (toKingPos === 'g8') return CASTLE_B_KINGSIDE;
        if (toKingPos === 'c1') return CASTLE_W_QUEENSIDE;
        else                    return CASTLE_B_QUEENSIDE;
    }
    const movingPiece = isPawn(move.from.piece) ? '' : move.from.piece;
    const isCapture = isMoveCapture(move) ? 'x' : '';
    const isCheck = isMoveCheck(move) ? '+' : '';
    const fromPos = move.from.pos;
    const toPos = move.to.pos;
    return `${movingPiece}${fromPos}${isCapture}${toPos}${isCheck}`;
}

export function moveFromString(st, board) {
    const sideIsWhite = board._params.next === WHITE;
    if (isCastleMove(st)) {
        let fromKPos, toKPos, fromRPos, toRPos;
        const fromKPiece = sideIsWhite ? KING_W : KING_B;
        const fromRPiece = sideIsWhite ? ROOK_W : ROOK_B;

        // K: e1 -> g1; R: h1 -> f1 (O-O)
        if      (st === CASTLE_W_KINGSIDE)  { fromKPos = 'e1'; toKPos = 'g1'; fromRPos = 'h1'; toRPos = 'f1'; }
        // K: e8 -> g8; R: h8 -> f8 (o-o)
        else if (st === CASTLE_B_KINGSIDE) {  fromKPos = 'e8'; toKPos = 'g8'; fromRPos = 'h8'; toRPos = 'f8'; }
        // K: e1 -> c1; R: a1 -> d1 (O-O-O)
        else if (st === CASTLE_W_QUEENSIDE) { fromKPos = 'e1'; toKPos = 'c1'; fromRPos = 'a1'; toRPos = 'd1'; }
        // K: e8 -> c8; R: d8 -> d8 (o-o-o)
        else if (st === CASTLE_B_QUEENSIDE) { fromKPos = 'e8'; toKPos = 'c8'; fromRPos = 'a8'; toRPos = 'd8'; }

        return [{
            from: { pos: fromKPos, piece: fromKPiece },
            to: {   pos: toKPos,   piece: EMPTY },
        }, {
            from: { pos: fromRPos, piece: fromRPiece },
            to: {   pos: toRPos,   piece: EMPTY},
        }];
    }

    // 0       1        3   4
    // <piece?><fromPos><x?><toPos><+?>

    const isCapture = st.includes('x');
    //const isCheck = st.includes('+');
    let startOfToPos = isCapture ? 4 : 3;
    let piece = st[0];
    let fromPos = st.substring(1, 3);
    let thirdChar = st[2];
    thirdChar = parseInt(thirdChar, 10);
    if (isNaN(thirdChar)) {
        fromPos = st.substring(0, 2);
        piece = sideIsWhite ? PAWN_W : PAWN_B;
        --startOfToPos;
    }
    const toPos = st.substring(startOfToPos, startOfToPos + 2);
    return {
        from: { pos: fromPos, piece: board.get(fromPos) },
        to: {   pos: toPos,   piece: board.get(toPos) },
    }
}

export function isCheckPossible(moves) {
    return moves.some(isMoveCheck);
}

export function areAllMovesCheck(moves) {
    return moves.every(isMoveCheck);
}

export function getCaptureMoves(moves) {
    return moves.filter(isMoveCapture);
}

export function getThreatenedPositions(moves) {
    const positions = getCaptureMoves(moves).map((move) => move.to.pos);
    return Array.from( new Set(positions) );
}
