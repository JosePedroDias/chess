# TL;DR

Write a bot that plays the same way I and learns as I learn chess.
Machine algos not super relevant, this is just a cute origami for me to learn chess, notation and basic strategy.

It can now be divided into 3 parts:
- the engine itself, in vanilla JS, supporting FEN/PGN I/O and basic UCI interface (`src/*.mjs`)
- the browser playing UI, using SVG and Mithril (`src/ui/*.mjs`)
- a wrapper over stockfish.js 16, used for evaluating the board and as correcting benchmark (`src/main-stockfish-wrapper.mjs` + `stockfish-host.js` (to host a compliant web server))

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

- https://en.wikipedia.org/wiki/Portable_Game_Notation

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
    - game is buggy. review move object <-> string, maybe adopt simpler stockfish notation instead
    - fix valid moves
        - moveFromString pawns sometimes fail
        - properly test castling criteria
        - refactor validMoves/validMoves2 mess
    - enforce repetition rule
    - detect attacked pieces and whether they're defended in a simpler way
    - find checkmate in 1/2/3...
    - fix bot UCI compatibility
    - introduce more tactical ideas to bot reasoning maybe?
    - (super secondary) support option to play against stockfish instead of my dumb bot
- UI
    - buttons: new game / play on other side / export PGN
    - (you can currently do `copy(board.getPgn())` on the browser console and paste in sites such as http://lichess.org/paste )
    - animate pieces... (hard with the current internal rep)

# setup

optional:
    if you want to have stockfish:
    - clone `https://github.com/nmrugg/stockfish.js/` into `vendors/stockfish.js`
    - run `extract-minimal-stockfish.sh`
    - host the game via `node stockfish-host.js` or adapt the recipe to your web server
    - uncomment the stockfish `main-stockfish-wrapper.mjs` script line in `index.html` to use it

to run the engine you need node 20.x or later / evergreen browsers
    - `index.html` host and visit the index page to play
    - `npm run botWithoutUci` to play bot vs bot or bot vs human in node/terminal
    - `npm run bot` to host a UCI interface (tentative)
    - `npm test` to run all tests (not amazing coverage)
