import { pc } from './vendor/colorette.mjs';

import { isWhitePiece,isBlackPiece, isPiece } from "./pieces.mjs";
import { LIGHT, DARK, ALWAYS_FILLED } from "./unicode_pieces.mjs";

const BG_IS_LIGHT = false;

//const CHARS_WIDTH = 1;
const CHARS_WIDTH = 2;
//const CHARS_WIDTH = 3;

//const UNICODE_PIECES = {};
const UNICODE_PIECES = pc.hasColors ? ALWAYS_FILLED : BG_IS_LIGHT ? LIGHT : DARK;

export const POSITIONS_TO_INDICES = new Map();
export const INDICES_TO_POSITIONS = new Map();

export const WHITE = 'white';
export const BLACK = 'black';

export const EMPTY = ` `;
const NL = '\n';

const darkBgCell = (v) => pc.bgBlackBright(v);
const lightBgCell = (v) => pc.bgBlueBright(v);

const sizeCell = (p) => {
    return CHARS_WIDTH === 1 ? p :
           CHARS_WIDTH === 2 ? ` ${p}`: ` ${p} `;
}

const getUnicodePiece = (p, fn, isWhiteCell) => {
    const isWhite = isWhitePiece(p);
    if (UNICODE_PIECES[p]) {
        p = UNICODE_PIECES[p];
    }
    p = sizeCell(p);
    p = isWhite ? pc.whiteBright(p) : pc.black(p);

    if (fn) {
        p = fn(p, isWhiteCell);
    } else {
        p = isWhiteCell ? lightBgCell(p) : darkBgCell(p);
    }
    
    return p;
}

export function otherSide(side) {
    return side === WHITE ? BLACK : WHITE;
}

export function isPieceOfSide(piece, side) {
    return side === WHITE ? isWhitePiece(piece) : isBlackPiece(piece);
}

export class Board {
    _cells = new Array(64).fill(EMPTY);

    _params = {
        next: WHITE, // next to move
        castling: 'QKqk', // whether white can castle queen and king-side (caps), same for black (lowers). otherwise -
        enPassantPos: '-', // if the last move was a pawn move 2 cells forward, the intermediate position should be set here, otherwise - is returned
        halfMoveClock: 0, // whether white has played last (0, 1, 0, 1...)
        fullMoveNumber: 1, // full move number (a move is comprised of 1 white move + 1 black move, therefore 1, 1, 2, 2...)
    }

    _moves = [];

    _cellTransformations = new Array(64);

    static empty() {
        const b = new Board();
        b._cells.fill(EMPTY);
        return b;
    }

    static default() {
        const b = new Board();
        b.setFen(`rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`);
        return b;
    }

    static fromFen(fen) {
        const b = new Board();
        b.setFen(fen);
        return b;
    }

    fill(v) {
        this.iterateCells((pos) => this.set(pos, v));
    }

    getFen() {
        const ranks = [];
        for (let y = 0; y < 8; ++y) {
            const rank = [];
            let empties = 0;
            for (let x = 0; x < 8; ++x) {
                const p = this._cells[ x + y * 8 ];
                if (isPiece(p)) {
                    if (empties) rank.push(empties);
                    rank.push(p);
                    empties = 0;
                } else {
                    ++empties;
                }
            }
            if (empties) rank.push(empties);
            ranks.push(rank.join(''));
        }
        const p = this._params;
        return `${ranks.join('/')} ${p.next === WHITE ? 'w' : 'b'} ${p.castling} ${p.enPassantPos} ${p.halfMoveClock} ${p.fullMoveNumber}`;
    }

    setFen(fen) {
        const [board, next, castling, enPassantPos, halfMoveClock, fullMoveNumber] = fen.split(' ');
        const ranks = board.split('/');
        for (let [y, rank] of ranks.entries()) {
            let x = 0;
            for (const char of rank.split('')) {
                const num = parseInt(char, 10);
                if (isNaN(num)) {
                    this._cells[ x + y * 8 ] = char;
                    ++x;
                } else {
                    for (let j = 0; j < num; ++j) {
                        this._cells[ x + y * 8 ] = EMPTY;
                        ++x;
                    }
                }
            }
        }
        this._params = {
            next: next === 'w' ? WHITE : BLACK,
            castling,
            enPassantPos,
            halfMoveClock: parseInt(halfMoveClock, 10),
            fullMoveNumber: parseInt(fullMoveNumber, 10),
        };
    }

