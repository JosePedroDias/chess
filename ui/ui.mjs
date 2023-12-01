import { mount, default as m } from '../vendor/mithril.mjs';

import { board } from './board.mjs';
import { MARGIN, CW } from './constants.mjs';

export function ui({
    rootEl,
}) {
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
                    board(),
                ],
            );
        }
    });
}

ui({
    rootEl: document.body,
});
