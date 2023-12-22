import m from '../../vendor/mithril.mjs';
import { CW } from './constants.mjs';

const STROKE_WIDTH = 1;

export function Dashed({  }, { pos, color, alpha, inverted }) {
    const stroke = color || 'black';
    alpha = alpha || 1;

    const x = pos[0] * CW;
    const y = pos[1] * CW;

    return m('path',
        {
            transform: `translate(${x}, ${y})`,
            class: 'dashed',
            style: `fill:none; stroke:${stroke}; stroke-opacity:${alpha}; stroke-width:${STROKE_WIDTH}; stroke-linecap:round; stroke-linejoin:round; stroke-miterlimit:4`,
            d: inverted ?
            `M 37.5,0 45,7.5 M 30,0 45,15 M 22.5,0 45,22.5 M 15,0 45,30 M 7.5,0 45,37.5 M 0,0 45,45 M 0,7.5 37.5,45 M 0,15 30,45 M 0,22.5 22.5,45 M 0,30 15,45 M 0,37.5 7.5,45` :
            `M 7.5,0 L 0,7.5 M 15,0 L 0,15 M 22.5,0 L 0,22.5 M 30,0 L 0,30 M 37.5,0 L 0,37.5 M 45,0 L 0,45 M 45,7.5 L 7.5,45 M 45,15 L 15,45 M 45,22.5 L 22.5,45 M 45,30 L 30,45 M 45,37.5 L 37.5,45`,
        }
    );
}
