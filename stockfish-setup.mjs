let engine;

const LOG = false;

function uciCmd(cmd) {
    LOG && console.log(`>> '${cmd}'`);
    engine.postMessage(cmd);
}
//window.uciCmd = uciCmd;

function waitReady() {
    uciCmd('isready');
    return waitOn((l) => l === 'readyok');
}

function setSkillLevel(skill) {
    uciCmd(`setoption name Skill Level value ${skill}`);

    // Stockfish level 20 does not make errors (intentially), so these numbers have no effect on level 20.
    const err_prob = Math.round((skill * 6.35) + 1); // Level 0 starts at 1
    const max_err = Math.round((skill * -0.5) + 10); // Level 0 starts at 10
    //uciCmd(`setoption name Skill Level Maximum Error value ${max_err}`);
    //uciCmd(`setoption name Skill Level Probability value ${err_prob}`);

    return waitReady();
}
window.setSkillLevel = setSkillLevel;

async function playBoard(board) {
    uciCmd(`position ${board.getFen()}`);
    await waitReady();
    uciCmd('go movetime 1000');
    const bestMove = await waitOn((l) => l.indexOf('bestmove') === 0);
    return bestMove;
}
window.playBoard = playBoard;

async function evalBoard(board) {
    uciCmd(`position ${board.getFen()}`);
    await waitReady();
    uciCmd('eval');
    const classEval = await waitOn((l) => l.indexOf('Classical evaluation') === 0);
    return classEval;
}
window.evalBoard = evalBoard;


let listeners = [];

function waitOn(criteriaFn) {
    return new Promise((resolve) => listeners.push({ criteriaFn, resolve }));
}

/*function listen(criteriaFn, resolve) {
    listeners.push({ criteriaFn, resolve });
}*/

export function setup() {
    // https://github.com/nmrugg/stockfish.js/
    // https://github.com/nmrugg/stockfish.js/blob/master/example/enginegame.js

    const suffix = ``;
    //const suffix = `-single`;
    //const suffix = `-no-simd`;
    //const suffix = `-no-Worker`;
    engine = new Worker(`./stockfish-js/src/stockfish-nnue-16${suffix}.js#stockfish-nnue-16${suffix}.wasm`);

    
    engine.addEventListener('message', (ev) => {
        const line = (ev && typeof ev === "object") ? ev.data : ev;
        LOG && console.log(`<< '${line}'`);

        for (let i = listeners.length - 1; i >= 0; --i) {
            const { criteriaFn, resolve } = listeners[i];
            if (criteriaFn(line)) {
                resolve(line);
                listeners.splice(i, 1);
            }
        }

        /* let m = line.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/);
        if (m) {
            console.log({from: m[1], to: m[2], promotion: m[3]});
        }
        else if (m = line.match(/^info .*\bdepth (\d+) .*\bnps (\d+)/)) {
            console.log({ depth: m[1], nps: m[2] });
        }

        if (m = line.match(/^info .*\bscore (\w+) (-?\d+)/)) {
            const score = parseInt(m[2], 10);
            // Is it measuring in centipawns?
            if (m[1] === 'cp') {
                console.log({ score: (score / 100.0).toFixed(2) });
            // Did it find a mate?
            } else if (m[1] === 'mate') {
                console.log('Mate in ' + Math.abs(score));
            }
            
            // Is the score bounded?
            if (m = line.match(/\b(upper|lower)bound\b/)) {
                //console.log({   });
                //engineStatus.score = ((m[1] == 'upper') == (game.turn() == 'w') ? '<= ' : '>= ') + engineStatus.score
            }
        } */
    });

    //waitReady().then(() => console.log('ready'));

    const SKILL_LEVEL = 1; // 1-20 ?
    setSkillLevel(SKILL_LEVEL).then(() => console.log(`skill level ${SKILL_LEVEL} set`));
}

setup();
