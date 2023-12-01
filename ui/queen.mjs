import m from '../vendor/mithril.mjs';

import { CW, STROKE_WIDTH } from './constants.mjs';
import { BLACK, WHITE } from './colors.mjs';

export function Queen({ isWhite }, { pos }) {
    const fill = isWhite ? WHITE : BLACK;
    const stroke = isWhite ? BLACK : WHITE;

    const x = pos[0] * CW;
    const y = pos[1] * CW;

    return m('g',
        {
            transform: `translate(${x}, ${y})`,
            style: `fill:${fill}; stroke:${stroke}; stroke-width:${STROKE_WIDTH}; stroke-linejoin:round`,
        },
        [
            m('path', {
                d: `M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.9 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.9 L 14,25 L 6.5,13.5 L 9,26 z`,
            }),
            m('path', {
                d: `M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 9.5,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z`,
            }),
            m('path', {
                d: `M 11.5,30 C 15,29 30,29 33.5,30`,
                style: `fill:none`,
            }),
            m('path', {
                d: `M 12,33.5 C 18,32.5 27,32.5 33,33.5`,
                style: `fill:none`,
            }),
            m('circle', {
                cx: 6,
                cy: 12,
                r: 2,
            }),
            m('circle', {
                cx: 14,
                cy: 9,
                r: 2,
            }),
            m('circle', {
                cx: 22.5,
                cy: 8,
                r: 2,
            }),
            m('circle', {
                cx: 31,
                cy: 9,
                r: 2,
            }),
            m('circle', {
                cx: 39,
                cy: 12,
                r: 2,
            }),
        ]
    );
}
