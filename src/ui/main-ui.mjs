import { redraw, default as m } from '../../vendor/mithril.mjs';

import { Board } from '../board.mjs';
import { computeOutcomes } from '../evaluate.mjs';
import { playRandomBot } from '../randomBot.mjs';
import { playZpBot } from '../zpBot.mjs';
import { playSfBot } from '../sfBot.mjs';
import { UiBoard } from './ui-board.mjs';
import { Evaluation } from './evaluation.mjs';
import { MARGIN, CW } from './constants.mjs';
import { promptDialog } from './prompt-dialog.mjs';
import { Material } from './material.mjs';
//import { Moves } from './moves.mjs';
import { moveToObject } from '../move.mjs';
import { initSfx, playSample } from '../sfx/sfx.mjs';
import { sleep } from '../utils.mjs';
import { narrateMove } from '../narrate-move.mjs';
import { say } from '../tts.mjs';

let evalBoard;
let evalO = {};
const moveIndices = new Array(2);

function playAppropriateSound(move, resultingBoard) {
    const moveO = moveToObject(move, resultingBoard.getLastBoard());
    if (moveO.isCheck)   playSample('notificationSound');
    if (moveO.isCapture) playSample('move');
    else                 playSample('dragSlide', 0.33);
}

function isBotNameSf(name) {
    return name.indexOf('SfBot') === 0;
}

function getSfBotLevelFromName(name) {
    const m = (/\((\d+)\)/).exec(name);
    if (m) return parseInt(m[1], 10);
}

