import { EMPTY, CASTLING_MOVES } from './board.mjs';
import {
    isKing, isQueen,isRook, isBishop, isKnight, isPawn,
    KING_W, KING_B, QUEEN_W, QUEEN_B, isPieceOfColor,
} from './pieces.mjs';
import {
    pawnMoves, knightMoves, bishopMoves, rookMoves, queenMoves, kingMoves,
    isChecking, isBeingAttacked,
} from './move.mjs';

export function validMoves(board, isWhiteOverride) {
    let moves = [];
    const isWhite = isWhiteOverride !== undefined ? isWhiteOverride : board.isWhiteNext();
    const isMyPiece = isPieceOfColor(isWhite);
    const isOpponentPiece = isPieceOfColor(!isWhite);
    
    const isOpponentKing = (v) => v === (isWhite ? KING_B : KING_W);
    const opponentKingPos = board.findPos(isOpponentKing);

    for (const [from, piece] of board.cellsHaving(isMyPiece)) {
        let movesArr;
        if (isPawn(piece)) {
            movesArr = pawnMoves(from, isWhite);
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
        } else if (isRook(piece)) {
            movesArr = rookMoves(from);
        } else if (isBishop(piece)) {
            movesArr = bishopMoves(from);
        } else if (isKnight(piece)) {
            movesArr = knightMoves(from);
        } else if (isQueen(piece)) {
            movesArr = queenMoves(from);
        } else if (isKing(piece)) {
            movesArr = kingMoves(from, opponentKingPos);
            movesArr = movesArr.filter((to) => {
                const move = `${from}${to}`;
                if (!CASTLING_MOVES.includes(move)) return true;
                let mustBeEmpty, mustBeRook;
                switch (move) {
                    case 'e1g1':
                        if (!board.hasCastlingFlag(KING_W)) return false;
                        mustBeEmpty = ['f1', 'g1'];       mustBeRook = 'h1'; break;
                    case 'e1c1':
                        if (!board.hasCastlingFlag(QUEEN_W)) return false;
                        mustBeEmpty = ['d1', 'c1', 'b1']; mustBeRook = 'a1'; break;
                    case 'e8g8':
                        if (!board.hasCastlingFlag(KING_B)) return false;
                        mustBeEmpty = ['f8', 'g8'];       mustBeRook = 'h8'; break;
                    case 'e8c8':
                        if (!board.hasCastlingFlag(QUEEN_B)) return false;
                        mustBeEmpty = ['d8', 'c8', 'b8']; mustBeRook = 'a8'; break;
                    default:
                        // throw new Error(`Unexpected ${move}`);
                        return false;
                }
                //if (board.get(mustBeRook) !== (isWhite ? ROOK_W : ROOK_B)) return false; // flag enforces this already
                if (!mustBeEmpty.every((pos) => board.get(pos) === EMPTY)) return false;
                if (mustBeEmpty.length === 3) mustBeEmpty.pop(); // last position can be checked
                if ([from, ...mustBeEmpty].some((pos) => isBeingAttacked(pos, board, !isWhite))) return false;
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
            movesArr = movesArr.filter((to) => {
                const v = board.get(to.substring(0, 2)); // can be promotion with 3 chars
                // w/ en passant
                return (!isMyPiece(v) || isPawn_ && board._params.enPassant === to);
            });
        }

        movesArr = movesArr.map((to) => `${from}${to}`)
        moves = [...moves, ...movesArr];
    }

    // check if king is in check after move
    moves = moves.filter((mv) => {
        const board2 = board.applyMove(mv);
        const checked = isChecking(board2, !isWhite);
        //if (checked) console.log(`dropping ${mv}`)
        return !checked;
    });

    return moves;
}
