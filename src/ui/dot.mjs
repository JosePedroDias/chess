import m from '../../vendor/mithril.mjs';

import { CW } from './constants.mjs';

export function Dot({  }, { pos, color, alpha }) {
    const x = pos[0] * CW;
    const y = pos[1] * CW;

    return m('circle', {
        transform: `translate(${x}, ${y})`,
        cx: 0.5 * CW,
        cy: 0.5 * CW,
        r: 0.2 * CW,
        style: `fill:${color || '#444' }; stroke:none; opacity:${alpha !== undefined ? alpha : 0.75}`,
    });
}
