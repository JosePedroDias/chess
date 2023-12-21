import m from '../../vendor/mithril.mjs';

import { clamp } from '../utils.mjs';
import { CW } from './constants.mjs';
import { BLACK, WHITE } from './colors.mjs';

const MAX = 5;

export function Evaluation({ fromBlacks }, { value }) {
    const x = CW * 8.05;
    const y = CW * 4;

    const si = fromBlacks ? -1 : 1;

    const value_ = clamp(value, -MAX, MAX);
    const dy = si * ((isFinite(value_) ? value_ : 0) / MAX) * 4 * CW;
    
    const valueT = isFinite(value) ? Math.abs(value).toFixed(2) : '?';

    const y0 = dy > 0 ? 0  : dy;
    const y1 = dy > 0 ? dy : -dy;

    if (!value) return null;

    return m('g',
        {
            'x-comment' : 'evaluation bar',
            transform: `translate(${x}, ${y})`,
            style: `stroke:none; stroke-linecap:round; stroke-linejoin:round; stroke-miterlimit:4`,
        },
        [
            m('rect', {
                y: y0,
                width:  CW * 0.2,
                height: y1,
                fill: value_ > 0 ? WHITE : BLACK,
            }),
            m(
                'text',
                {
                    dy,
                    style: `stroke:none; font-size:4px; font-weight:600; dominant-baseline: ${dy > 0 ? 'auto' : 'hanging'}`,
                    fill: value_ < 0 ? WHITE : BLACK,
                },
                valueT,
            ),
        ]
    );
}
