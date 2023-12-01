import m from '../vendor/mithril.mjs';

import { CW, STROKE_WIDTH } from './constants.mjs';
import { BLACK, WHITE } from './colors.mjs';

export function pawn({ isWhite }, { pos }) {
    const fill = isWhite ? WHITE : BLACK;
    const stroke = isWhite ? BLACK : WHITE;

    const x = pos[0] * CW;
    const y = pos[1] * CW;

    return m('path', {
        transform: `translate(${x}, ${y})`,
        style: `fill:${fill}; stroke:${stroke}; stroke-width:${STROKE_WIDTH}; opacity:1; fill-opacity:1; fill-rule:nonzero; stroke-linecap:round; stroke-linejoin:miter; stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1`,
        d: `m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 H 34 C 34,31.58 29.59,27.09 26.59,26.03 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z`,
    });
}
