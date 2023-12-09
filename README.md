# TL;DR

Write a bot that plays the same way I and learns as I learn chess.
Machine algos not super relevant, this is just a cute origami for me to learn chess, notation and basic strategy.

It can now be divided into 3 parts:
- the engine itself, in vanilla JS, supporting FEN/PGN I/O and basic UCI interface (`src/*.mjs`)
- the browser playing UI, using SVG and Mithril (`src/ui/*.mjs`)
- a wrapper over stockfish.js 16, used for evaluating the board and as correct behavior reference
    - `src/stockfish-browser-wrapper.mjs`
    - `src/stockfish-node-wrapper.mjs`
    - `stockfish-host.js` (to host a compliant web server)

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
- https://en.wikipedia.org/wiki/Algebraic_notation_(chess)
- https://en.wikipedia.org/wiki/Chess_notation

    1. move move 2. move move...

    where move is (piece)(from)(x)(to)
    piece is omitted for pawns
    file can be omitted on pawn's from if only 1? or we always use the pawn's original file?
    castling king-side O-O / o-o  (w/b)
    castling queen-side O-O-O / o-o-o (w/b)
    en passant ?

### EPD?

- https://www.chessprogramming.org/Extended_Position_Description


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
    - replace path + marker (which only firefox renders correctly) with polygon
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


# chess lingo

- pin - your piece not only target an enemy piece but another one further in the line of sight. the other piece is generally more valuable.
this situation prevents the opponent from moving his closer piece without losing the one further away
- fork - move your piece in a way that it simultaneously attacks multiple pieces, forcing the opponent to sacrifice one of them
- reveal - kinda the opposite of a pin. you move a piece out of the way, exposing a better attack behind it
- win a tempo - create a situation which deflects the opponent from following their plan
- trade - to willingly capture a piece which is defended and expected to be capture next
- castling - move the king 2 cells to either left or right and have to opposing rook step over you and occupy the next cell (needs empty cells between them and all the journey of the king to be check-free. can only happen if both pieces haven't moved in the game)

- opening - initial part of the game. there are countless well known variants. knowledgeable players have countermeasures to a popular opening
- middle game - players are no longer following an opening/defense (a bit scripted) but following their own strategies. we haven't yet reached end game.
- end game - last section of the game, when players are focused on checkmating the opponent. less material is often in the board at this later stage.
