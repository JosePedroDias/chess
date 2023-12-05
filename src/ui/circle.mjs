import m from '../../vendor/mithril.mjs';

export function Circle({  }, { center, radius, color, alpha }) {
    return m('circle', {
        cx: center[0],
        cy: center[1],
        r: radius,
        style: `fill:${color || '#444' }; stroke:none; opacity:${alpha !== undefined ? alpha : 1}`,
    });
}
