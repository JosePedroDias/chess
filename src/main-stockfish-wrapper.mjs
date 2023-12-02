// OPTIONAL STOCKFISH WRAPPER

// https://github.com/nmrugg/stockfish.js/
// https://github.com/nmrugg/stockfish.js/blob/master/example/enginegame.js

const LOG = false;
const SKILL_LEVEL = 20; // 1-20 ?

const ENGINE_ROOT_PATH = `/vendor/stockfish-js-minimal`;
const ENGINE_COMMON_PREFIX = `stockfish-nnue-16`;

const ENGINE_FLAVOR_SUFFIX = ``; // best, less compatible
//const ENGINE_FLAVOR_SUFFIX = `-single`;
//const ENGINE_FLAVOR_SUFFIX = `-no-simd`;
//const ENGINE_FLAVOR_SUFFIX = `-no-Worker`;

/////////

let _engine;

const _listeners = [];

function _waitOn(criteriaFn) {
    return new Promise((resolve) => _listeners.push({ criteriaFn, resolve }));
}

function _fireLine(line) {
    for (let i = _listeners.length - 1; i >= 0; --i) {
        const { criteriaFn, resolve } = _listeners[i];
        if (criteriaFn(line)) {
            resolve(line);
            _listeners.splice(i, 1);
        }
    }
}

function _uciCmd(cmd) {
    LOG && console.log(`>> '${cmd}'`);
    _engine.postMessage(cmd);
}

function _waitReady() {
    _uciCmd('isready');
    return _waitOn((l) => l === 'readyok');
}

/////

function setSkillLevel(skill) {
    _uciCmd(`setoption name Skill Level value ${skill}`);

    return _waitReady();
}


function _setBoardViaFen(fenString) {
    //setTimeout(() => uciCmd('d'), 0); // display board in ascii art
    return `position fen ${fenString}`;
    //return `position startpos moves ${board._moves.join(' ')}`;
}

function getBoard() {
    // TODO
}

function getValidMoves() {
    
}

async function playBoard(fenString) {
    _uciCmd(_setBoardViaFen(fenString));
    await _waitReady();
    _uciCmd('go movetime 1000');
    const bestMove = await _waitOn((l) => l.indexOf('bestmove') === 0);
    return bestMove;
}

async function evalBoard(fenString) {
    _uciCmd(_setBoardViaFen(fenString));
    await _waitReady();
    _uciCmd('eval');

    let finalEval = await _waitOn((l) => l.indexOf('Final evaluation') === 0);
    const m = /\+?-?\d\.\d\d/.exec(finalEval);
    if (!m) {
        //console.warn(finalEval);
        return '?'; // likely in a check
    }
    finalEval = parseFloat(m[0]);
    return finalEval;
}

/////

window.setSkillLevel = setSkillLevel;
window.playBoard = playBoard;
window.getBoard = getBoard;
window.evalBoard = evalBoard;

/////

export function setup(skillLevel) {
    _engine = new Worker(`${ENGINE_ROOT_PATH}/${ENGINE_COMMON_PREFIX}${ENGINE_FLAVOR_SUFFIX}.js#${ENGINE_COMMON_PREFIX}${ENGINE_FLAVOR_SUFFIX}.wasm`);

    _engine.addEventListener('message', (ev) => {
        const line = (ev && typeof ev === "object") ? ev.data : ev;
        LOG && console.log(`<< '${line}'`);
        _fireLine(line);
    });

    setSkillLevel(skillLevel)
    .then(() => console.log(`skill level ${skillLevel} set`));
}

setup(SKILL_LEVEL);
