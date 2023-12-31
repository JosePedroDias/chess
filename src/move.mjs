import { EMPTY, INDICES_TO_POSITIONS, POSITIONS_TO_INDICES, POSITIONS, FILES } from './board.mjs';
import { isKing, isQueen, isRook, isBishop, isKnight, isPawn, KING_W, KING_B, isPieceOfColor } from './pieces.mjs';
import { memoFactory } from './utils.mjs';

import { validMoves } from './valid-moves-mine.mjs';

export const CASTLE_QUEENSIDE = 'O-O-O';
export const CASTLE_KINGSIDE = 'O-O';
export const CASTLE_MOVES = [CASTLE_QUEENSIDE, CASTLE_KINGSIDE];

const START_KING_POSITIONS = ['e1', 'e8'];

// 'a1' => [0, 7]
function posToXY(pos) {
    const index = POSITIONS_TO_INDICES.get(pos);
    const y = Math.floor(index / 8);
    const x = index - 8 * y;
    return [x, y];
}

// [0, 7] => 'a1'
function posFromXY([x, y]) {
    const index = x + y * 8;
    return INDICES_TO_POSITIONS.get(index);
}

// [0, 0] => true
// [-1, 0] => false
function isXYValid([x, y]) {
    if (x < 0 || x > 7 || y < 0 || y > 7) return;
    return true;
}

// ('a1', 'b3') => [1, -2]
export function deltaMovesXY(pos1, pos2) {
    const xy1 = posToXY(pos1);
    const xy2 = posToXY(pos2);
    return [
        xy2[0] - xy1[0],
        xy2[1] - xy1[1],
    ];
}

// 'e4' => { from: 'e2', to: 'e4', piece: 'P', isCapture: false }
export function moveFromPgn(pgnMove, board) {
    const isWhite = board.isWhiteNext();
    if (CASTLE_MOVES.includes(pgnMove)) {
        if (isWhite) return CASTLE_QUEENSIDE ? 'e1g1' : 'e1c1';
        else         return CASTLE_QUEENSIDE ? 'e8g8' : 'e8c8';
    }

    pgnMove = pgnMove.replaceAll('x', '');
    pgnMove = pgnMove.replaceAll('+', '');

    let promoPiece = '';
    if (pgnMove.includes('=')) promoPiece = pgnMove.split('=')[1].toLowerCase();

    let from, to;
    if (POSITIONS_TO_INDICES.has(pgnMove.substring(0, 2))) {
        to = pgnMove.substring(0, 2);
        const rank = parseInt(pgnMove[1], 10);
        const expectedPiece = isWhite ? 'P' : 'p';
        from = pgnMove[0] + (rank + (isWhite ? -1 : 1));
        if (board.get(from) !== expectedPiece)
        from = pgnMove[0] + (rank + (isWhite ? -2 : 2));
        return `${from}${to}${promoPiece}`;
    } else if (FILES.includes(pgnMove[0]) && POSITIONS.has(pgnMove.substring(1, 3))) {
        to = pgnMove.substring(1, 3);
        from = pgnMove[0] + (parseInt(pgnMove[2], 10) + (isWhite ? -1 : 1));
        return `${from}${to}${promoPiece}`;
    } else {
        const piece = pgnMove[0].toUpperCase();
        const to_ = pgnMove.substring(pgnMove.length - 2);
        const from_ = pgnMove.length === 3 ? '' : pgnMove.length === 4 ? pgnMove[1] : pgnMove.substring(1, 3);
        const moves = validMoves(board).filter((mv) => {
            const from = mv.substring(0, 2);
            const to = mv.substring(2, 4);
            if (to_ !== to) return false;
            if (board.get(from).toUpperCase() !== piece) return false;
            if (!from_) return true;
            if (from_.length === 1) return from[0] === from_;
            return from_ === from;
        });
        if (moves.length > 1) throw 'unexpected!';
        return moves[0];
    }
}

