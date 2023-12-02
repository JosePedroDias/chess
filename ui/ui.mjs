import { mount, redraw, default as m } from '../vendor/mithril.mjs';

import { Board, WHITE } from '../board.mjs';
import { electNextMove, validMoves2 } from '../evaluate.mjs';
import { UiBoard } from './ui-board.mjs';
import { MARGIN, CW } from './constants.mjs';
import { promptDialog } from './prompt-dialog.mjs';
import { moveFromString } from '../moves.mjs';

const BOT_VS_BOT = false;
const HUMAN_VS_HUMAN = false;
const HUMAN_SIDE = WHITE;
const BOT_SPEED_MS = 1500;
const FROM_BLACKS = false;

export function ui(
    { rootEl },
    { board }
) {
    let vnode;

    const vb = [
        -MARGIN * CW,
        -MARGIN * CW,
        (8 + 2 * MARGIN) * CW,
        (8 + 2 * MARGIN) * CW,
    ];

    const movePositions = [, ];

    let resolveFn;

    const xx = 'abcdefgh';
    const yy = '87654321';
    const indicesToPos = (x, y) => `${xx[x]}${yy[y]}`;

    const onMouse = (i) => (ev) => {
        const svgEl = vnode.dom;
        const { top, left, width, height } = svgEl.getBoundingClientRect();
        const xRatio = (ev.clientX - left) / width;
        const yRatio = (ev.clientY - top)  / height;

        const x = vb[0] + xRatio * vb[2];
        const y = vb[1] + yRatio * vb[3];

        if ((x < 0 || x > CW * 8) || (y < 0 || y > CW * 8)) {
            moveIndices[i] = undefined;
            if (i === 0) return;
            resolveFn('', '');
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
        window.board = board;
        redraw();
    }
    window.undo = undo;

    const updateEval = () => window.evalBoard(board).then((e) => document.title = `chess eval: ${e}`);
    
    updateEval();

    const doNextMove = async () => {
        location.hash = board.getFen();

        let move;
        if (HUMAN_VS_HUMAN || (!BOT_VS_BOT && board._params.next === HUMAN_SIDE)) {
            const moves = validMoves2(board);
            moves.sort();

            if (moves.length === 0) {
                window.alert(isMoveStringCheck(board.getLastMove()) ? 'check mate' : 'stale mate');
            }

            do {
                //move = await promptDialog(`next move for ${board._params.next}?`, moves, '');

                const prom = new Promise((resolve) => {
                    resolveFn = resolve;
                });
                const [from, to] = await prom;
                //console.log(`${from} -> ${to}`);
                move = '';
                for (const mvS of moves) {
                    let mvO = moveFromString(mvS, board);
                    if (mvO instanceof Array) mvO = mvO[0];
                    if (from === mvO.from.pos && to === mvO.to.pos) {
                        move = mvS;
                        //console.log('matched', mvS, 'to', mvO);
                    }
                }
            } while (!moves.includes(move));
        } else {
            try {
                move = electNextMove(board);
            } catch (err) {
                window.alert(err); // check mate / stale mate
                console.error(err);
                return;
            }
        }

        console.log(`\nmove: ${move}\n`);
        try {
            board = board.applyMove(move, true);
            window.board = board; // TODO TEMP
        } catch (err) {
            console.error(err);
            return;
        }

        updateEval();
        
        redraw();
        setTimeout(doNextMove, BOT_SPEED_MS);
    }

    setTimeout(doNextMove, BOT_SPEED_MS);

    mount(rootEl, {
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
                },
                [
                    m('defs', [
                        // used by arrow.mjs
                        m(
                            'marker',
                            {
                                id: 'head',
                                orient: 'auto',
                                markerWidth: 3,
                                markerHeight: 4,
                                refX: 0.1,
                                refY: 2,
                                //markerUnits: 'strokeWidth',
                            },
                            [
                                m(
                                    'path',
                                    {
                                        d: 'M0,0 V4 L2,2 Z',
                                        style: `fill:context-stroke`,
                                    }
                                ),
                            ]
                        ),
                    ]),
                    UiBoard({ fromBlacks: FROM_BLACKS }, { board }),
                ],
            );
        }
    });
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
        window.board = startBoard; // TODO TEMP
        //console.log(startBoard.toPrettyString({ details: true }));
    }
} else {
    window.board = startBoard; // TODO TEMP
}
ui(
    {
        rootEl: document.body,
    },
    {
        board: startBoard,
    }
);
