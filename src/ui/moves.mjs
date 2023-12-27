import m from '../../vendor/mithril.mjs';

import { pairUp } from '../utils.mjs';
import { MOVE_HEIGHT } from './constants.mjs';

const WHITE = '#FFF';
const BLACK = '#000';
const BG =  '#333';
const GRAY =  '#8CC';

export function Move(movePgn, isWhite) {
    const fill = isWhite ? WHITE : BLACK;
    return m('text.move', {
        x: isWhite ? MOVE_HEIGHT*2 : MOVE_HEIGHT*5,
        style: `fill:${fill}; font-size:${MOVE_HEIGHT}px; dominant-baseline: hanging`,
    }, movePgn);
}

export function Moves({ }, { board }) {
    const pairs = pairUp(board._movesPgn);
    return m('g.moves', [
        m('rect', {
            x: 0,
            y: 0,
            rx: MOVE_HEIGHT / 2,
            width:  MOVE_HEIGHT * 8,
            height: MOVE_HEIGHT * pairs.length,
            fill: BG,
            opacity: 0.5,
        }),
        pairs.map(([a, b], i) => m('g', {
            transform: `translate(0, ${MOVE_HEIGHT * i})`,
        }, [
            m('text', {
                x: MOVE_HEIGHT*1.5,
                style: `fill:${GRAY}; font-size:${MOVE_HEIGHT}px; text-anchor: end; dominant-baseline: hanging`,
            }, `${i + 1}.`),
                Move(a, true),
            b ? Move(b, false) : undefined,
        ]))
    ]);
}
