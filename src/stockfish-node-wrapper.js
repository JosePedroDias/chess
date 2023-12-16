#!/usr/bin/env node

const LOG = false;

const ENGINE_ROOT_PATH = `../vendor/stockfish-js-minimal`;
const ENGINE_COMMON_PREFIX = `stockfish-nnue-16`;

const ENGINE_FLAVOR_SUFFIX = ``;
//const ENGINE_FLAVOR_SUFFIX = `-no-simd`;
//const ENGINE_FLAVOR_SUFFIX = `-no-Worker`;
//const ENGINE_FLAVOR_SUFFIX = `-single`;

const path = require('path');
const INIT_ENGINE = require(`${ENGINE_ROOT_PATH}/${ENGINE_COMMON_PREFIX}${ENGINE_FLAVOR_SUFFIX}`);
const wasmPath = path.join(__dirname, `${ENGINE_ROOT_PATH}/${ENGINE_COMMON_PREFIX}${ENGINE_FLAVOR_SUFFIX}.wasm`);

/////////

let _engine;

const _listeners = [];

function _waitOn({ startCriteriaFn, stopCriteriaFn, maxNumLines }) {
    return new Promise((resolve) => _listeners.push({
        startCriteriaFn: startCriteriaFn || (() => true),
        stopCriteriaFn: stopCriteriaFn || (() => false),
        active: false,
        linesLeft: maxNumLines || (stopCriteriaFn ? 100 : 1),
        result: [],
        resolve,
     }));
}

function _fireLine(line) {
    for (let i = _listeners.length - 1; i >= 0; --i) {
        const listener = _listeners[i];
        const { startCriteriaFn, stopCriteriaFn, result, resolve } = listener;
        if (listener.active || startCriteriaFn(line)) {
            listener.active = true;
            result.push(line);
            --listener.linesLeft;
            if (stopCriteriaFn(line) || listener.linesLeft === 0) {
                resolve(result.join('\n'));
                _listeners.splice(i, 1);
                return; // only 1 listener gets served
            }
        }
    }
}

function _waitReady() {
    uciCmd('isready');
    return _waitOn({
        startCriteriaFn: (l) => l === 'readyok',
    });
}

/////

function uciCmd(cmd) {
    LOG && console.log(`>> '${cmd}'`);
    _engine.postMessage(cmd);
}

function setSkillLevel(skill) {
    uciCmd(`setoption name Skill Level value ${skill}`);
    return _waitReady();
}


function _setBoardViaFen(fenString) {
    return `position fen ${fenString}`;
}

async function evalBoard(fenString) {
    uciCmd(_setBoardViaFen(fenString));
    await _waitReady();
    uciCmd('eval');

    let finalEval = await _waitOn({
        startCriteriaFn: (l) => l.includes('Final evaluation'),
    });
    const m = /\+?-?\d\.\d\d/.exec(finalEval);
    if (!m) {
        return '?'; // likely in a check
    }
    finalEval = parseFloat(m[0]);
    return finalEval;
}

async function playBoard(fenString, ms = 1000) {
    uciCmd(_setBoardViaFen(fenString));
    await _waitReady();
    uciCmd(`go movetime ${ms}`);
    const line = await _waitOn({
        startCriteriaFn: (l) => l.includes('bestmove'),
    });
    let m = /bestmove (\S+) ponder (\S+)/.exec(line);
    if (!m) {
        m = /bestmove (\S+)/.exec(line);
    }
    const bestMove = m[1];
    const ponder = m[2];
    return { bestMove, ponder };
}

async function getBoard() {
    uciCmd('d');
    const result = await _waitOn({
        startCriteriaFn: (l) => l.includes(' +---+---+---+---+---+---+---+---+'),
        stopCriteriaFn: (l) => l.includes('Checkers:'),
    });
    const lines = result.split('\n');
    const board = lines.slice(0, 18).join('\n');
    const fen = lines[19].substring(5);
    return { board, fen };
}

async function getBoardFen() {
    uciCmd('d');
    const line = await _waitOn({
        startCriteriaFn: (l) => l.includes('Fen: '),
    });
    return line.substring(5);
}

async function getValidMoves(fenString, depth = 1) {
    uciCmd(_setBoardViaFen(fenString));
    await _waitReady();
    uciCmd(`go perft ${depth}`);
    const result = await _waitOn({
        stopCriteriaFn: (l) => l.includes('Nodes searched: '),
    });

    const moves = [];
    for (const line of result.split('\n')) {
        if (!line) return moves;
        const [a] = line.split(': ');
        if (a !== 'readyok') moves.push(a);
    }
    return moves;
}

function terminate() {
    _engine.terminate();
}

/////

async function setup(skillLevel) {
    _engine = {
        locateFile(path) {
            if (path.indexOf(".wasm") > -1) return wasmPath;
            return __filename;
        },
    };

    if (typeof INIT_ENGINE !== "function") return;
    const Stockfish = INIT_ENGINE();
    
    await Stockfish(_engine);
    
    await _engine.ready;
    
    // console.log(Object.keys(_engine));
    
    _engine.addMessageListener((line) => {
        LOG && console.log(`<< '${line}'`);
        _fireLine(line);
    });

    setSkillLevel(skillLevel)
    .then(() => console.log(`skill level ${skillLevel} set`));
}

module.exports = {
    setup,
    uciCmd,
    evalBoard,
    playBoard,
    getBoard,
    getBoardFen,
    setSkillLevel,
    getValidMoves,
    terminate,
};
