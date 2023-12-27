import m from '../../vendor/mithril.mjs';

import { getBoardCaptures } from '../evaluate.mjs';

import { MOVE_HEIGHT, CW } from './constants.mjs';

import { Queen } from './neo/queen.mjs';
import { Rook } from './neo/rook.mjs';
import { Bishop } from './neo/bishop.mjs';
import { Knight } from './neo/knight.mjs';
import { Pawn } from './neo/pawn.mjs';

const WHITE = '#FFF';
const BLACK = '#000';
const BG =  '#333';
const GRAY =  '#8CC';

const size = MOVE_HEIGHT * 0.9;

const ORDER = ['q', 'r', 'b', 'n', 'p'];

function getPiece(piece, isWhite, i) {
    const fn = ((piece) => { switch (piece) {
        case 'q': return Queen;
        case 'r': return Rook;
        case 'b': return Bishop;
        case 'n': return Knight;
        case 'p': return Pawn;
        default: throw 'unexpected';
    }})(piece);
    //return fn({ isWhite }, { pos: [-1, isWhite ? i : -1 -i] });
    return m('g', {
        transform: `scale(${2.65/MOVE_HEIGHT})`,
    }, [
        fn({ isWhite }, { pos: [-1, (isWhite ? i -0.25 : -0.75 -i) * 1] }),
    ]);
}

export function MaterialSide(captures, isWhite, diff) {
    const DX = CW * 8;
    const DY = isWhite ? 0 : DX;
    const fill = isWhite ? WHITE : BLACK;
    const arr = [];
    const dy = isWhite ? size : -size;
    const baseline = isWhite ? 'hanging' : 'text-top';

    for (const p of ORDER) {
        if (captures.get(p)) arr.push([p, captures.get(p)]);
    }
    //console.log(arr);
    return m('g', {
        //transform: `translate(${DX}, ${DY}) scale(0.15)`,
        transform: `translate(${DX}, ${DY})`,
    }, [
        ...arr.map(([piece, count], i) => {
            /* return [getPiece(piece, isWhite, i), count > -1 ? m('text', {
                x: -size * 1.5,
                y: dy * i,
                style: `fill:${fill}; font-size:${size}px; dominant-baseline: ${baseline}; text-anchor: end`,
            }, `${count}`) : undefined];
 */
            const text = count === 1 ? piece : `${count} x ${piece}`;
            return m('text', {
                y: dy * i,
                style: `fill:${fill}; font-size:${size}px; dominant-baseline: ${baseline}; text-anchor: end`,
            }, text);
        }),
        diff == 0 ? undefined : m('text', {
            y: dy * arr.length,
            style: `fill:${fill}; font-size:${size}px; dominant-baseline: ${baseline}; text-anchor: end`,
        }, `(${diff > 0 ? '+' : ''}${diff})`),
    ]
    )
};

export function Material({ }, { board }) {
    const [matW, matB, diff] = getBoardCaptures(board);
    return m('g.material', [
        MaterialSide(matW, true, diff),
        MaterialSide(matB, false, -diff),
    ]);
}
