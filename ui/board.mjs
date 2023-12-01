import m from '../vendor/mithril.mjs';

import { times } from '../utils.mjs';
import { WHITE, GRAY, DARK, LIGHT } from './colors.mjs';
import { MARGIN, CW } from './constants.mjs';
import { pawn } from './pawn.mjs';
import { knight } from './knight.mjs';
import { bishop } from './bishop.mjs';
import { rook } from './rook.mjs';
import { queen } from './queen.mjs';
import { king } from './king.mjs';

export function board() {
    return m('g', [
        // bg
        m('rect', { width: 9 * CW, height: 9 * CW, x: -0.5 * CW, y: -0.5 * CW, fill: GRAY }),
        // cells
        ...times(64).map((i) => {
            const xi = i % 8;
            const yi = Math.floor(i / 8);
            const isEven = (xi + yi) % 2 === 0;
            return m('rect', {
                x: xi * CW,
                y: yi * CW,
                width:  CW,
                height: CW,
                fill: isEven ? LIGHT : DARK,
            });
        }),
        // cell labels
        ...times(8).map((i) => {
            return m('text', { x: -MARGIN * 0.75 * CW, y: (i - 0.5) * CW, dy: CW, 'dominant-baseline':'middle', fill: WHITE }, `${i + 1}`);
        }),
        ...times(8).map((i) => {
            return m('text', { x: (i + 0.5) * CW, y: (7 + MARGIN * 0.75) * CW, dy: CW, 'text-anchor': 'middle', fill: WHITE }, `${String.fromCharCode(97 + i)}`);
        }),
        // pieces
        pawn({ isWhite: true }, { pos: [0, 0] }),
        knight({ isWhite: false }, { pos: [1, 0] }),
        bishop({ isWhite: true }, { pos: [2, 0] }),
        rook({ isWhite: false }, { pos: [3, 0] }),
        queen({ isWhite: true }, { pos: [4, 0] }),
        king({ isWhite: false }, { pos: [5, 0] }),
    ]);
};