/*
  e2e4 => { from: 'e2', to: 'e4', piece: 'P', isCapture: false }
  
  schema:
    {
        from:               [a-h][1-8]
        to                  [a-h][1-8]
        from2?              [a-h][1-8]
        to2?                [a-h][1-8]
        piece               'P'|'N'|'B'|'R'|'Q'|'K'
        promoPiece?         'P'|'N'|'B'|'R'|'Q'|'K'
        capturePiece?       'P'|'N'|'B'|'R'|'Q'|'K'
        isCapture           boolean
        isEnPassantCapture  boolean
        isCheck             boolean
    }
*/
export function moveToObject(move, board) {
    const from = move.substring(0, 2);
    const to = move.substring(2, 4);
    const promoPiece = move[4] && move[4].toUpperCase();
    const pieceChar = board.get(from);
    const piece = pieceChar.toUpperCase();
    const isCapture = board.get(to) !== EMPTY;
    let capturePiece = isCapture && board.get(to).toUpperCase();
    const o = { piece, pieceChar, from, to, isCapture, promoPiece, capturePiece };

    // castle
    if (isKing(piece) && Math.abs(deltaMovesXY(from, to)[0]) > 1) {
        const fromRank = from[1]; // '1'|'8' (whites, blacks)
        const toFile = to[0];     // 'g'|'c' (king, queen side)
        const isKingSide = toFile === 'g';
        o.from2 = isKingSide ? `h${fromRank}` : `a${fromRank}`;
        o.to2 = isKingSide ? `f${fromRank}` : `d${fromRank}`;
    }

    // en passant
    if (isPawn(piece) && board._params.enPassant === o.to) {
        o.isCapture = true;
        o.isEnPassantCapture = true;
        o.capturePiece = board.get(to).toUpperCase();
    }

    // detect check
    const board2 = board.applyMove(move);
    o.isCheck = isChecking(board2, !board2.isWhiteNext());
    
    return o;
}

// check(+)/checkmate(#) is added by evaluate's computeOutcomes()
// if moves argument is passed, disambiguate rook and knight need of from
export function moveToPgn(move, board, moves) {
    const o = moveToObject(move, board);

    // castling
    if (o.from2) return o.to[0] === 'g' ? CASTLE_KINGSIDE : CASTLE_QUEENSIDE;

    // pawns
    if (o.piece === 'P') return o.isCapture ? `${o.from[0]}x${o.to}` : o.to;

    // these never need 'from' disambiguation
    switch (o.piece) {
        case 'K':
        case 'B':
        case 'Q':
            return `${o.piece}${o.isCapture ? 'x' : ''}${o.to}`;
    }

    let needsFrom = true;

    // N, R...
    // filter only pieces of this kind
    if (moves) {
        moves = moves.filter((mv) => {
            const from = mv.substring(0, 2);
            const to = mv.substring(2, 4);
            const ch = board.get(from);
            return ch === o.pieceChar && to === o.to;
        });
        needsFrom = moves.length > 1;
    }
    return `${o.piece}${needsFrom ? o.from : ''}${o.isCapture ? 'x' : ''}${o.to}`;
}

function _knightMoves(pos) {
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
    ].filter(isXYValid).map(posFromXY);
}

function _pawnMoves(pos, isWhite) {
    const [x, y] = posToXY(pos);
    const dy = isWhite ? -1 : 1;
    let moves = [
        [x,   y+dy],
        [x-1, y+dy],
        [x+1, y+dy],
    ];

    const posRank = pos[1];
    if ((!isWhite && posRank === '7') ||
        (isWhite && posRank === '2'))
        moves.push([x, y+2*dy]);

    moves = moves.filter(isXYValid).map(posFromXY);

    // promotions
    const lastRank = isWhite ? '8' : '1';
    return moves.reduce((prevMoves, mv) => {
        if (mv[1] === lastRank) {
            return [...prevMoves, `${mv}q`, `${mv}r`, `${mv}b`, `${mv}n`];
        } else {
            return [...prevMoves, mv];
        }
    }, []);
}

// pos2 is opposite king pos
function _kingMoves(pos, pos2) {
    const [x, y] = posToXY(pos);
    let moves = [
        [x-1, y-1],
        [x,   y-1],
        [x+1, y-1],
        [x-1, y],
        [x+1, y],
        [x-1, y+1],
        [x,   y+1],
        [x+1, y+1],
    ].filter(isXYValid).map(posFromXY);

    // add potential castling moves (will be filtered out according to board on validMoves)
    if (START_KING_POSITIONS.includes(pos)) {
        const posRank = pos[1];
        moves.push(`c${posRank}`);
        moves.push(`g${posRank}`);
    }

    // they can't be checking each other
    moves = moves.filter((to) => {
        const [dx, dy] = deltaMovesXY(to, pos2);
        return !((Math.abs(dx) < 2) && (Math.abs(dy) < 2));
    });

    return moves;
}

function generateDirectionalMoves(pos, directions) {
    const [x, y] = posToXY(pos);
    const arrOfMoves = [];
    for (let [dx, dy] of directions) {
        const dirMoves = [];
        for (let r = 1; r < 8; ++r) dirMoves.push([x + r*dx, y + r*dy]);
        arrOfMoves.push(dirMoves.filter(isXYValid).map(posFromXY));
    }
    return arrOfMoves;
}

