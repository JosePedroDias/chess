import m from '../../vendor/mithril.mjs';

export function Circle({  }, { center, radius, color, alpha, title }) {
    color = color || 'black';
    alpha = alpha || 1;

    const circle = m('circle', {
        cx: center[0],
        cy: center[1],
        r: radius,
        style: `fill:${color}; stroke:none; opacity:${alpha}`,
    });

    if (!title) return circle;

    return m('g', [
        m('title', title),
        circle, 
    ]);
}
