import { redraw, default as m } from '../../vendor/mithril.mjs';

import { Board, BLACK, WHITE } from '../board.mjs';
import { computeOutcomes, play, heuristic1, sortDescByScore } from '../evaluate.mjs';
import { UiBoard } from './ui-board.mjs';
import { MARGIN, CW } from './constants.mjs';
import { promptDialog } from './prompt-dialog.mjs';
import { moveToObject, isChecking } from '../move.mjs';

import { initSfx, playSample } from '../sfx/sfx.mjs';

import { setup as setupStockfish, evalBoard } from '../stockfish-browser-wrapper.mjs';
import { sleep } from '../utils.mjs';

let BOT_VS_BOT = false;
let HUMAN_VS_HUMAN = false;
let HUMAN_SIDE = WHITE;
let BOT_SPEED_MS = 1500;
let FROM_BLACKS = false;

const USE_STOCKFISH = true;

if (USE_STOCKFISH) setupStockfish(20);

const moveIndices = new Array(2);

function playAppropriateSound(move, resultingBoard) {
    const moveO = moveToObject(move, resultingBoard.getLastBoard());
    const isCheck = isChecking(resultingBoard, !resultingBoard.isWhiteNext());
    if (isCheck)         playSample('notificationSound');
    if (moveO.isCapture) playSample('move');
    else                 playSample('dragSlide', 0.33);
}

export function ui(
    { rootEl, fromBlacks },
    { board }
) {
    let out = {};

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

    // TODO HACKY TEMPORARY
    function undo() {
        board = board.getLastBoard();
        location.hash = board.getFen();
        window.board = board;
        redraw();
    }
    window.undo = undo;

    const updateEval = async () => {
        if (!USE_STOCKFISH) return;
        let ev = await evalBoard(board.getFen());

        // instead of centered on white, centered on who's the human player
        if (isFinite(ev) && HUMAN_SIDE === BLACK) ev = -ev;
        document.title = `chess eval: ${ev}`;
    }
    
    updateEval();

    const doNextMove = async () => {
        location.hash = board.getFen();

        try {
            out = await computeOutcomes(board);
            {
                const candidates = Array.from(out.moveAttributesMap.values());
                candidates.forEach(heuristic1);
                sortDescByScore(candidates);
                console.table(candidates);
            } 
            redraw();
        } catch (err) {
            if (typeof err === 'string' && (err.includes('mate') || err.includes('draw'))) {
                redraw();
                await sleep(100);
                return window.alert(err); // checkmate or draw
            }
            throw err;
        }

        let move;
        if (HUMAN_VS_HUMAN || (!BOT_VS_BOT && board._params.next === HUMAN_SIDE)) {
            // HUMAN IS NOW PLAYING

            const moves = out.moves;
            moves.sort();

            do {
                const prom = new Promise((resolve) => { resolveFn = resolve; });
                const [from, to] = await prom;

                //console.log(`${from} -> ${to}`);
                move = `${from}${to}`;
                const candidates = [];
                for (const mv of moves) {
                    if (mv.indexOf(move) !== -1) candidates.push(mv);
                }
                if (candidates.length === 1) {
                    move = candidates[0];
                } else if (candidates.length > 1) {
                    move = await promptDialog(`choose promotion for ${board._params.next}?`, candidates, '');
                }
            } while (!moves.includes(move));
        } else {
            // BOT IS NOW PLAYING

            await sleep(BOT_SPEED_MS);
            move = await play(board);
        }

        const moveAttrs = out.moveAttributesMap.get(move);
        console.log(`\n${board._params.fullMoveNumber}.${board._params.halfMoveClock} move: ${moveAttrs.pgn}\n`);
        board = board.applyMove(move, moveAttrs.pgn);
        playAppropriateSound(move, board);
        
        window.board = board; // TODO TEMP

        updateEval();
        
        redraw();

        doNextMove();
    }

    setTimeout(doNextMove); // ?

    m.mount(rootEl, {
    //m.render(rootEl, m({
        oninit(_vnode) {
            vnode = _vnode;
        },
        view() {
            return m(
                'svg',
                {
                    //width: 8 * CW,
                    //height: 8 * CW,
                    viewBox: `${vb[0]} ${vb[1]} ${vb[2]} ${vb[3]}`,
                    onmousedown: onMouse(0),
                    onmouseup: onMouse(1),
                    ontouchstart: onMouse(0),
                    ontouchend: onMouse(1),
                },
                UiBoard({ fromBlacks }, { board, out }),
            );
        }
    });
    //}));
}

const u = new URL(location.href);
const search = u.searchParams;

if (search.get('botFirst')) {
    FROM_BLACKS = true;
    HUMAN_SIDE = BLACK;
}

if (search.get('only-bots')) BOT_VS_BOT = true;
else if (search.get('only-humans')) HUMAN_VS_HUMAN = true;

{
    const speed = parseFloat(search.get('speed'));
    if (speed && !isNaN(speed)) BOT_SPEED_MS = speed;
}

let startBoard = Board.default();
if (location.hash) {
    const hash = decodeURIComponent(location.hash.substring(1));
    if (hash.substring(0, 2) === '1.') {
        // from pgn
        //startBoard = Board.fromPgn(hash); // TODO
    } else {
        // from fen
        startBoard = Board.fromFen(hash);
        HUMAN_SIDE = startBoard._params.next;
        FROM_BLACKS = !startBoard.isWhiteNext();
        window.board = startBoard; // TODO TEMP
        //console.log(startBoard.toPrettyString({ details: true }));
    }
} else {
    window.board = startBoard; // TODO TEMP
}
ui(
    {
        rootEl: document.body,
        fromBlacks: FROM_BLACKS,
    },
    {
        board: startBoard,
    }
);
