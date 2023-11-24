export const KING_W = 'K';
export const KING_B = 'k';
export const QUEEN_W = 'Q';
export const QUEEN_B = 'q';
export const ROOK_W = 'R';
export const ROOK_B = 'r';
export const BISHOP_W = 'B';
export const BISHOP_B = 'b';
export const KNIGHT_W = 'N';
export const KNIGHT_B = 'n';
export const PAWN_W = 'P';
export const PAWN_B = 'p';

export const WHITE_PIECES = [KING_W, QUEEN_W, ROOK_W, BISHOP_W, KNIGHT_W, PAWN_W];
export const BLACK_PIECES = [KING_B, QUEEN_B, ROOK_B, BISHOP_B, KNIGHT_B, PAWN_B];
export const PIECES = [...WHITE_PIECES, ...BLACK_PIECES];

export function isPiece(piece) {
    return PIECES.includes(piece);
}

export function isWhitePiece(piece) {
    return WHITE_PIECES.includes(piece);
}

export function isBlackPiece(piece) {
    return BLACK_PIECES.includes(piece);
}

/*
export const KINGS = [KING_W, KING_B];
export const QUEENS = [QUEEN_W, QUEEN_B];
export const ROOKS = [ROOK_W, ROOK_B];
export const BISHOPS = [BISHOP_W, BISHOP_B];
export const KNIGHTS = [KNIGHT_W, KNIGHT_B];
export const PAWNS = [PAWN_W, PAWN_B];

export function isKing(piece) {
    return KINGS.includes(piece);
}

export function isQueen(piece) {
    return QUEENS.includes(piece);
}

export function isRook(piece) {
    return ROOKS.includes(piece);
}

export function isBishop(piece) {
    return BISHOPS.includes(piece);
}

export function isKnight(piece) {
    return KNIGHTS.includes(piece);
}

export function isPawn(piece) {
    return PAWNS.includes(piece);
}
*/
