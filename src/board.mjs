import { isPiece, isPawn, isRook, isKing, KING_W, KING_B, QUEEN_W, QUEEN_B } from "./pieces.mjs";
import { moveFromString, moveToString } from './moves.mjs';

const CHARS_WIDTH = 2;

export const POSITIONS_TO_INDICES = new Map();
export const INDICES_TO_POSITIONS = new Map();
export const POSITIONS_TO_XY = new Map();

export const WHITE = 'white';
export const BLACK = 'black';

export const EMPTY = ` `;
export const NOTHING = `-`;
const NL = '\n';

const sizeCell = (p) => {
    return CHARS_WIDTH === 1 ? p :
           CHARS_WIDTH === 2 ? ` ${p}`: ` ${p} `;
}

export function otherSide(side) {
    return side === WHITE ? BLACK : WHITE;
}

export class Board {
    _cells = new Array(64).fill(EMPTY);

    _params = {
        next: WHITE, // next to move
        castling: 'QKqk', // whether white can castle queen and king-side (caps), same for black (lowers). otherwise -
        enPassantPos: NOTHING, // if the last move was a pawn move 2 cells forward, the intermediate position should be set here, otherwise - is returned
        halfMoveClock: 0, // whether white has played last (0, 1, 0, 1...)
        fullMoveNumber: 1, // full move number (a move is comprised of 1 white move + 1 black move, therefore 1, 1, 2, 2...)
    }

    _moves = [];
    _pastBoards = [];

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
        const p = this._params;
        return `${ranks.join('/')} ${p.next === WHITE ? 'w' : 'b'} ${p.castling || NOTHING} ${p.enPassantPos} ${p.halfMoveClock} ${p.fullMoveNumber}`;
    }

    setFen(fen) {
        let [board, next, castling, enPassantPos, halfMoveClock, fullMoveNumber] = fen.split(' ');
        const ranks = board.split('/');
        for (const [y, rank] of ranks.entries()) {
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
            if (x !== 8) throw new Error(`fen board rank ${y} does not sum up to 8 cells!`);
        }

        if (castling !== '-' && !castling.split('').every((ch) => ['k', 'K', 'q', 'Q'].includes(ch))) {
            throw new Error(`incorrect castling string: "${castling}`);
        }

        if (enPassantPos !== '-' && !POSITIONS.has(enPassantPos)) {
            throw new Error(`incorrect enPassantPos string: "${enPassantPos}`);
        }

        next = next === 'w' ? WHITE : BLACK;
        this._params.next = next; // to prevent mistakes later in this fn

        halfMoveClock = parseInt(halfMoveClock, 10);
        if (isNaN(halfMoveClock)) throw new Error('Incorrect halfMoveClock!');
        if (next === WHITE && halfMoveClock !== 0) throw new Error('Incorrect halfMoveClock!');
        if (next === BLACK && halfMoveClock !== 1) throw new Error('Incorrect halfMoveClock!');
        fullMoveNumber = parseInt(fullMoveNumber, 10);
        if (isNaN(fullMoveNumber)) throw new Error('Incorrect fullMoveNumber!');

        if (!this.isWhiteNext()) {
            this._moves.push(undefined); // to even out move % 2 even if undefined is pushed
        }

        this._params = {
            next,
            castling,
            enPassantPos,
            halfMoveClock,
            fullMoveNumber,
        };
    }

    getPgn() {
        // 2... Nf4 3. Nxe6 d5 4. Bxf4 
        return Array.from(this._moves.entries())
        .map(([num, move]) => {
            if (move === undefined) move = '?';
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
        b._pastBoards = Array.from(this._pastBoards);
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

    applyMove(move) {
        const isSideWhite = this.isWhiteNext();
        
        let moveO, moveS;
        if (typeof move === 'string') {
            moveO = moveFromString(move, this);
            moveS = move;
        } else {
            moveO = move;
            moveS = moveToString(move);
        }

        const b = this.clone();

        b._moves.push(moveS);

        const movesSteps = moveO instanceof Array ? moveO : [moveO];
        for (const moveStep of movesSteps) {
            const { from, to } = moveStep;
            const piece = from.piece;
            if (isPawn(piece)) { // set en passant flag
                const y0 = parseInt(from.pos[1], 10);
                const y1 = parseInt(to.pos[1], 10);
                if (Math.abs(y1 - y0) === 2) {
                    b._params.enPassantPos = from.pos[0] + ((y0 + y1)/2);
                } else {
                    b._params.enPassantPos = NOTHING;
                }
            } else if (isKing(piece)) { // set castling flag
                const toFilter = isSideWhite ? [QUEEN_W, KING_W] : [QUEEN_B, KING_B];
                b._params.castling = b._params.castling.split('').filter((p) => !toFilter.includes(p)).join('');
            } else if (isRook(piece)) {
                const relevantPositions = isSideWhite ? ['a1', 'h1'] : ['a8', 'h8'];
                const toFilter = isSideWhite ? [QUEEN_W, KING_W] : [QUEEN_B, KING_B];
                const indexOfPiece = relevantPositions.indexOf(from.pos);
                if (indexOfPiece !== -1) {
                    const toFilter2 = toFilter[indexOfPiece];
                    b._params.castling = b._params.castling.split('').filter((p) => p !== toFilter2).join('');
                }
            }
            b.set(from.pos, EMPTY);
            b.set(to.pos, from.newPiece || from.piece);
        }

        // increment move stats
        b._params.next = otherSide(b._params.next);
        const isEvenMove = b._moves.length % 2 === 0;
        if (isEvenMove) ++b._params.fullMoveNumber;
        b._params.halfMoveClock = isEvenMove ? 0 : 1;

        b._pastBoards.push(this);

        return b;
    }

    getLastMove() {
        return this._moves[ this._moves.length - 1 ];
    }

    makeLastMoveMate() {
        const move = this.getLastMove();
        if (!move) return;
        const updatedMove = move.replace('+', '') + '#';
        this._moves[ this._moves.length - 1 ] = updatedMove;
        return updatedMove;
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
        board._moves.push(null); // TODO?
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
    }
}

export const POSITIONS = new Set(POSITIONS_TO_INDICES.keys());

export function isValidPosition(pos) {
    return POSITIONS.has(pos);
}
