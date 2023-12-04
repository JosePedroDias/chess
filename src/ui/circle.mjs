import m from '../../vendor/mithril.mjs';

export function Circle({  }, { center, radius, color, alpha }) {
    return m('circle', {
        transform: `translate(${center[0]}, ${center[1]})`,
        cx: 0,
        cy: 0,
        r: radius,
        style: `fill:${color || '#444' }; stroke:none; opacity:${alpha !== undefined ? alpha : 1}`,
    });
}
