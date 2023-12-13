import m from '../../vendor/mithril.mjs';

export function Circle({ id }, { center, radius, color, alpha, title }) {
    color = color || 'black';
    alpha = alpha || 1;

    const circle = m('circle', {
        cx: center[0],
        cy: center[1],
        r: radius,
        style: `fill:${color}; stroke:none; opacity:${alpha}`,
    });

    if (!title) {
        circle.key = id;
        return circle;
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
            circle, 
        ]
    );
}
