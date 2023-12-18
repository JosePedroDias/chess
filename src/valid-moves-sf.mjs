let setup, getValidMoves;
const mod = await import(
    typeof window === 'undefined' ?
    './stockfish-node-wrapper.mjs' :
    './stockfish-browser-wrapper.mjs'
);
//setup         = mod.setup;
getValidMoves = mod.getValidMoves;

// setup(20);

export async function validMoves(board, isWhiteOverride) {
    const isWhite = board.isWhiteNext();
    if (isWhiteOverride && !isWhite) board = board.getInvertedBoard();
    const moves = await getValidMoves(board.getFen());
    return Array.from( new Set(moves) ); // remove duplicates? maybe irrelevant on most scenarios
}
