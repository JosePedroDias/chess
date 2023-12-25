import { moveToObject } from './move.mjs';
import { CASTLING_MOVES, KING_SIDE_CASTLING_MOVES } from './board.mjs';

export function getPieceName(pieceInUppercase) {
    switch (pieceInUppercase) {
        case 'K': return 'king';
        case 'Q': return 'queen';
        case 'R': return 'rook';
        case 'B': return 'bishop';
        case 'N': return 'knight';
    }
    return 'pawn';
}

export function narrateMove(move, board) {
    if (CASTLING_MOVES.includes(move)) {
        const isKingSide = KING_SIDE_CASTLING_MOVES.includes(move);
        return `castling ${isKingSide ? 'king' : 'queen'} side`;
    }
    const { piece, to, isCapture, isEnPassantCapture, promoPiece } = moveToObject(move, board);
    const pieceName = getPieceName(piece);
    const promoPieceName = promoPiece ? getPieceName(promoPiece) : '';
    let result = `${pieceName} ${isCapture ? 'takes' : 'to'} ${to}${isEnPassantCapture ? ' en passant' : ''}`;
    if (promoPieceName) {
        result = `${result} and promotes to ${promoPieceName}`;
    }
    return result;
}
