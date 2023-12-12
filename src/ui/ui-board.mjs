import m from '../../vendor/mithril.mjs';

import { times, randomColor } from '../utils.mjs';
import { EMPTY, POSITIONS_TO_XY } from '../board.mjs';
import { isBishop, isKing, isKnight, isQueen, isRook, isWhitePiece } from '../pieces.mjs';
import { moveToObject, validMoves, isBeingAttacked } from '../move.mjs';

import { WHITE, GRAY, DARK, LIGHT } from './colors.mjs';
import { MARGIN, CW } from './constants.mjs';

/*
import { Pawn } from './wiki/pawn.mjs';
import { Knight } from './wiki/knight.mjs';
import { Bishop } from './wiki/bishop.mjs';
import { Rook } from './wiki/rook.mjs';
import { Queen } from './wiki/queen.mjs';
import { King } from './wiki/king.mjs';
*/

import { Pawn } from './neo/pawn.mjs';
import { Knight } from './neo/knight.mjs';
import { Bishop } from './neo/bishop.mjs';
import { Rook } from './neo/rook.mjs';
import { Queen } from './neo/queen.mjs';
import { King } from './neo/king.mjs';

//import { Circle } from './circle.mjs';
import { Ring } from './ring.mjs';
import { Arrow } from './arrow.mjs';
import { add, mulScalar } from './geometry.mjs';

export function UiBoard(
    { fromBlacks },
    { board },
) {
    const posToXY = (pos) => {
        const posXY = Array.from(POSITIONS_TO_XY.get(pos));
        if (fromBlacks) {
            posXY[0] = 7 - posXY[0];
            posXY[1] = 7 - posXY[1];
        }
        return posXY;
    }

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

        pieces.push(Fn({ isWhite }, { pos: posToXY(pos) }))
    }

    const annotations = [];

    const lastMove = board.getLastMove();
    const possibleMoves = validMoves(board);
    const riskedPositions = board.getSidePositions().filter(([pos, _]) => {
        return isBeingAttacked(pos, board, !board.isWhiteNext());
    }).map(([a]) => a);

    const ARROW_SCALE_LAST = 2;
    const ANNO_STROKE_WIDTH = 0.33;
    const ANNO_ALPHA = 0.75;

    const toBoardCoords = (pos) => mulScalar(CW, add(posToXY(pos), [0.5, 0.5]));

    // TODO
    for (const pos of riskedPositions) {
        annotations.push(
            Ring({}, {
                center: toBoardCoords(pos),

                //outerRadius: CW * 0.5,
                //innerRadius: CW * 0.44,

                radius: CW * 0.44,
                strokeWidth: CW * 0.06,
                
                color: 'red',
                alpha: ANNO_ALPHA,
            }),
        );
    }

    for (const mv of possibleMoves) {
        const mvO = moveToObject(mv, board);
        const color = randomColor();
        annotations.push(
            Arrow({}, {
                from: toBoardCoords(mvO.from),
                to: toBoardCoords(mvO.to),
                fill: { color, alpha: ANNO_ALPHA },
                stroke: { color, width: ANNO_STROKE_WIDTH },
                width: 1,
                arrowW: 1.8,
                arrowH: 6,
                title: mv,
            }),
        );
        if (mvO.from2) {
            annotations.push(
                Arrow({}, {
                    from: toBoardCoords(mvO.from2),
                    to: toBoardCoords(mvO.to2),
                    fill: { color, alpha: ANNO_ALPHA },
                    stroke: { color, width: ANNO_STROKE_WIDTH },
                    width: 1,
                    arrowW: 1.8,
                    arrowH: 6,
                    title: mv,
                })
            );
        }
    }

    if (lastMove) {
        const mvO = moveToObject(lastMove, board.getLastBoard());
        const color = board.isWhiteNext() ? '#333' : '#CCC';
        annotations.push(
            Arrow({}, {
                from: toBoardCoords(mvO.from),
                to: toBoardCoords(mvO.to),
                fill: { color, alpha: ANNO_ALPHA, ANNO_STROKE_WIDTH },
                stroke: { color },
                width: ARROW_SCALE_LAST * 1,
                arrowW: ARROW_SCALE_LAST *  1.8,
                arrowH: ARROW_SCALE_LAST * 6,
                title: lastMove,
            }),
        );
    }

    const yToRank = (i) => fromBlacks ? i + 1 : 8 - i;
    const xToFile = (i) => String.fromCharCode( fromBlacks ? 104 - i : 97 + i );

    return m('g', { 'x-comment' : 'chess board' }, [
        m('g', { 'x-comment' : 'bg' }, [
            m('rect', { width: 9 * CW, height: 9 * CW, x: -0.5 * CW, y: -0.5 * CW, fill: GRAY }),
        ]),

        m('g', { 'x-comment' : 'cells' }, [
            times(64).map((i) => {
                const xi = i % 8;
                const yi = Math.floor(i / 8);
                const isEven = (xi + yi) % 2 === 0;
                return m('rect', {
                    x: xi * CW,
                    y: yi * CW,
                    width:  CW,
                    height: CW,
                    fill: isEven ? LIGHT : DARK,
                }, [
                    m('title', `${xToFile(xi)}${yToRank(yi)}`),
                ]);
            }),
        ]),

        m('g', { 'x-comment' : 'labels' }, [
            ...times(8).map((i) => {
                return m(
                    'text',
                    {
                        x: -MARGIN * 0.75 * CW,
                        y: (i - 0.5) * CW,
                        dy: CW,
                        fill: WHITE,
                        'dominant-baseline': 'middle',
                    },
                    yToRank(i),
                );
            }),
            ...times(8).map((i) => {
                return m(
                    'text',
                    {
                        x: (i + 0.5) * CW,
                        y: (7 + MARGIN * 0.75) * CW,
                        dy: CW,
                        fill: WHITE,
                        'text-anchor': 'middle',
                    },
                    xToFile(i),
                );
            }),
        ]),

        m('g', { 'x-comment' : 'pieces' }, pieces),

        m('g', { 'x-comment' : 'annotations' }, annotations),
        //console.log(annotations)
    ]);
};
