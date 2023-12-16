import { redraw, default as m } from '../../vendor/mithril.mjs';

import { Board } from '../board.mjs';
import { computeOutcomes, playZpBot, playSF } from '../evaluate.mjs';
import { UiBoard } from './ui-board.mjs';
import { MARGIN, CW } from './constants.mjs';
import { promptDialog } from './prompt-dialog.mjs';
import { moveToObject, isChecking } from '../move.mjs';

import { initSfx, playSample } from '../sfx/sfx.mjs';

import { setup, evalBoard } from '../stockfish-browser-wrapper.mjs';
import { sleep } from '../utils.mjs';

const USE_STOCKFISH_EVAL = true;
setup(20);

const moveIndices = new Array(2);

function playAppropriateSound(move, resultingBoard) {
    const moveO = moveToObject(move, resultingBoard.getLastBoard());
    const isCheck = isChecking(resultingBoard, !resultingBoard.isWhiteNext());
    if (isCheck)         playSample('notificationSound');
    if (moveO.isCapture) playSample('move');
    else                 playSample('dragSlide', 0.33);
}

export function ui(
    { rootEl, playMs, fromBlacks, drawAnnotations, onlyBots, onlyHumans },
    { board }
) {
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
    const playFunctions = [ playHuman, playZpBot ];
    if      (onlyBots)   playFunctions[0] = playSF;
    else if (onlyHumans) playFunctions[1] = playHuman;

    const playingWhite = playFunctions[0].name.substring(4);
    const playingBlack = playFunctions[1].name.substring(4);

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
        
        if (i === 0) initSfx();

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

    // TODO
    function undo() {
        board = board.getLastBoard();
        board = board.getLastBoard();
        location.hash = board.getFen();
        window.board = board;
        redraw();
        doNextMove();
    }
    window.undo = undo;

    const title = `${playingWhite} v ${playingBlack}`;

    let out;

    const updateEval = async () => {
        if (!USE_STOCKFISH_EVAL) return;
        let ev = await evalBoard(board.getFen());
        document.title = `eval: ${ev} | ${title}`;
    }
    updateEval();

    const doNextMove = async () => {
        location.hash = board.getFen();
        try {
            out = await computeOutcomes(board);
            redraw();
        } catch (err) {
            if (typeof err === 'string' && (err.includes('mate') || err.includes('draw'))) {
                console.log(board.getPgn({
                    White: playingWhite,
                    Black: playingBlack,
                }));
                redraw();
                await sleep(100);
                return window.alert(err); // checkmate or draw
            }
            throw err;
        }

        const playFn = playFunctions[board.isWhiteNext() ? 0 : 1];
        
        const t0 = Date.now();
        console.log(`${playFn.name.substring(4)}...`);
        const move = await playFn(board);
        const dt = Date.now() - t0;
        console.log(`after ${dt} ms got ${move}`);

        const remainingMs = playMs - dt;
        if (remainingMs > 0) {
            console.log(`sleep for ${remainingMs} ms`)
            await sleep(remainingMs);
        }

        const moveAttrs = out.moveAttributesMap.get(move);
        console.log(`\nfmn: ${board._params.fullMoveNumber} ${board._params.next} hmc: ${board._params.halfMoveClock} move: ${moveAttrs.pgn} (${move})\n`);
        board = board.applyMove(move, moveAttrs.pgn);
        playAppropriateSound(move, board);
        
        window.board = board; // TODO TEMP

        updateEval();
        redraw();
        doNextMove();
    }
    setTimeout(doNextMove); // ?

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
                UiBoard({ fromBlacks, drawAnnotations }, { board, out }),
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

    ui(
        {
            rootEl:          document.body,
            playMs:          550,
            fromBlacks:      search.get('from-blacks'),
            drawAnnotations: search.get('hints'),
            onlyBots:        search.get('only-bots'),
            onlyHumans:      search.get('only-humans'),
        },
        {
            board: startBoard,
        }
    );
}
