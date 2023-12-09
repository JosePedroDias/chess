import { EMPTY, INDICES_TO_POSITIONS, POSITIONS_TO_INDICES } from './board.mjs';
import { isWhitePiece, isBlackPiece, isKing, isQueen, isRook, isBishop, isKnight, isPawn, ROOK_W, ROOK_B } from './pieces.mjs';
import { memoFactory } from './utils.mjs';

export const CASTLE_QUEENSIDE = 'O-O-O';
export const CASTLE_KINGSIDE = 'O-O';
export const CASTLE_MOVES = [CASTLE_QUEENSIDE, CASTLE_KINGSIDE];

const START_KING_POSITIONS = ['e1', 'e8'];

const CASTLING_MOVES = ['e1g1', 'e1c1', 'e8g8', 'e8c8'];

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
function deltaMovesXY(pos1, pos2) {
    const xy1 = posToXY(pos1);
    const xy2 = posToXY(pos2);
    return [
        xy2[0] - xy1[0],
        xy2[1] - xy1[1],
    ];
}

// 'e4' => { from: 'e2', to: 'e4', piece: 'P', isCapture: false }
export function moveFromPgn(pgnMove, board) {
    // TODO
}

/*
  e2e4 => { from: 'e2', to: 'e4', piece: 'P', isCapture: false }
  
  schema:
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
    const moves = [
        [x,   y+dy],
        [x-1, y+dy],
        [x+1, y+dy],
    ];

    const posRank = pos[1];
    if ((!isWhite && posRank === '7') ||
        (isWhite && posRank === '2'))
        moves.push([x, y+2*dy]);

    return moves.filter(isXYValid).map(posFromXY);
}

function _kingMoves(pos) {
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
    ].filter(isXYValid).map(posFromXY);

    if (START_KING_POSITIONS.includes(pos)) {
        const posRank = pos[1];
        moves.push(`c${posRank}`);
        moves.push(`g${posRank}`);
    }

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

const kingMoves   = memoFactory(_kingMoves ,  km);
const queenMoves  = memoFactory(_queenMoves,  qm);
const pawnMoves   = memoFactory(_pawnMoves,   pm, (a, b) => `${b ? 'w' : 'b'}${a}`);
const rookMoves   = memoFactory(_rookMoves,   rm);
const bishopMoves = memoFactory(_bishopMoves, bm);
const knightMoves = memoFactory(_knightMoves, nm);

export function validMoves(board, isWhiteOverride) {
    let moves = [];
    const isWhite = isWhiteOverride !== undefined ? isWhiteOverride : board.isWhiteNext();
    const isMyPiece = isWhite ? isWhitePiece : isBlackPiece;
    const isOpponentPiece = isWhite ? isBlackPiece : isWhitePiece;
    //const positionsToCheckForThreats = [];

    for (const [from, piece] of board.cellsHaving(isMyPiece)) {
        let movesArr;
        if (isPawn(piece)) {
            movesArr = pawnMoves(from, isWhite);
            movesArr = movesArr.filter((to) => {
                const isCaptureMove = from[0] !== to[0];
                if (!isCaptureMove) return true;
                return isOpponentPiece(board.get(to)) || board._params.enPassantPos === to;
            });
        } else if (isRook(piece)) {
            movesArr = rookMoves(from);
        } else if (isBishop(piece)) {
            movesArr = bishopMoves(from);
        } else if (isKnight(piece)) {
            movesArr = knightMoves(from);
        } else if (isQueen(piece)) {
            movesArr = queenMoves(from);
        } else if (isKing(piece)) {
            movesArr = kingMoves(from);
            movesArr = movesArr.filter((to) => {
                const move = `${from}${to}`;
                if (!CASTLING_MOVES.includes(move)) return true;
                let mustBeEmpty, mustBeRook;
                switch (move) {
                    case 'e1g1': mustBeEmpty = ['f1', 'g1'];       mustBeRook = 'h1'; break;
                    case 'e1c1': mustBeEmpty = ['d1', 'c1', 'b1']; mustBeRook = 'a1'; break;
                    case 'e8g8': mustBeEmpty = ['f8', 'g8'];       mustBeRook = 'h8'; break;
                    case 'e8c8': mustBeEmpty = ['d8', 'c8', 'b8']; mustBeRook = 'a8'; ;break;
                    default: throw new Error('should not happen');
                }
                if (!mustBeEmpty.every((pos) => board.get(pos) === EMPTY)) return false;
                if (board.get(mustBeRook) !== (isWhite ? ROOK_W : ROOK_B)) return false;
                // TODO: check king is not threatened? threatenedPositions
                return true;
            });
        } else {
            throw new Error('should not happen');
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
            movesArr.filter((to) => {
                const v = board.get(to);
                // w/ en passant
                return (!isMyPiece(v) || isPawn_ && board._params.enPassantPos === to);
            });
        }

        movesArr = movesArr.map((to) => `${from}${to}`)
        moves = [...moves, ...movesArr];

        // TODO check if king is in check after move
    }

    return moves;
}
