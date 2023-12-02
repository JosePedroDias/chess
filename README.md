# TL;DR

Write a bot that plays the same way I and learns as I learn chess.
Machine algos not super relevant, this is just a cute origami for me to learn chess, notation and basic strategy.

# Reference

## GUIs

- http://www.playwitharena.de/
- https://lucaschess.pythonanywhere.com/
- https://scidvspc.sourceforge.net/
- https://chessx.sourceforge.io/  (decent, works on mac)


## Engines

- https://stockfishchess.org/
- https://github.com/maksimKorzh/wukongJS


## Sites for playing

- https://www.chess.com/play/computer
- https://lichess.org/editor/r2qkb1r/ppp2ppp/3pb3/3np1N1/1n2P3/2N5/PPP1BPPP/R1BQK2R_b_KQkq_-_0_2?color=white


## GUI - engine protocols

- UCI - https://www.wbec-ridderkerk.nl/html/UCIProtocol.html / https://www.shredderchess.com/download.html
- XBoard - https://www.gnu.org/software/xboard/engine-intf.html


## Notations

### FEN

- https://www.chess.com/terms/fen-chess
- https://lichess.org/editor/r2qkb1r/ppp2ppp/3pb3/3np1N1/1n2P3/2N5/PPP1BPPP/R1BQK2R_b_KQkq_-_0_2?color=white


### PGN

    1. move move 2. move move...

    where move is (piece)(from)(x)(to)
    piece is omitted for pawns
    file can be omitted on pawn's from if only 1? or we always use the pawn's original file?
    castling king-side O-O / o-o  (w/b)
    castling queen-side O-O-O / o-o-o (w/b)
    en passant ?


## terminal colors

- https://github.com/alexeyraspopov/picocolors/blob/main/picocolors.js
- https://github.com/jorgebucaran/colorette/blob/main/index.js


## Other

- https://www.chess.com/terms/chess-piece-value
- https://chess-bot.com/online_calculator/next_best_move.html
- https://stackoverflow.com/questions/17003561/using-the-universal-chess-interface
- https://en.wikipedia.org/wiki/Chess_symbols_in_Unicode
- https://nodejs.org/dist/latest-v20.x/docs/api/assert.html
- https://github.com/jhlywa/chess.js/blob/master/src/chess.ts
- https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces
- https://developer.mozilla.org/en-US/docs/Web/SVG/Element
- https://mithril.js.org/autoredraw.html
- https://mithril.js.org/components.html#lifecycle-methods
- https://www.chessboardjs.com/examples#5000
- https://github.com/nmrugg/stockfish.js/
- https://github.com/official-stockfish/Stockfish/wiki/UCI-%26-Commands
- https://chesstempo.com/pgn-viewer/
- https://lichess.org/paste

# TODO

- logic
    - fix valid moves
        - castling (check for no checks in kings way)
        - moveFromString pawns sometimes fail

    - detect repetition (3 sets of equal moves?)
    - find checkmate in 1/2/3
    - fix bot UCI compatibility
    - add more common knowledge / heuristic (material + more)
    - (low prio) minimax/alpha-beta
- ui
    - allow moving by dragging
    - animate pieces... (hard)
