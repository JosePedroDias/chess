export const POSITIONS_TO_INDICES = new Map();
export const INDICES_TO_POSITIONS = new Map();

export const WHITE_PIECES = ['K', 'Q', 'R', 'B', 'N', 'P'];

const EMPTY = ` `;

export function isWhitePiece(piece) {
    return WHITE_PIECES.includes(piece);
}

export class Board {
    _cells = new Array(64);
    _nextIsWhite = true;

    fill(v) {
        this.iterateCells((pos) => this.set(pos, v));
    }

    setFen(fen) {
        const ranks = fen.split('/');
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
            lines.push(line.join(' '))
        }
        return lines.join('\n');
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
