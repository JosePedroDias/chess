import { mount, default as m } from '../vendor/mithril.mjs';

import { Board } from '../board.mjs';
import { UiBoard } from './ui-board.mjs';
import { MARGIN, CW } from './constants.mjs';

export function ui(
    { rootEl },
    { board }
) {
    mount(rootEl, {
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
