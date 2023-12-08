// OPTIONAL STOCKFISH WRAPPER

// https://github.com/nmrugg/stockfish.js/
// https://github.com/nmrugg/stockfish.js/blob/master/example/enginegame.js

const LOG = false;
const SKILL_LEVEL = 20; // 1-20 ?

const ENGINE_ROOT_PATH = `./vendor/stockfish-js-minimal`;
const ENGINE_COMMON_PREFIX = `stockfish-nnue-16`;

//const ENGINE_FLAVOR_SUFFIX = ``; // best, (needs: headers, simd, worker)
//const ENGINE_FLAVOR_SUFFIX = `-no-simd`; //  (needs: headers, worker)
//const ENGINE_FLAVOR_SUFFIX = `-no-Worker`; // (needs: headers, ?simd)
const ENGINE_FLAVOR_SUFFIX = `-single`; // most compatible (needs: worker)

/////////

let _engine;

const _listeners = [];
//window._l = _listeners; // uncomment to debug listeners are running as intended

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
    //setTimeout(() => uciCmd('d'), 0); // display board in ascii art
    return `position fen ${fenString}`;
    //return `position startpos moves ${board._moves.join(' ')}`;
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

async function playBoard(fenString) {
    uciCmd(_setBoardViaFen(fenString));
    await _waitReady();
    uciCmd('go movetime 1000');
    const line = await _waitOn({
        startCriteriaFn: (l) => l.includes('bestmove'),
    });
    const m = /bestmove (\S+) ponder (\S+)/.exec(line);
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
    const moves = {};
    for (const line of result.split('\n')) {
        if (!line) return moves;
        const [a, b] = line.split(': ');
        moves[a] = parseFloat(b);
    }
    return moves;
}

/////

window.uciCmd = uciCmd;
window.setSkillLevel = setSkillLevel;
window.evalBoard = evalBoard;
window.playBoard = playBoard;
window.getBoard = getBoard;
window.getBoardFen = getBoardFen;
window.getValidMoves = getValidMoves;


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
