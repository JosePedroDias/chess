import { LIGHT, DARK } from "./unicode_pieces.mjs";

export const POSITIONS_TO_INDICES = new Map();
export const INDICES_TO_POSITIONS = new Map();

export const WHITE = 'white';
export const BLACK = 'black';

export const KING_W = 'K';
export const KING_B = 'k';
export const QUEEN_W = 'Q';
export const QUEEN_B = 'q';
export const ROOK_W = 'R';
export const ROOK_B = 'r';
export const BISHOP_W = 'B';
export const BISHOP_B = 'b';
export const KNIGHT_W = 'N';
export const KNIGHT_B = 'n';
export const PAWN_W = 'P';
export const PAWN_B = 'p';

export const WHITE_PIECES = [KING_W, QUEEN_W, ROOK_W, BISHOP_W, KNIGHT_W, PAWN_W];
export const BLACK_PIECES = [KING_B, QUEEN_B, ROOK_B, BISHOP_B, KNIGHT_B, PAWN_B];

export const KINGS = [KING_W, KING_B];
export const QUEENS = [QUEEN_W, QUEEN_B];
export const ROOKS = [ROOK_W, ROOK_B];
export const BISHOPS = [BISHOP_W, BISHOP_B];
export const KNIGHTS = [KNIGHT_W, KNIGHT_B];
export const PAWNS = [PAWN_W, PAWN_B];

export const PIECES = [...WHITE_PIECES, ...BLACK_PIECES];

const EMPTY = ` `;
const NL = '\n';

export function isPiece(piece) {
    return PIECES.includes(piece);
}

export function isWhitePiece(piece) {
    return WHITE_PIECES.includes(piece);
}

export function isBlackPiece(piece) {
    return BLACK_PIECES.includes(piece);
}

export function isPieceOfSide(piece, side) {
    return side === WHITE ? isWhitePiece(piece) : isBlackPiece(piece);
}

export function otherSide(side) {
    return side === WHITE ? BLACK : WHITE;
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

    toString(fromBlacks) {
        const lines = [];
        for (let yi = 0; yi < 8; ++yi) {
            const line = [];
            for (let xi = 0; xi < 8; ++xi) {
                const i = fromBlacks ? (7-xi) + 8 * (7 - yi) : xi + 8 * yi;
                line.push( this._cells[i] );
            }
            lines.push(line.join(EMPTY))
        }
        return lines.join(NL);
    }

    // TODO colors
    toPrettyString({ fromBlacks, isLight, details } = { fromBlacks: false, isLight: false, details: false }) {
        const pieces = isLight ? LIGHT : DARK;
        const lines = [];
        for (let yi = 0; yi < 8; ++yi) {
            const line = [];
            line.push(RANKS[fromBlacks ? 7 - yi : yi]);
            for (let xi = 0; xi < 8; ++xi) {
                const i = fromBlacks ? (7-xi) + 8 * (7 - yi) : xi + 8 * yi;
                const p = this._cells[i];
                line.push(pieces[p] || p);
            }
            lines.push(line.join(EMPTY))
        }
        lines.push(EMPTY + EMPTY + (fromBlacks ? FILES.toReversed() : FILES).join(EMPTY));

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
