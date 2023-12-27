import m from '../../vendor/mithril.mjs';

import { times, randomColor } from '../utils.mjs';
import { EMPTY, POSITIONS_TO_XY } from '../board.mjs';
import { moveToObject } from '../move.mjs';
import { isBishop, isKing, isKnight, isQueen, isRook, isWhitePiece } from '../pieces.mjs';

import { WHITE, GRAY, DARK, LIGHT } from './colors.mjs';
import { MARGIN, CW } from './constants.mjs';

import { Pawn } from './neo/pawn.mjs';
import { Knight } from './neo/knight.mjs';
import { Bishop } from './neo/bishop.mjs';
import { Rook } from './neo/rook.mjs';
import { Queen } from './neo/queen.mjs';
import { King } from './neo/king.mjs';

/* import { Pawn } from './wiki/pawn.mjs';
import { Knight } from './wiki/knight.mjs';
import { Bishop } from './wiki/bishop.mjs';
import { Rook } from './wiki/rook.mjs';
import { Queen } from './wiki/queen.mjs';
import { King } from './wiki/king.mjs'; */

import { Circle } from './circle.mjs';
import { Ring } from './ring.mjs';
import { Arrow } from './arrow.mjs';
import { Dashed } from './dashed.mjs';
import { add, mulScalar } from './geometry.mjs';

export function UiBoard(
    { fromBlacks, drawAnnotations, dest },
    { board, out },
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
        const id = board.getId(pos);

        let Fn = Pawn;
        if      (isKnight(piece)) Fn = Knight;
        else if (isBishop(piece)) Fn = Bishop;
        else if (isRook(piece))   Fn = Rook;
        else if (isQueen(piece))  Fn = Queen;
        else if (isKing(piece))   Fn = King;

        pieces.push(Fn({ isWhite, id }, { pos: posToXY(pos) }))
    }

    const ARROW_SCALE_LAST = 2;
    const ANNO_STROKE_WIDTH = 0.33;
    const ANNO_ALPHA = 0.75;

    const toBoardCoords = (pos) => mulScalar(CW, add(posToXY(pos), [0.5, 0.5]));

    const annotations = [];

    const lastMove = board.getLastMove()
    if (lastMove) {
        const mvO = moveToObject(lastMove, board.getLastBoard());
        const color = board.isWhiteNext() ? '#333' : '#CCC';
        annotations.push(
            Arrow({ id: `arrow-${mvO.from}-${mvO.to}-last` }, {
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

    if (dest && out?.moves) {
        const validDestinations = new Set();
        for (const mv of out.moves) {
            validDestinations.add(mv.substring(2, 4));
        }

        for (const mv of Array.from(validDestinations)) {
            annotations.push(Circle({ id: `circle-${mv}` }, {
                center: toBoardCoords(mv),
                radius: CW * 0.175,
                color: 'black',
                alpha: 0.1,
            }));
        }
    }

    if (drawAnnotations) {
        //out?.moveAttributesMap && console.table(Array.from(out.moveAttributesMap.values()));
        //out?.viewedPositions && console.log(Array.from(out.viewedPositions[0]));
        for (const pos of Array.from(out?.attackedPositions || [])) {
            const isDefended = out?.defendedPositions.has(pos);
            annotations.push(
                Ring({ id: `ring-${pos}` }, {
                    center: toBoardCoords(pos),

                    title: isDefended ? 'attacked and defended' : 'attacked',

                    radius: CW * 0.44,
                    strokeWidth: CW * 0.06,
                    
                    color: isDefended ? 'orange' : 'red',
                    alpha: ANNO_ALPHA,
                }),
            );
        }
        if (out?.moves) {
            for (const [mv, attrs] of out.moveAttributesMap.entries()) {
                const mvO = moveToObject(mv, board);

                let color, title, width = 0.9;
                if      (attrs.isCheckmate) {                       title = 'checkmate';       color = '#7F7';    width = 2.5; }
                else if (attrs.isStalemate) {                       title = 'stalemate';       color = '#F77';    width = 2.5; }
                else if (attrs.isCheck) {                           title = 'check';           color = 'purple';               }
                else if (attrs.isCapture && !attrs.canBeCaptured) { title = 'safe capture';    color = 'green';   width = 1.5; }
                else if (attrs.isCapture) {                         title = 'capture';         color = 'yellow';               }
                else if (attrs.canBeCaptured) {                     title = 'can be captured'; color = 'orchid';               }
                else if (attrs.isPromotion) {                       title = 'promotion';       color = 'cyan';                 }
                else {                                              title = 'regular';         color = randomColor();          }
                // TODO CASTLE

                title = `${attrs.pgn} (${title})`;

                annotations.push(
                    Arrow({ id: `arrow-${mvO.from}-${mvO.to}-${title}` }, {
                        from: toBoardCoords(mvO.from),
                        to:   toBoardCoords(mvO.to),
                        fill:   { color, alpha: ANNO_ALPHA },
                        stroke: { color, width: ANNO_STROKE_WIDTH },
                        arrowW: 1.8,
                        arrowH: 6,
                        width,
                        title,
                    }),
                );
                if (mvO.from2) {
                    annotations.push(
                        Arrow({ id: `arrow-${mvO.from2}-${mvO.to2}-${title}` }, {
                            from: toBoardCoords(mvO.from2),
                            to:   toBoardCoords(mvO.to2),
                            fill:   { color, alpha: ANNO_ALPHA },
                            stroke: { color, width: ANNO_STROKE_WIDTH },
                            arrowW: 1.8,
                            arrowH: 6,
                            width,
                            title,
                        })
                    );
                }
            }
        }
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
                const posName = `${xToFile(xi)}${yToRank(yi)}`;
                return m('rect', {
                    key: posName,
                    class: 'cell',
                    x: xi * CW,
                    y: yi * CW,
                    width:  CW,
                    height: CW,
                    fill: isEven ? LIGHT : DARK,
                }, [
                    m('title', posName),
                ]);
            }),
        ]),

        /* m('g', { 'x-comment' : 'dashes' }, [
            out?.viewedPositions ? [
                ...Array.from(out?.viewedPositions[0]).map((mv) => Dashed({}, { pos: posToXY(mv), alpha: 0.5, color: '#D44' })),
                ...Array.from(out?.viewedPositions[1]).map((mv) => Dashed({}, { pos: posToXY(mv), alpha: 0.5, color: '#4D4', inverted: true })),
            ] : undefined,
        ]), */

        m('g', { 'x-comment' : 'labels' }, [
            ...times(8).map((i) => {
                const label = yToRank(i);
                return m(
                    'text',
                    {
                        key: label,
                        x: -MARGIN * 0.75 * CW,
                        y: (i - 0.5) * CW,
                        dy: CW,
                        fill: WHITE,
                        'dominant-baseline': 'middle',
                    },
                    label,
                );
            }),
            ...times(8).map((i) => {
                const label = xToFile(i);
                return m(
                    'text',
                    {
                        key: label,
                        x: (i + 0.5) * CW,
                        y: (7 + MARGIN * 0.75) * CW,
                        dy: CW,
                        fill: WHITE,
                        'text-anchor': 'middle',
                    },
                    label,
                );
            }),
        ]),

        m('g', { 'x-comment' : 'pieces' }, pieces),

        m('g', { 'x-comment' : 'annotations' }, annotations),
        //console.log(annotations)
    ]);
};
