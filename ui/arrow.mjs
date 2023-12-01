import m from '../vendor/mithril.mjs';

import { CW } from './constants.mjs';

export function Arrow({  }, { from, to, color, alpha }) {
    const x0 = (from[0] + 0.5) * CW;
    const y0 = (from[1] + 0.5) * CW;
    const x1 = (to[0]   + 0.5) * CW;
    const y1 = (to[1]   + 0.5) * CW;

    return m(
        'path',
        {
            d: `M${x0},${y0} ${x1},${y1}`,
            style: `stroke:${ color || 'red' }; stroke-width:3; opacity:${ alpha !== undefined ? alpha : 1 }; marker-end:url(#head)`,
        }
    );
}
