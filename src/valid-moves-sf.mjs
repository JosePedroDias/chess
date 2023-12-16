let setup, getValidMoves;
const mod = await import(
    typeof window === 'undefined' ?
    './stockfish-node-wrapper.mjs' :
    './stockfish-browser-wrapper.mjs'
);
setup         = mod.setup;
getValidMoves = mod.getValidMoves;

setup(20);

export async function validMoves(board, isWhiteOverride) {
    const isWhite = board.isWhiteNext();
    if (isWhiteOverride && !isWhite) board = board.getInvertedBoard();
    return await getValidMoves(board.getFen());
}
