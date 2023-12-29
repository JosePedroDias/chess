import { moveToObject } from './move.mjs';
import { CASTLING_MOVES, KING_SIDE_CASTLING_MOVES } from './board.mjs';
import { isKing } from './pieces.mjs';

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

export function narrateMove(move, board, sayCapture) {
    //console.log(`%c${move}`, 'color: orange');

    const { piece, to, isCapture, isEnPassantCapture, isCheck, promoPiece, capturePiece } = moveToObject(move, board);

    if (isKing(piece) && CASTLING_MOVES.includes(move)) {
        const isKingSide = KING_SIDE_CASTLING_MOVES.includes(move);
        return `castling ${isKingSide ? 'king' : 'queen'} side`;
    }
    
    const pieceName = getPieceName(piece);
    const promoPieceName = promoPiece ? getPieceName(promoPiece) : '';
    const to_ = `${to[0].toUpperCase()} ${to[1]}`;
    const capturePieceName = getPieceName(capturePiece);
    let result = `${pieceName} ${isCapture ? (sayCapture ? `takes ${capturePieceName} on`: 'takes') : 'to'} ${to_}${isEnPassantCapture ? ' en passant' : ''}`;

    if (promoPieceName) {
        result = `${result} and promotes to ${promoPieceName}`;
    }

    if (isCheck) {
        result = `${result} check`;
    }

    console.log(`%c${result}`, 'color: orange');

    return result;
}
