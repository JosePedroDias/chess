import { playBoard } from './stockfish-browser-wrapper.mjs';

export async function playSfBot(board, maxMs = 2000) {
    const { bestMove } = await playBoard(board.getFen(), maxMs);
    return bestMove;
}
