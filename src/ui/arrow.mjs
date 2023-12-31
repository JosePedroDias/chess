import m from '../../vendor/mithril.mjs';

import { getVersor, rotate90Degrees, dist, add, mulScalar } from './geometry.mjs';

// https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polygon
// https://math.stackexchange.com/questions/2971970/create-an-arrow-shape-based-on-a-vector

/*
        6
        .
      /   \
    /       \
5 +---+ X +---+ 4
    3 |   | 2
      |   |
      |   |
      +-X-+
     1     0
*/

export function Arrow({ id }, { from, to, fill, stroke, width, arrowW, arrowH, arrowDH, title }) {
    arrowDH = arrowDH || arrowH/2;

    if (!fill) fill = {};
    if (!stroke) stroke = {};

    const fColor = fill.color || 'black';
    const fAlpha = fill.alpha || 1;

    const sColor = stroke.color || 'black';
    const sAlpha = stroke.alpha || 1;
    const sWidth = stroke.width || 1;

    const d = dist(from, to);
    const v = getVersor(from, to);
    const v_ = rotate90Degrees(v);
    const vW = mulScalar(width, v_);

    const p0 = add(from, vW);
    const p1 = add(from, mulScalar(-1, vW));
    
    const vMain = mulScalar(d - arrowH + arrowDH, v);
    const p2 = add(p0, vMain);
    const p3 = add(p1, vMain);

    const vArrowW = mulScalar(arrowW, v_);
    const p4 = add(p2, vArrowW);
    const p5 = add(p3, mulScalar(-1, vArrowW))
    
    const p6 = add(from, mulScalar(d + arrowDH, v));

    const polygon = m(
        'polygon',
        {
            points: [p0, p2, p4, p6, p5, p3, p1].map(p => p.join(',')).join(' '),
            style: `fill:${fColor}; fill-opacity:${fAlpha}; stroke:${sColor}; stroke-opacity:${sAlpha}; stroke-width:${sWidth}`,
        }
    );

    if (!title) {
        polygon.key = id;
        return polygon;
    }

    return m('g.enter',
        {
            key: id,
            onbeforeremove(vnode) {
                vnode.dom.classList.add('leave');
                return new Promise((resolve) => vnode.dom.addEventListener('animationend', resolve));
            },
        },
        [
            m('title', title),
            polygon, 
        ]
    );
}
