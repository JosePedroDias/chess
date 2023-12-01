import { mount, redraw, default as m } from '../vendor/mithril.mjs';

import { Board, WHITE } from '../board.mjs';
import { validMoves, moveToString } from '../moves.mjs';
import { electNextMove } from '../evaluate.mjs';
import { UiBoard } from './ui-board.mjs';
import { MARGIN, CW } from './constants.mjs';

const BOT_VS_BOT = true;
const HUMAN_SIDE = WHITE;
const BOT_SPEED_MS = 1500;

export function ui(
    { rootEl },
    { board }
) {
    mount(rootEl, {
        oninit(vnode) {
            let timer = setInterval(async () => {
                let move;
                if (!BOT_VS_BOT && board._params.next === HUMAN_SIDE) {
                    const possibleMoves = validMoves(board).map(moveToString);
                    do {
                        console.log(possibleMoves.map((move) => `* ${move}`).join('\n'));
                        move = window.prompt('move?');
                        if (move === '') console.log(board.getPgn());
                    } while (!possibleMoves.includes(move));
                } else {
                    move = await electNextMove(board);
                }
                
                console.log(`\nmove: ${move}\n`);
                try {
                    board = board.applyMove(move, true);
                } catch (err) {
                    console.error(err);
                    clearInterval(timer);
                    timer = undefined;
                    return;
                }
                
                console.log(board.toPrettyString({ details: true }));
                redraw();
            }, BOT_SPEED_MS);
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
                    UiBoard({}, { board }),
                ],
            );
        }
    });
}

ui(
    {
        rootEl: document.body,
    },
    {
        board: Board.default(),
    }
);
