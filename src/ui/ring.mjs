import m from '../../vendor/mithril.mjs';

export function Ring({  }, { center, outerRadius, innerRadius, radius, strokeWidth, color, alpha, title }) {
    color = color || 'black';
    alpha = alpha || 1;

    if (!radius) {
        radius = (outerRadius + innerRadius) / 2;
        strokeWidth = (outerRadius - innerRadius);
    }
    
    const ring = m('circle', {
        cx: center[0],
        cy: center[1],
        r: radius,
        style: `fill:none; stroke:${color}; stroke-width:${strokeWidth}; opacity:${alpha}`,
    });

    if (!title) return ring;

    return m('g', [
        m('title', title),
        ring, 
    ]);
}
