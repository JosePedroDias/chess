import m from '../vendor/mithril.mjs';

import { CW, STROKE_WIDTH } from './constants.mjs';
import { BLACK, WHITE } from './colors.mjs';

export function King({ isWhite }, { pos }) {
    const fill = isWhite ? WHITE : BLACK;
    const fill2 = isWhite ? BLACK : WHITE;
    const stroke = isWhite ? BLACK : WHITE;
    const stroke2 = isWhite ? WHITE : BLACK;

    const x = pos[0] * CW;
    const y = pos[1] * CW;

    return m('g',
        {
            transform: `translate(${x}, ${y})`,
            style: `fill:none; stroke:${stroke}; stroke-width:${STROKE_WIDTH}; fill-opacity:1; fill-rule:evenodd; stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1`,
        },
        [
            m('path', {
                d: `M 22.5,11.63 L 22.5,6 M 20,8 L 25,8`,
                style: `stroke:${isWhite ? stroke : stroke2}; stroke-linejoin:miter`,
            }),
            m('path', {
                d: `M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25`,
                style: `fill:${fill}; fill-opacity:1; stroke-linecap:butt; stroke-linejoin:miter`,
            }),
            m('path', {
                d: `M 12.5,37 C 18,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 20,16 10.5,13 6.5,19.5 C 3.5,25.5 12.5,30 12.5,30 L 12.5,37`,
                style: `fill:${fill}; stroke:${stroke2}`,
            }),
            m('path', {
                d: `M 32,29.5 C 32,29.5 40.5,25.5 38.03,19.85 C 34.15,14 25,18 22.5,24.5 L 22.5,26.6 L 22.5,24.5 C 20,18 10.85,14 6.97,19.85 C 4.5,25.5 13,29.5 13,29.5`,
            }),
            m('path', {
                d: `M 12.5,30 C 18,27 27,27 32.5,30 M 12.5,33.5 C 18,30.5 27,30.5 32.5,33.5 M 12.5,37 C 18,34 27,34 32.5,37`,
            }),
        ]
    );
}
