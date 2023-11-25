import { pc } from './vendor/colorette.mjs';

import { isWhitePiece,isBlackPiece, isPiece } from "./pieces.mjs";
import { LIGHT, DARK, ALWAYS_FILLED } from "./unicode_pieces.mjs";

export const POSITIONS_TO_INDICES = new Map();
export const INDICES_TO_POSITIONS = new Map();

export const WHITE = 'white';
export const BLACK = 'black';

export const EMPTY = ` `;
const NL = '\n';

const COLORED = true;
const BG_IS_LIGHT = false;

const CHARS_WIDTH = 1;
//const CHARS_WIDTH = 2;
//const CHARS_WIDTH = 3;

let darkBgCell = (v) => v;
let lightBgCell = (v) => v;

if (COLORED) {
    darkBgCell = (v) => pc.bgBlackBright(v);
    lightBgCell = (v) => pc.bgBlueBright(v);
}

let getUnicodePiece = (p) => {
    const pieces = BG_IS_LIGHT ? LIGHT : DARK;
    p = pieces[p] || p;
    return p;
}

if (COLORED) {
    getUnicodePiece = (p) => {
        const pieces = ALWAYS_FILLED;
        const isWhite = isWhitePiece(p);
        if (pieces[p]) {
            p = pieces[p];
        }
        p = isWhite ? pc.whiteBright(p) : pc.black(p);
        return p;
    }
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
        halfMoveClock: 0, // ?
        fullMoveNumber: 1, // ?
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
                line.push(p);
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
            line.push(RANKS[fromBlacks ? 7 - yi : yi]);
            for (let xi = 0; xi < 8; ++xi) {
                const idx = fromBlacks ? (7-xi) + 8 * (7 - yi) : xi + 8 * yi;
                let p = this._cells[idx];
                p = getUnicodePiece(p);
                if (COLORED) {
                    const isDarkCell = ((xi + yi) % 2 === 1);
                    p = isDarkCell ? darkBgCell(p) : lightBgCell(p);
                    const fn = this._cellTransformations[idx];
                    if (fn) p = fn(cell);
                }
                line.push(p);
            }
            lines.push(line.join(''))
        }

        lines.push(' ' + (fromBlacks ? FILES.toReversed() : FILES).join(''));
        
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
