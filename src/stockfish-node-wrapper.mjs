import Module from "node:module";
const require = Module.createRequire(import.meta.url);
const mod = require('./stockfish-node-wrapper');

export const setup = mod.setup;
export const uciCmd = mod.uciCmd;
export const evalBoard = mod.evalBoard;
export const playBoard = mod.playBoard;
export const getBoard = mod.getBoard;
export const getBoardFen = mod.getBoardFen;
export const setSkillLevel = mod.setSkillLevel;
export const getValidMoves = mod.getValidMoves;
export const terminate = mod.terminate;
