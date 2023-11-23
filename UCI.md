uci
# id name WukongJS 1.5a

(debug on)

isready
# readyok

(setoption name Hash value 32)
(setoption name UCI_AnalyseMode value true)

(ucinewgame)

(position startpos)
(position <fen> <move...>)
(position startpos moves e2e4 e7e5)

# pick one of these
go movetime 1000
go searchmoves 2
go depth 3

# bestmove e2e4

position startpos moves e2e4 e7e5

# bestmove b1c3

position startpos moves e2e4 e7e5 b1c3

stop

quit
