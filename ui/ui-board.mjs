import m from '../vendor/mithril.mjs';

import { times, randomColor } from '../utils.mjs';
import { EMPTY, POSITIONS_TO_XY } from '../board.mjs';
import { isBishop, isKing, isKnight, isQueen, isRook, isWhitePiece } from '../pieces.mjs';
import { moveFromString, validMoves, getThreatenedPositions } from '../moves.mjs';

import { WHITE, GRAY, DARK, LIGHT } from './colors.mjs';
import { MARGIN, CW } from './constants.mjs';
import { Pawn } from './pawn.mjs';
import { Knight } from './knight.mjs';
import { Bishop } from './bishop.mjs';
import { Rook } from './rook.mjs';
import { Queen } from './queen.mjs';
import { King } from './king.mjs';
import { Dot } from './dot.mjs';
import { Arrow } from './arrow.mjs';

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

    const moveToArr = (move) => move instanceof Array ? move : [move];

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
    const possibleMoves = validMoves(board, true);
    const riskedPositions = getThreatenedPositions(board);
    //console.log('lastMove', lastMove);
    //console.log('possibleMoves', possibleMoves);
    //console.log('riskedPositions', riskedPositions);

    for (const pos of riskedPositions) {
        annotations.push(
            Dot({}, {
                pos: posToXY(pos),
                color: 'red',
                alpha: 0.5,
            }),
        );
    }

    for (const mv of possibleMoves) {
        const moveArr = moveToArr(mv);
        for (const { from, to } of moveArr) {
            annotations.push(
                Arrow({}, {
                    from: posToXY(from.pos),
                    to: posToXY(to.pos),
                    //color: 'yellow',
                    color: randomColor(),
                    alpha: 0.5,
                }),
            );
        }
    }

    if (lastMove) {
        try {
            const moveArr = moveToArr( moveFromString(lastMove, board.getLastBoard()) );
            for (const { from, to } of moveArr) {
                annotations.push(
                    Arrow({}, {
                        from: posToXY(from.pos),
                        to: posToXY(to.pos),
                        //color: 'orange',
                        color: '#333',
                        alpha: 0.5,
                    }),
                );
            }
        } catch (err) {
            console.error(err);
        }
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
            return m(
                'text',
                {
                    x: -MARGIN * 0.75 * CW,
                    y: (i - 0.5) * CW,
                    dy: CW,
                    fill: WHITE,
                    'dominant-baseline': 'middle',
                },
                `${ fromBlacks ? i + 1 : 8 - i}`
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
                `${String.fromCharCode( fromBlacks ? 104 - i : 97 + i )}`
            );
        }),
        
        ...pieces,
        ...annotations,
    ]);
};
