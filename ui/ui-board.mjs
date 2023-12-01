import m from '../vendor/mithril.mjs';

import { times } from '../utils.mjs';
import { EMPTY, POSITIONS_TO_XY } from '../board.mjs';
import { isBishop, isKing, isKnight, isQueen, isRook, isWhitePiece } from '../pieces.mjs';

import { WHITE, GRAY, DARK, LIGHT } from './colors.mjs';
import { MARGIN, CW } from './constants.mjs';
import { Pawn } from './pawn.mjs';
import { Knight } from './knight.mjs';
import { Bishop } from './bishop.mjs';
import { Rook } from './rook.mjs';
import { Queen } from './queen.mjs';
import { King } from './king.mjs';

export function UiBoard(
    {},
    { board },
) {
    const pieces = [];
    for (const [pos, piece] of board) {
        if (piece === EMPTY) continue;
        const isWhite = isWhitePiece(piece);

        let Fn = Pawn;
        if (isKnight(piece)) Fn = Knight;
        else if (isBishop(piece)) Fn = Bishop;
        else if (isRook(piece)) Fn = Rook;
        else if (isQueen(piece)) Fn = Queen;
        else if (isKing(piece)) Fn = King;

        const posXY = POSITIONS_TO_XY.get(pos);
        pieces.push(Fn({ isWhite }, { pos: posXY }))
    }

    return m('g', [
        // bg
        m('rect', { width: 9 * CW, height: 9 * CW, x: -0.5 * CW, y: -0.5 * CW, fill: GRAY }),
        // cells
        ...times(64).map((i) => {
            const xi = i % 8;
            const yi = Math.floor(i / 8);
            const isEven = (xi + yi) % 2 === 0;
            return m('rect', {
                x: xi * CW,
                y: yi * CW,
                width:  CW,
                height: CW,
                fill: isEven ? LIGHT : DARK,
            });
        }),
        // cell labels
        ...times(8).map((i) => {
            return m('text', { x: -MARGIN * 0.75 * CW, y: (i - 0.5) * CW, dy: CW, 'dominant-baseline':'middle', fill: WHITE }, `${i + 1}`);
        }),
        ...times(8).map((i) => {
            return m('text', { x: (i + 0.5) * CW, y: (7 + MARGIN * 0.75) * CW, dy: CW, 'text-anchor': 'middle', fill: WHITE }, `${String.fromCharCode(97 + i)}`);
        }),
        // pieces
        ...pieces
    ]);
};
