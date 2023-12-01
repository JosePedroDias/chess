import { mount, redraw, default as m } from '../vendor/mithril.mjs';

import { sleep } from '../utils.mjs';
import { Board, WHITE } from '../board.mjs';
import { electNextMove, validMoves2 } from '../evaluate.mjs';
import { UiBoard } from './ui-board.mjs';
import { MARGIN, CW } from './constants.mjs';
import { promptDialog } from './prompt-dialog.mjs';

const BOT_VS_BOT = false;
const HUMAN_VS_HUMAN = false;
const HUMAN_SIDE = WHITE;
const BOT_SPEED_MS = 1500;
const FROM_BLACKS = false;

export function ui(
    { rootEl },
    { board }
) {
    mount(rootEl, {
        oninit(_vnode) {
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
                        await sleep(200);
                        move = await promptDialog(`next move for ${board._params.next}?`, moves, '');

                        if (move === '') {
                            setTimeout(doNextMove, 5 * BOT_SPEED_MS);
                            return;
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
                
                //console.log(board.toPrettyString({ details: true, fromBlacks: FROM_BLACKS }));
                redraw();
                setTimeout(doNextMove, BOT_SPEED_MS);
            }

            setTimeout(doNextMove, BOT_SPEED_MS);
        },
        view() {
            return m(
                'svg',
                {
                    //width: 8 * CW,
                    //height: 8 * CW,
                    viewBox: `${-MARGIN * CW} ${-MARGIN * CW} ${(8 + 2 * MARGIN) * CW} ${(8 + 2 * MARGIN) * CW}`,
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
