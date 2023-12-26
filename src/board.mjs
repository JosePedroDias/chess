import { isPiece, isPawn, isRook, isKing, isWhitePiece, isBlackPiece, KING_W, KING_B, QUEEN_W, QUEEN_B } from './pieces.mjs';
import { randomString } from './utils.mjs';
import { moveFromPgn } from './move.mjs';

export const POSITIONS_TO_INDICES = new Map();
export const INDICES_TO_POSITIONS = new Map();
export const POSITIONS_TO_XY = new Map();

const WHITE_CELL_POSITIONS = new Set();
const BLACK_CELL_POSITIONS = new Set();

export const WHITE = 'white';
export const BLACK = 'black';

export const EMPTY = ` `;
export const NOTHING = `-`;
const NL = '\n';

export const QUEEN_SIDE_CASTLING_MOVES = ['e1c1', 'e8c8'];
export const KING_SIDE_CASTLING_MOVES  = ['e1g1', 'e8g8'];
export const CASTLING_MOVES = [...QUEEN_SIDE_CASTLING_MOVES, ...KING_SIDE_CASTLING_MOVES];

export function otherSide(side) {
    return side === WHITE ? BLACK : WHITE;
}

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export class Board {
    _cells = new Array(64).fill(EMPTY);
    _cellIds = new Array(64).fill(undefined);

    _tags = {};

    _params = {
        next: WHITE, // next to move
        castling: new Set([KING_W, QUEEN_W, KING_B, QUEEN_B]),
        enPassant: undefined, // if the last move was a pawn move 2 cells forward, the intermediate position should be set here, otherwise - is returned
        halfMoveClock: 0, // how many half-moves ago pawn or captures took place (to enforce the 50 move rule)
        fullMoveNumber: 1, // full move number (a move is comprised of 1 white move + 1 black move, therefore 1, 1, 2, 2...)
    }

    _moves = [];
    _movesPgn = [];
    _pastBoards = [];

    static empty() {
        const b = new Board();
        b._cells.fill(EMPTY);
        b._params.castling.clear();
        return b;
    }

    static default() {
        const b = new Board();
        b.setFen(DEFAULT_FEN);
        return b;
    }

    static fromFen(fen) {
        const b = new Board();
        b.setFen(fen);
        return b;
    }

    static fromPgn(pgn) {
        let b = Board.default();

        // remove comments
        pgn = pgn.replaceAll(/(\{[^\}]*\})/gm, '');

        const lines = pgn.split('\n');

        // parse tags
        const tags = {};
        const parts = [];
        lines.forEach((line) => {
            line = line.trim();
            if (line.startsWith('[')) {
                const rgx = /\[(\S+) "([^"]+)"\]/;
                const m = rgx.exec(line);
                if (m && m.length > 2) {
                    tags[m[1]] = m[2];
                }
            } else {
                for (const item of line.split(' ')) parts.push(item);
            }
        });

        let i = -1;
        for (const movePgn of parts) {
            ++i;
            if (i % 3 === 0) continue;
            const move = moveFromPgn(movePgn, b);
            b = b.applyMove(move, movePgn);
        }

        b._tags = tags;

        return b;
    }

    fill(v) {
        for (const [pos] of this) {
            this.set(pos, v);
        }
    }

    isWhiteNext() {
        return this._params.next === WHITE;
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
        const board = ranks.join('/');

        const p = this._params;
        const next = p.next === WHITE ? 'w' : 'b';
        const castling = Array.from(p.castling).join('') || NOTHING;
        return `${board} ${next} ${castling} ${p.enPassant || NOTHING} ${p.halfMoveClock} ${p.fullMoveNumber}`;
    }

    setFen(fen) {
        if (fen !== DEFAULT_FEN) this._initialFen = fen;
        let [board, next, castling, enPassant, halfMoveClock, fullMoveNumber] = fen.split(' ');
        const ranks = board.split('/');
        for (const [y, rank] of ranks.entries()) {
            let x = 0;
            for (const char of rank.split('')) {
                const num = parseInt(char, 10);
                if (isNaN(num)) {
                    this._cells[ x + y * 8 ] = char;
                    this._cellIds[ x + y * 8 ] = randomString(8);
                    ++x;
                } else {
                    for (let j = 0; j < num; ++j) {
                        this._cells[ x + y * 8 ] = EMPTY;
                        this._cellIds[ x + y * 8 ] = undefined;
                        ++x;
                    }
                }
            }
            if (x !== 8) throw new Error(`fen board rank ${y} does not sum up to 8 cells!`);
        }

        if (castling === NOTHING) {
            castling = new Set();
        } else {
            castling = new Set(castling.split(''));
        }

        if (enPassant !== NOTHING && !POSITIONS.has(enPassant)) {
            throw new Error(`incorrect enPassant string: "${enPassant}`);
        }
        if (enPassant === NOTHING) enPassant = undefined;

        next = next === 'w' ? WHITE : BLACK;
        this._params.next = next; // to prevent mistakes later in this fn

        halfMoveClock = parseInt(halfMoveClock, 10);
        if (isNaN(halfMoveClock || halfMoveClock < 0)) throw new Error('Incorrect halfMoveClock!');
        fullMoveNumber = parseInt(fullMoveNumber, 10);
        if (isNaN(fullMoveNumber) || fullMoveNumber < 1) throw new Error('Incorrect fullMoveNumber!');

        if (!this.isWhiteNext()) {
            this._moves.push(undefined); // to even out move % 2 even if undefined is pushed
        }

        this._params = {
            next,
            castling,
            enPassant,
            halfMoveClock,
            fullMoveNumber,
        };
    }

    getPgn(extraTags = {}) { // { White: 'zp', Black: 'bot' }
        const tags = { ...this._tags, ...extraTags };
        if (!('Site' in tags)) tags.Site = 'https://josepedrodias.github.io/chess/';
        if (!('Date' in tags)) tags.Date = (new Date()).toISOString().substring(0, 10).replace(/-/g, '.');

        const movesPGN = Array.from(this._movesPgn.entries())
        .map(([num, movePgn]) => {
            if (num % 2 === 0) {
                return `${num/2 + 1}. ${movePgn}`;
            };
            return movePgn;
        }).join(' ');

        if (this._initialFen) {
            tags.FEN = this._initialFen;
        }

        const tagsPGN = (Object.entries(tags)).reduce((prev, [key, value]) => {
            return `${prev}\n[${key} "${value}"]`;
        }, '').trim();

        return `${tagsPGN}\n${movesPGN}`;
    }

    get(pos) {
        return this._cells[ POSITIONS_TO_INDICES.get(pos) ];
    }

    getId(pos) {
        return this._cellIds[ POSITIONS_TO_INDICES.get(pos) ];
    }

    set(pos, v) {
        this._cells[ POSITIONS_TO_INDICES.get(pos) ] = v;
    }

    setId(pos, id) {
        this._cellIds[ POSITIONS_TO_INDICES.get(pos) ] = id;
    }

    clone() {
        const b = new Board();

        if (this._initialFen) {
            b._initialFen = this._initialFen;
        }
        
        b._cells      = Array.from(this._cells);
        b._cellIds    = Array.from(this._cellIds);

        //b._tags       = structuredClone(this._tags);
        b._tags       = {...this._tags};

        b._moves      = Array.from(this._moves);
        b._movesPgn   = Array.from(this._movesPgn);
        b._pastBoards = Array.from(this._pastBoards);

        const p = this._params;
        b._params = {
            next:           p.next,
            castling:       new Set(p.castling),
            enPassant:      p.enPassant,
            halfMoveClock:  p.halfMoveClock,
            fullMoveNumber: p.fullMoveNumber,
        };

        return b;
    }

    *[Symbol.iterator]() {
        for (let i = 0; i < 64; ++i) {
            yield [
                INDICES_TO_POSITIONS.get(i),
                this._cells[i],
            ];
        }
    }

    // returns interator of [position, piece]
    cellsHaving(criteria = () => true) {
        return {
            [Symbol.iterator]: () => {
                let i = 0;
                return {
                    next: () => {
                        let pos, v, ok;
                        do {
                            pos = INDICES_TO_POSITIONS.get(i);
                            v = this._cells[i];
                            ok = criteria(v, pos);
                            ++i;
                            if (ok) {
                                return { done: false, value: [pos, v] };
                            }
                        } while (i < 64);
                        return { done: true };
                    }
                }
            }
        }
    }

    positionsHaving(criteria = () => true) {
        return Array.from(this.cellsHaving(criteria)).map(([pos]) => pos);
    }

    // returns array of pieces
    piecesHaving(criteria = () => true) {
        return Array.from(this.cellsHaving(criteria)).map(([_, piece]) => piece);
    }

    // array of [position, piece]
    getSidePositions(isWhite) {
        if (isWhite === undefined) isWhite = this.isWhiteNext();
        const isMyPiece = isWhite ? isWhitePiece : isBlackPiece;
        return Array.from(this.cellsHaving(isMyPiece));
    }

    findPos(criteria) {
        for (let i = 0; i < 64; ++i) {
            const pos = INDICES_TO_POSITIONS.get(i);
            const v = this._cells[i];
            if (criteria(v)) return pos;
        }
    }

    toString(fromBlacks, positions, dotEmpties) {
        let op = positions && fromBlacks ? (arr) => arr.toReversed() : arr => arr;
        const lines = [];
        for (let yi = 0; yi < 8; ++yi) {
            const line = [];
            for (let xi = 0; xi < 8; ++xi) {
                const idx = fromBlacks ? (7-xi) + 8 * (7 - yi) : xi + 8 * yi;
                const p = this._cells[idx];
                const content = dotEmpties ? ` ${p === EMPTY ? '.' : p}` : ` ${p}`;
                line.push(content);
            }
            if (positions) line.unshift(RANKS[fromBlacks ? 7 - yi : yi]);
            lines.push(line.join(''));
        }
        if (positions) lines.push('  ' + op(FILES).join(' '));
        return lines.join(NL);
    }

    hasCastlingFlag(flag) {
        return this._params.castling.has(flag);
    }

    unsetCastlingFlags(flagsToFilter) {
        for (const flag of flagsToFilter) this._params.castling.delete(flag);
    }

    applyMove(mv, movePgn) {
        const isWhite = this.isWhiteNext();

        const from = mv.substring(0, 2);
        const to = mv.substring(2, 4);
        const piece = this.get(from);
        let promPiece = mv[4];
        if (promPiece && isWhite) promPiece = promPiece.toUpperCase();
        
        const b = this.clone();

        const isEnPassantCapture = isPawn(piece) && this._params.enPassant === to;
        const isCapture = this.get(to) !== EMPTY || isEnPassantCapture;
        let isHMCReset = isCapture;

        const id = b.getId(from);
        b.set(from, EMPTY);
        b.setId(from, undefined);
        b.set(to, promPiece || piece);
        b.setId(to, id);
        b._moves.push(mv);
        b._movesPgn.push(movePgn || mv); // TODO MEH

        if (isEnPassantCapture) {
            const posToClear = `${to[0]}${parseInt(to[1], 10) + (isWhite ? -1 : 1)}`;
            b.set(posToClear, EMPTY);
            b.setId(posToClear, undefined);
        }

        // update en passant flag
        if (!isPawn(piece)) b._params.enPassant = undefined;

        if (isPawn(piece)) {
            isHMCReset = true;
            const y0 = parseInt(from[1], 10);
            const y1 = parseInt(to[1], 10);
            const isJump2 = Math.abs(y1 - y0) === 2;
            b._params.enPassant = isJump2 ? from[0] + ((y0 + y1)/2) : undefined;
        } else if (isKing(piece)) {
            if (CASTLING_MOVES.includes(mv)) {
                let from2, to2;
                if (QUEEN_SIDE_CASTLING_MOVES.includes(mv) && b.hasCastlingFlag(isWhite ? QUEEN_W : QUEEN_B)) {
                    from2 = isWhite ? 'a1' : 'a8';
                    to2   = isWhite ? 'd1' : 'd8';
                } else if (KING_SIDE_CASTLING_MOVES.includes(mv) && b.hasCastlingFlag(isWhite ? KING_W : KING_B)) {
                    from2 = isWhite ? 'h1' : 'h8';
                    to2   = isWhite ? 'f1' : 'f8';
                } else {
                    //throw new Error(`Unexpected (move ${mv})`);
                }
                if (from2) {
                    const id2 = b.getId(from2);
                    b.set(to2, b.get(from2));
                    b.setId(to2, id2);
                    b.set(from2, EMPTY);
                    b.setId(from2, undefined);
                }
            }
            b.unsetCastlingFlags(isWhite ? [QUEEN_W, KING_W] : [QUEEN_B, KING_B]); // unset castling flag
        } else if (isRook(piece)) {
            const relevantPositions = isWhite ? ['a1', 'h1'] : ['a8', 'h8'];
            const toFilter = isWhite ? [QUEEN_W, KING_W] : [QUEEN_B, KING_B];
            const indexOfPiece = relevantPositions.indexOf(from);
            if (indexOfPiece !== -1) { // unset castling flag
                const toFilter2 = toFilter[indexOfPiece];
                b.unsetCastlingFlags([toFilter2]);
            }
        }
        b.set(from.pos, EMPTY);
        b.set(to.pos, from.newPiece || from.piece);

        b._params.next = otherSide(b._params.next);
        const isEvenMove = b._moves.length % 2 === 0;
        if (isEvenMove) ++b._params.fullMoveNumber;

        b._params.halfMoveClock = isHMCReset ? 0 : this._params.halfMoveClock + 1;

        b._pastBoards.push(this);

        return b;
    }

    getLastMove() {
        return this._moves[ this._moves.length - 1 ];
    }

    getLastBoard() {
        return this._pastBoards[ this._pastBoards.length - 1 ];
    }

    getUniqueString() {
        return `${this._cells.join('')}${this._params.castling}`;
    }

    getInvertedBoard() {
        const board = this.clone();
        board._params.next = otherSide(this._params.next);
        board._moves.push(null);
        return board;
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
        POSITIONS_TO_XY.set(position, [xi, yi]);

        const _isWhiteCell = (xi + yi) % 2 === 0;
        const setToFill = _isWhiteCell ? WHITE_CELL_POSITIONS : BLACK_CELL_POSITIONS;
        setToFill.add(position);
    }
}

export const POSITIONS = new Set(POSITIONS_TO_INDICES.keys());

export function isValidPosition(pos) {
    return POSITIONS.has(pos);
}

export function isWhiteCell(pos) {
    return WHITE_CELL_POSITIONS.has(pos);
}

export function isBlackCell(pos) {
    return BLACK_CELL_POSITIONS.has(pos);
}