const QUEEN_DIRECTIONS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const ROOK_DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const BISHOP_DIRECTIONS = [[-1, -1], [1, -1], [-1, 1], [1, 1]];

function _queenMoves(pos) {
    return generateDirectionalMoves(pos, QUEEN_DIRECTIONS);
}

function _rookMoves(pos) {
    return generateDirectionalMoves(pos, ROOK_DIRECTIONS);
}

function _bishopMoves(pos) {
    return generateDirectionalMoves(pos, BISHOP_DIRECTIONS);
}

// memoize position generations

const km = new Map();
const qm = new Map();
const pm = new Map();
const rm = new Map();
const bm = new Map();
const nm = new Map();

// to check memoize resources / impact
// setInterval(() => console.log(`km:${km.size}, qm:${qm.size}, pm:${pm.size}, rm:${rm.size}, bm:${bm.size}, nm:${nm.size}`), 5000);

export const kingMoves   = memoFactory(_kingMoves ,  km, (a, b) => `${a}:${b}`);
export const queenMoves  = memoFactory(_queenMoves,  qm);
export const pawnMoves   = memoFactory(_pawnMoves,   pm, (a, b) => `${b ? 'w' : 'b'}${a}`);
export const rookMoves   = memoFactory(_rookMoves,   rm);
export const bishopMoves = memoFactory(_bishopMoves, bm);
export const knightMoves = memoFactory(_knightMoves, nm);

export function isBeingAttacked(pos, board, byWhite) {
    const isMyPiece = isPieceOfColor(byWhite);
    const isOpponentPiece = isPieceOfColor(!byWhite);
    
    const isOpponentKing = (v) => v === (byWhite ? KING_B : KING_W);
    const opponentKingPos = board.findPos(isOpponentKing);

    for (const [from, piece] of board.cellsHaving(isMyPiece)) {
        let movesArr;

        if (isPawn(piece)) {
            movesArr = pawnMoves(from, byWhite);
            movesArr = movesArr.filter((toWithPotentialProm) => {
                const to = toWithPotentialProm.substring(0, 2); // can have 3rd character defining promoted piece
                const isCaptureMove = from[0] !== to[0];
                if (isCaptureMove) {
                    return (isOpponentPiece(board.get(to)) || board._params.enPassant === to);
                } else {
                    const y0 = parseInt(from[1], 10);
                    const y1 = parseInt(to[1],   10);
                    const avgY = (y0 + y1) / 2;
                    const is2FilesMove = avgY % 1 === 0;
                    if (is2FilesMove && board.get(`${to[0]}${avgY}`) !== EMPTY) return false;
                    return board.get(to) === EMPTY;
                }
            });
        } else if (isKnight(piece)) {
            movesArr = knightMoves(from);
        } else if (isBishop(piece)) {
            movesArr = bishopMoves(from);
        } else if (isRook(piece)) {
            movesArr = rookMoves(from);
        } else if (isQueen(piece)) {
            movesArr = queenMoves(from);
        } else if (isKing(piece)) {
            movesArr = kingMoves(from, opponentKingPos);
        }

        // apply direction arrays to board (for Q, R, B)
        if (movesArr[0] && movesArr[0] instanceof Array) {
            const tmp = movesArr;
            movesArr = [];
            for (const dirPositions of tmp) {
                dirL: for (const to of dirPositions) {
                    const v = board.get(to);
                    if (isMyPiece(v)) {
                        break dirL;
                    } else if (v !== EMPTY) {
                        movesArr.push(to);
                        break dirL;
                    } else {
                        movesArr.push(to);
                    }
                }
            }
        } else {
            // check target is empty or opponent
            const isPawn_ = isPawn(piece);
            movesArr.filter((toWithPotentialProm) => {
                const to = toWithPotentialProm.substring(0, 2); // can have 3rd character defining promoted piece
                const v = board.get(to);
                // w/ en passant
                return (!isMyPiece(v) || isPawn_);
            });
        }

        if (movesArr.some((to) => to.substring(0, 2) === pos)) {
            //console.log(`checked by ${piece} on ${from}`);
            return true;
        }
    }

    return false;
}

// check = at least one of my pieces can see the opposite king
export function isChecking(board, isWhite) {
    const isOpponentKing = (v) => v === (isWhite ? KING_B : KING_W);
    const opponentKingPos = board.findPos(isOpponentKing);
    return isBeingAttacked(opponentKingPos, board, isWhite);
}

export function isMoveCapture(board, move) {
    const v = board.get(move.substring(2, 4));
    return v !== EMPTY;
}
