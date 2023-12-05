import m from '../../vendor/mithril.mjs';

export function Ring({  }, { center, outerRadius, innerRadius, radius, strokeWidth, color, alpha }) {
    if (!radius) {
        radius = (outerRadius + innerRadius) / 2;
        strokeWidth = (outerRadius - innerRadius);
    }
    return m('circle', {
        cx: center[0],
        cy: center[1],
        r: radius,
        style: `fill:none; stroke:${color || '#444' }; stroke-width:${strokeWidth}; opacity:${alpha !== undefined ? alpha : 1}`,
    });
}