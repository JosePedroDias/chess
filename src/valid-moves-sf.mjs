import { setup as setupStockfish, getValidMoves } from './stockfish-browser-wrapper.mjs';

setupStockfish(20);

export async function validMoves(board, isWhiteOverride) {
    const isWhite = board.isWhiteNext();
    if (isWhiteOverride && !isWhite) board = board.getInvertedBoard();
    return await getValidMoves(board.getFen());
}