    getPgn() {
        // 2... Nf4 3. Nxe6 d5 4. Bxf4 
        return Array.from(this._moves.entries())
        .map(([num, move]) => {
            if (num % 2 === 0) {
                return `${num/2 + 1}. ${move}`;
            };
            return move;
        }).join(' ');
    }

    get(pos) {
        return this._cells[ POSITIONS_TO_INDICES.get(pos) ];
    }

    set(pos, v) {
        this._cells[ POSITIONS_TO_INDICES.get(pos) ] = v;
    }

    setTransformation(pos, fn) {
        const idx = POSITIONS_TO_INDICES.get(pos);
        this._cellTransformations[idx] = fn;
    }

    clearTransformation(pos) {
        const idx = POSITIONS_TO_INDICES.get(pos);
        this._cellTransformations[idx] = undefined;
    }

    clone() {
        const b = new Board();
        b._cells = Array.from(this._cells);
        b._params = structuredClone(this._params);
        b._moves = Array.from(this._moves);
        return b;
    }

    iterateCells(onCell) {
        for (let i = 0; i < 64; ++i) {
            onCell(INDICES_TO_POSITIONS.get(i), this._cells[i]);
        }
    }

    iteratePiecesOfSide(side, onCell) {
        this.iterateCells((pos, piece) => {
            if (isPieceOfSide(piece, side)) onCell(pos, piece);
        });
    }

    toString(fromBlacks) {
        const lines = [];
        for (let yi = 0; yi < 8; ++yi) {
            const line = [];
            for (let xi = 0; xi < 8; ++xi) {
                const idx = fromBlacks ? (7-xi) + 8 * (7 - yi) : xi + 8 * yi;
                const p = this._cells[idx];
                line.push(sizeCell(p));
            }
            lines.push(line.join(''));
        }
        return lines.join(NL);
    }

    // TODO colors
    toPrettyString({ fromBlacks, details } = { fromBlacks: false, details: false }) {
        const lines = [];
        for (let yi = 0; yi < 8; ++yi) {
            const line = [];
            line.push(sizeCell(RANKS[fromBlacks ? 7 - yi : yi]));
            for (let xi = 0; xi < 8; ++xi) {
                const idx = fromBlacks ? (7-xi) + 8 * (7 - yi) : xi + 8 * yi;
                let p = this._cells[idx];
                const fn = this._cellTransformations[idx];
                const isWhiteCell = ((xi + yi) % 2 === 0);
                p = getUnicodePiece(p, fn, isWhiteCell);
                line.push(p);
            }
            lines.push(line.join(''))
        }

        lines.push(sizeCell(' ') + (fromBlacks ? FILES.toReversed() : FILES).map(sizeCell).join(''));
        
        if (details) {
            lines.push(`next: ${this._params.next}`);
            lines.push(`en passant: ${this._params.enPassantPos }`);
            lines.push(`castling: ${this._params.castling }`);
            lines.push(`clock: ${this._params.halfMoveClock }  move nr: ${this._params.fullMoveNumber}`);
            lines.push();
        }

        return lines.join(NL);
    }

    applyMove(move) {
        // TODO returns a new board
        const b = this.clone();
        b._moves.push(move);
        // increment move stats
        const isEvenMove = b._moves.length % 2 === 0;
        b._params.halfMoveClock = isEvenMove ? 0 : 1;
        if (isEvenMove) ++b._params.fullMoveNumber;
        return b;
    }
}

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

for (let [yi, y] of RANKS.entries()) {
    for (let [xi, x] of FILES.entries()) {
        const position = `${x}${y}`;

        const index = xi + yi * 8;

        POSITIONS_TO_INDICES.set(position, index);
        INDICES_TO_POSITIONS.set(index, position);
    }
}
