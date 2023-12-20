import m from '../../../vendor/mithril.mjs';

import { CW, STROKE_WIDTH } from '../constants.mjs';
import { BLACK, WHITE } from '../colors.mjs';

export function Rook({ isWhite, id }, { pos }) {
    const fill = isWhite ? WHITE : BLACK;
    const stroke = isWhite ? BLACK : WHITE;

    const x = pos[0] * CW;
    const y = pos[1] * CW;

    return m('g.enter',
        {
            key: id,
            transform: `translate(${x}, ${y + 0.3})`,
            style: `fill:${fill}; stroke:${stroke}; stroke-width:${STROKE_WIDTH}; opacity:1; fill-opacity:1; fill-rule:evenodd; stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1`,
            onbeforeremove(vnode) {
                vnode.dom.classList.add('leave');
                return new Promise((resolve) => vnode.dom.addEventListener('animationend', resolve));
            },
        },
        [
            m('title', `${isWhite ? 'white' : 'black'} rook`),
            m('path', {
                d: `M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z`,
                style: `stroke-linecap:butt`,
            }),
            m('path', {
                d: `M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z`,
                style: `stroke-linecap:butt`,
            }),
            m('path', {
                d: `M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14`,
                style: `stroke-linecap:butt`,
            }),
            m('path', {
                d: `M 34,14 L 31,17 L 14,17 L 11,14`,
            }),
            m('path', {
                d: `M 31,17 L 31,29.5 L 14,29.5 L 14,17`,
                style: `stroke-linecap:butt; stroke-linejoin:miter`,
            }),
            m('path', {
                d: `M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5`,
            }),
            m('path', {
                d: `M 11,14 L 34,14`,
                style: `fill:none; stroke:${stroke}; stroke-linejoin:miter`,
            }),
        ]
    );
}