export function ui(
    { rootEl, players, sfx, tts, fromBlacks, playTimeMs, sfEval, dest, hints },
    { board }
) {
    if (sfEval || players.some(isBotNameSf)) {
        (async () => {
            const mod = await import('../stockfish-browser-wrapper.mjs');
            const firstSfPlayer = isBotNameSf(players[0]) ? players[0] : players[1];
            const sfLevel = getSfBotLevelFromName(firstSfPlayer);
            mod.setup(sfLevel || 1);
            evalBoard = mod.evalBoard;
        })();
    }

    const playHuman = async (board) => {
        let move;
        const out = await computeOutcomes(board);
        do {
            const prom = new Promise((resolve) => { resolveFn = resolve; });
            const [from, to] = await prom;

            //console.log(`${from} -> ${to}`);
            move = `${from}${to}`;
            const candidates = [];
            for (const mv of out.moves) {
                if (mv.indexOf(move) !== -1) candidates.push(mv);
            }
            if (candidates.length === 1) {
                move = candidates[0];
            } else if (candidates.length > 1) {
                move = await promptDialog(`choose promotion for ${board._params.next}?`, candidates, '');
            }
        } while (!out.moves.includes(move));

        return move;
    }

    // white, black

    const playFunctions = players.map((name) => {
        if (name === 'ZpBot')  return playZpBot;
        if (name === 'RandomBot')  return playRandomBot;
        if (isBotNameSf(name)) return playSfBot; // TODO assign bot level
        return playHuman;
    });

    const vb = [
        -MARGIN * CW,
        -MARGIN * CW,
        (8 + 2 * MARGIN) * CW,
        (8 + 2 * MARGIN) * CW,
    ];

    let vnode;
    const movePositions = [, ];
    let resolveFn;
    const xx = fromBlacks ? 'hgfedcba' : 'abcdefgh';
    const yy = fromBlacks ? '12345678' : '87654321';
    const indicesToPos = (x, y) => `${xx[x]}${yy[y]}`;

    const onMouse = (i) => (ev) => {
        //ev.redraw = false;
        
        if (i === 0) {
            sfx &&initSfx();
        }

        if (i === 1) {
            ev.stopPropagation();
            ev.preventDefault();
        }
        const svgEl = vnode.dom;
        const { top, left, width, height } = svgEl.getBoundingClientRect();
        const e = ev.changedTouches ? ev.changedTouches[0] : ev;
        const xRatio = (e.clientX - left) / width;
        const yRatio = (e.clientY - top)  / height;

        const x = vb[0] + xRatio * vb[2];
        const y = vb[1] + yRatio * vb[3];

        if ((x < 0 || x > CW * 8) || (y < 0 || y > CW * 8)) {
            moveIndices[i] = undefined;
            if (i === 0) return;
            resolveFn([]);
            return;
        }

        const xi = Math.floor(x / CW);
        const yi = Math.floor(y / CW);
        movePositions[i] = indicesToPos(xi, yi);

        if (i === 1 && movePositions[0]) {
            if (resolveFn) {
                resolveFn(movePositions);
                resolveFn = undefined;
            }
        }
    };

    function updateHash() {
        //location.hash = board.getFen();
        history.replaceState(undefined, undefined, `#${board.getFen()}`); // avoid hash changes getting into the navigation history
    }

    // TODO
    function undo() {
        board = board.getLastBoard();
        board = board.getLastBoard();
        updateHash();
        window.board = board;
        redraw();
        doNextMove();
    }
    window.undo = undo;

    const title = `${players[0]} v ${players[1]}`;

    let out;

    const updateEval = async () => {
        let ev;
        if (evalBoard) {
            ev = await evalBoard(board.getFen());
        }
        document.title = ev ? `eval: ${ev} | ${title}` : title;
        evalO = { value: ev };
        redraw();
    }
    updateEval();

    const doNextMove = async () => {
        updateHash();
        try {
            out = computeOutcomes(board);
            redraw();
        } catch (err) {
            if (typeof err === 'string' && (err.includes('mate') || err.includes('draw'))) {
                redraw();
                await say(err);
                console.log(board.getPgn({
                    White: players[0],
                    Black: players[1],
                }));
                await sleep(550);
                return window.alert(err); // checkmate or draw
            }
            throw err;
        }

        const playFn = playFunctions[board.isWhiteNext() ? 0 : 1];
        
        const t0 = Date.now();
        console.log(`${playFn.name.substring(4)}...`);
        const move = await playFn(board, playTimeMs);
        const dt = Date.now() - t0;
        console.log(`after ${dt} ms got ${move}`);

        const moveAttrs = out.moveAttributesMap.get(move);
        console.log(`\nfmn: ${board._params.fullMoveNumber} ${board._params.next} hmc: ${board._params.halfMoveClock} move: ${moveAttrs?.pgn || '???'} (${move})\n`);
        redraw();
        
        const pastBoard = board;
        board = board.applyMove(move, moveAttrs?.pgn);
        sfx && playAppropriateSound(move, board);

        if (tts) await say(narrateMove(move, pastBoard, true));

        const dt2 = Date.now() - t0;
        const remainingMs = playTimeMs - dt2;
        if (remainingMs > 0) {
            console.log(`sleep for ${remainingMs} ms`)
            await sleep(remainingMs);
        }

        window.board = board; // TODO TEMP

        await updateEval();
        redraw();
        doNextMove();
    }
    setTimeout(() => {
        updateEval();
        doNextMove();
    }); // ?

    m.mount(rootEl, {
        oninit(_vnode) {
            vnode = _vnode;
        },
        view() {
            return m(
                'svg',
                {
                    viewBox: `${vb[0]} ${vb[1]} ${vb[2]} ${vb[3]}`,
                    onmousedown: onMouse(0),
                    onmouseup: onMouse(1),
                    ontouchstart: onMouse(0),
                    ontouchend: onMouse(1),
                },
                [
                    m('defs', [
                        m('filter', { id: 'emboss' }, [
                            m('feGaussianBlur', { in: 'SourceAlpha', stdDeviation: 1, result: 'blur' }),
                            m('feSpecularLighting', { in: 'blur', surfaceScale: 1.5, specularConstant: 0.66,
                            specularExponent: 100, 'lighting-color': '#bbbbbb', result: 'specOut' }, [
                                m('fePointLight', { x: -50, y: -50, z: 150 }),
                            ]),
                            m('feComposite', { in: 'specOut', in2: 'SourceAlpha', operator: 'in', result: 'specOut' }),
                            m('feComposite', { in: 'SourceGraphic', in2: 'specOut', operator: 'arithmetic', k1: 0, k2: 1, k3: 1, k4: 0, result: 'litPaint' }),
                        ]),
                        m('filter', { id: 'inner-glow' }, [
                            m('feFlood', { 'flood-color': 'yellow' }),
                            m('feComposite', { in2: 'SourceAlpha', operator: 'out' }),
                            m('feGaussianBlur', { stdDeviation: 3, result: 'blur' }),
                            m('feComposite', { in2: 'SourceGraphic', operator: 'atop' }),
                        ]),
                    ]),
                    UiBoard({ fromBlacks, drawAnnotations: hints, dest }, { board, out }),
                    Evaluation({ fromBlacks }, evalO),
                    Material({}, { board }),
                    //Moves({}, { board }),
                ]
            );
        }
    });
}

{
    const u = new URL(location.href);
    const search = u.searchParams;

    let startBoard = Board.default();
    if (location.hash) {
        const hash = decodeURIComponent(location.hash.substring(1));
        startBoard = Board.fromFen(hash);
    }
    window.board = startBoard;

    let playTimeMs = search.get('play-time-ms');
    if (!playTimeMs || isNaN(parseFloat(playTimeMs))) playTimeMs = 1200;

    const p1 = search.get('p1') || 'Human';
    const p2 = search.get('p2') || 'ZpBot';
    const players = [p1, p2];

    ui(
        {
            rootEl:          document.body,

            players,

            sfx:             search.get('sfx'),
            tts:             search.get('tts'),
            fromBlacks:      search.get('from-blacks'),
            playTimeMs:      playTimeMs,
            sfEval:          search.get('eval'),
            dest:           search.get('dest'),
            hints:           search.get('hints'),
        },
        {
            board: startBoard,
        }
    );
}
