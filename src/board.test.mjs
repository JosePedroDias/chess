import test from 'node:test';
import { equal, deepEqual, notDeepEqual } from 'node:assert/strict';

import { zip2 } from './utils.mjs';
import { Board, WHITE, BLACK } from './board.mjs';

test('empty board', (_t) => {
    const b = Board.empty();
    equal(b.toString(),
`                
                
                
                
                
                
                
                `);
    equal(b._params.next, WHITE);
    deepEqual(b._params.castling, new Set());
    equal(b._params.enPassant, undefined);
    equal(b._params.halfMoveClock, 0);
    equal(b._params.fullMoveNumber, 1);
});

test('default board', (_t) => {
    const b = Board.default();
    equal(b.toString(),
` r n b q k b n r
 p p p p p p p p
                
                
                
                
 P P P P P P P P
 R N B Q K B N R`);
    equal(b._params.next, WHITE);
    deepEqual(b._params.castling, new Set(['K', 'Q', 'k', 'q']));
    equal(b._params.enPassant, undefined);
    equal(b._params.halfMoveClock, 0);
    equal(b._params.fullMoveNumber, 1);
});

test('setFen', (_t) => {
    const b = new Board();
    b.setFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 b Kq h2 1 6`);
    equal(b.toString(),
` r   b k       r
 p     p B p N p
 n         n    
   p   N P     P
             P  
       P        
 P   P   K      
 q           b  `);
    equal(b._params.next, BLACK);
    deepEqual(b._params.castling, new Set(['K', 'q']));
    equal(b._params.enPassant, 'h2');
    equal(b._params.halfMoveClock, 1);
    equal(b._params.fullMoveNumber, 6);
});

test('cell positions and iterateCells', (_t) => {
    const b = new Board();
    for (const [pos] of b) b.set(pos, pos);
    equal(b.toString(),
` a8 b8 c8 d8 e8 f8 g8 h8
 a7 b7 c7 d7 e7 f7 g7 h7
 a6 b6 c6 d6 e6 f6 g6 h6
 a5 b5 c5 d5 e5 f5 g5 h5
 a4 b4 c4 d4 e4 f4 g4 h4
 a3 b3 c3 d3 e3 f3 g3 h3
 a2 b2 c2 d2 e2 f2 g2 h2
 a1 b1 c1 d1 e1 f1 g1 h1`);
});

test('getFen', (_t) => {
    const b = new Board();
    b.setFen(`r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 b Kq h2 1 6`);
    equal(b.getFen(), `r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 b Kq h2 1 6`);
});

test('set', (_t) => {
    const b = new Board();
    b.set('b2', 'K');
    equal(b.toString(),
`                
                
                
                
                
                
   K            
                `);
});

test('get', (_t) => {
    const b = new Board();
    b.set('b3', 'Q');
    equal(b.get('b3'), 'Q');
    equal(b.get('b4'), ' ');
});

test('clone', (_t) => {
    const b = new Board();
    const b2 = b.clone();
    const b3 = b.clone();
    deepEqual(b, b2);
    deepEqual(b, b3);
    b2.set('a1', 'R');
    notDeepEqual(b, b2);
    b3._params.next = BLACK;
    notDeepEqual(b, b3);
});

test('getPgn',  (_t) => {
    const moves = ['g1f3', 'b8a6', 'f3e5', 'h7h6', 'f2f4', 'f7f6', 'g2g3', 'f6e5', 'f1h3', 'e5f4', 'e1g1', 'f4g3', 'd1e1', 'g3h2', 'g1h2', 'h8h7', 'b2b4', 'a6b4', 'c2c3', 'b4a2', 'c1a3', 'a2c3', 'd2c3', 'c7c5'];
    const movePgns = 'Nf3 Na6 Ne5 h6 f4 f6 g3 fxe5 Bh3 exf4 O-O fxg3 Qe1 gxh2 Kxh2 Rh7 b4 Nxb4 c3 Nxa2 Ba3 Nxc3 dxc3 c5'.split(' ');
    let b = Board.default();
    for (const [mv, pgn] of zip2(moves, movePgns)) b = b.applyMove(mv, pgn);
    const pgn = b.getPgn().replace(/\d{4}\.\d{2}\.\d{2}/, 'DATE');
    equal(pgn, `[Site "https://josepedrodias.github.io/chess/"]
[Date "DATE"]
1. Nf3 Na6 2. Ne5 h6 3. f4 f6 4. g3 fxe5 5. Bh3 exf4 6. O-O fxg3 7. Qe1 gxh2 8. Kxh2 Rh7 9. b4 Nxb4 10. c3 Nxa2 11. Ba3 Nxc3 12. dxc3 c5`);
});

test('getPgn odd num of moves', (_t) => {
    const moves = ['g1f3', 'b8a6', 'f3e5', 'h7h6', 'f2f4', 'f7f6', 'g2g3', 'f6e5', 'f1h3', 'e5f4', 'e1g1', 'f4g3', 'd1e1', 'g3h2', 'g1h2', 'h8h7', 'b2b4', 'a6b4', 'c2c3', 'b4a2', 'c1a3', 'a2c3', 'd2c3'];
    const movePgns = 'Nf3 Na6 Ne5 h6 f4 f6 g3 fxe5 Bh3 exf4 O-O fxg3 Qe1 gxh2 Kxh2 Rh7 b4 Nxb4 c3 Nxa2 Ba3 Nxc3 dxc3'.split(' ');
    let b = Board.default();
    for (const [mv, pgn] of zip2(moves, movePgns)) b = b.applyMove(mv, pgn);
    const pgn = b.getPgn().replace(/\d{4}\.\d{2}\.\d{2}/, 'DATE');
    equal(pgn, `[Site "https://josepedrodias.github.io/chess/"]
[Date "DATE"]
1. Nf3 Na6 2. Ne5 h6 3. f4 f6 4. g3 fxe5 5. Bh3 exf4 6. O-O fxg3 7. Qe1 gxh2 8. Kxh2 Rh7 9. b4 Nxb4 10. c3 Nxa2 11. Ba3 Nxc3 12. dxc3`);
});

test('applyMove', (_t) => {
    {
        // regular king move
        const b = Board.fromFen(`k7/8/8/8/8/8/8/7K w - - 0 1`);
        const b2 = b.applyMove('h1g1');
        equal(b2.getFen(), `k7/8/8/8/8/8/8/6K1 b - - 1 1`);
    }
    {
        // regular pawn move
        const b = Board.fromFen(`k7/8/7P/8/8/8/8/7K w - - 0 1`);
        const b2 = b.applyMove('h6h7');
        equal(b2.getFen(), `k7/7P/8/8/8/8/8/7K b - - 0 1`);
    }
    {
        // pawn move with en passant capture
        const b = Board.fromFen(`rnbqkbnr/pppppp2/8/6pP/8/8/PPPPPPP1/RNBQKBNR w KQkq g6 0 2`);
        const b2 = b.applyMove('h5g6');
        equal(b2.getFen(), `rnbqkbnr/pppppp2/6P1/8/8/8/PPPPPPP1/RNBQKBNR b KQkq - 0 2`);
    }
    {
        // pawn move with promotion
        const b = Board.fromFen(`8/7P/8/8/k7/8/8/7K w - - 0 1`);
        const b2 = b.applyMove('h7h8q');
        equal(b2.getFen(), `7Q/8/8/8/k7/8/8/7K b - - 0 1`);
    }
    {
        // castling move
        const b = Board.fromFen(`rnbqkbnr/pppppppp/8/8/8/6P1/PPPPPP1P/RNBQK2R w KQkq - 0 1`);
        const b2 = b.applyMove('e1g1');
        equal(b2.getFen(), `rnbqkbnr/pppppppp/8/8/8/6P1/PPPPPP1P/RNBQ1RK1 b kq - 1 1`);
    }
});

test('fromPgn basic', (_t) => {
    const b = Board.fromPgn(`1. b4 c5 2. bxc5 Na6`); // b2b4 c7c5 b4c5 b8a6
    equal(b.getFen(), `r1bqkbnr/pp1ppppp/n7/2P5/8/8/P1PPPPPP/RNBQKBNR w KQkq - 1 3`);
    deepEqual(b._moves, ['b2b4', 'c7c5', 'b4c5', 'b8a6']);
    deepEqual(b._movesPgn, ['b4', 'c5', 'bxc5', 'Na6']);
});

test('fromPgn with tags and comments', (_t) => {
    const b = Board.fromPgn(`[Tag "Tag Value"]
[AnotherTag "another 123"]
{bananas and oranges} 1. e3 e6`);
    equal(b.getFen(), `rnbqkbnr/pppp1ppp/4p3/8/8/4P3/PPPP1PPP/RNBQKBNR w KQkq - 0 2`);
    deepEqual(b._moves, ['e2e3', 'e7e6']);
    deepEqual(b._movesPgn, ['e3', 'e6']);
});

test('fromPgn other', () => {
    const b = Board.fromPgn(`[Site "https://josepedrodias.github.io/chess/"]
[Date "2023.12.26"]
1. d3 d5 2. c3 e5 3. Nd2 Nc6 4. e4 Nf6 5. Be2 Bc5 6. Ng1f3 Bg4 7. O-O O-O 8. h3 Bh5 9. exd5 Nxd5 10. Ne4 Bb6 11. g4 Bg6 12. Bd2 f6 13. Qb3 Bf7 14. Qc2 Qe7 15. Nh4 Ra8d8 16. Nf5 Qe6 17. a3 Ba5 18. b4 Bb6 19. d4 h6 20. b5 Na5 21. Ra1b1 g6 22. Kh2 h5 23. Rg1`);
    equal(b.getFen(), `3r1rk1/ppp2b2/1b2qpp1/nP1npN1p/3PN1P1/P1P4P/2QBBP1K/1R4R1 b - - 1 23`);
    deepEqual(b._moves, [
        'd2d3', 'd7d5', 'c2c3', 'e7e5', 'b1d2',
        'b8c6', 'e2e4', 'g8f6', 'f1e2', 'f8c5',
        'g1f3', 'c8g4', 'e1g1', 'e8g8', 'h2h3',
        'g4h5', 'e4d5', 'f6d5', 'd2e4', 'c5b6',
        'g2g4', 'h5g6', 'c1d2', 'f7f6', 'd1b3',
        'g6f7', 'b3c2', 'd8e7', 'f3h4', 'a8d8',
        'h4f5', 'e7e6', 'a2a3', 'b6a5', 'b2b4',
        'a5b6', 'd3d4', 'h7h6', 'b4b5', 'c6a5',
        'a1b1', 'g7g6', 'g1h2', 'h6h5', 'f1g1'
    ]);
    deepEqual(b._movesPgn, [
        'd3',    'd5',   'c3',   'e5',  'Nd2',
        'Nc6',   'e4',   'Nf6',  'Be2', 'Bc5',
        'Ng1f3', 'Bg4',  'O-O',  'O-O', 'h3',
        'Bh5',   'exd5', 'Nxd5', 'Ne4', 'Bb6',
        'g4',    'Bg6',  'Bd2',  'f6',  'Qb3',
        'Bf7',   'Qc2',  'Qe7',  'Nh4', 'Ra8d8',
        'Nf5',   'Qe6',  'a3',   'Ba5', 'b4',
        'Bb6',   'd4',   'h6',   'b5',  'Na5',
        'Ra1b1', 'g6',   'Kh2',  'h5',  'Rg1'
    ]);
    deepEqual(b._tags, {
        Date: '2023.12.26',
        Site: 'https://josepedrodias.github.io/chess/',
    });
    equal(b.getPgn(), `[Site "https://josepedrodias.github.io/chess/"]
[Date "2023.12.26"]
1. d3 d5 2. c3 e5 3. Nd2 Nc6 4. e4 Nf6 5. Be2 Bc5 6. Ng1f3 Bg4 7. O-O O-O 8. h3 Bh5 9. exd5 Nxd5 10. Ne4 Bb6 11. g4 Bg6 12. Bd2 f6 13. Qb3 Bf7 14. Qc2 Qe7 15. Nh4 Ra8d8 16. Nf5 Qe6 17. a3 Ba5 18. b4 Bb6 19. d4 h6 20. b5 Na5 21. Ra1b1 g6 22. Kh2 h5 23. Rg1`);
});

// TODO fromPgn: promotion
// TODO fromPgn: en passant


test('fromPgn w/ clock comments', (_t) => {
    const b = Board.fromPgn(`[Event "FIDE World Rapid Chess Championship 2023"]
    [Site "Chess.com"]
    [Date "2023.12.26"]
    [Round "05"]
    [White "Fedoseev, Vladimir"]
    [Black "Bharath Subramaniyam H"]
    [Result "1/2-1/2"]
    [WhiteElo "2716"]
    [BlackElo "2426"]
    [TimeControl "15+10"]
    
    1. d4 {[%clk 0:15:19]} 1... Nf6 {[%clk 0:15:16]} 2. c4 {[%clk 0:15:28]} 2... e6
    {[%clk 0:15:12]} 3. Nc3 {[%clk 0:15:36]} 3... Bb4 {[%clk 0:15:21]} 4. Qc2 {[%clk
    0:15:37]} 4... d5 {[%clk 0:15:22]} 5. a3 {[%clk 0:15:44]} 5... Bxc3+ {[%clk
    0:15:17]} 6. Qxc3 {[%clk 0:15:51]} 6... Ne4 {[%clk 0:15:10]} 7. Qc2 {[%clk
    0:16:00]} 7... c5 {[%clk 0:14:51]} 8. dxc5 {[%clk 0:16:07]} 8... Nc6 {[%clk
    0:14:58]} 9. Nf3 {[%clk 0:16:15]} 9... Qa5+ {[%clk 0:14:47]} 10. Bd2 {[%clk
    0:16:23]} 10... Qxc5 {[%clk 0:13:22]} 11. e3 {[%clk 0:16:25]} 11... O-O {[%clk
    0:12:13]} 12. b4 {[%clk 0:15:46]} 12... Qe7 {[%clk 0:11:51]} 13. Bc1 {[%clk
    0:14:30]} 13... Nd6 {[%clk 0:09:10]} 14. c5 {[%clk 0:13:33]} 14... Ne4 {[%clk
    0:08:33]} 15. Bb2 {[%clk 0:13:27]} 15... Bd7 {[%clk 0:05:47]} 16. Bd3 {[%clk
    0:13:04]} 16... a5 {[%clk 0:05:23]} 17. Bxe4 {[%clk 0:11:09]} 17... dxe4 {[%clk
    0:05:32]} 18. Qxe4 {[%clk 0:11:18]} 18... axb4 {[%clk 0:05:35]} 19. axb4 {[%clk
    0:11:25]} 19... Rxa1+ {[%clk 0:05:08]} 20. Bxa1 {[%clk 0:11:34]} 20... Ra8
    {[%clk 0:04:37]} 21. O-O {[%clk 0:10:57]} 21... Ra4 {[%clk 0:04:30]} 22. Ne5
    {[%clk 0:07:12]} 22... Rxb4 {[%clk 0:03:47]} 23. Nxc6 {[%clk 0:07:13]} 23...
    Rxe4 {[%clk 0:03:55]} 24. Nxe7+ {[%clk 0:07:21]} 24... Kf8 {[%clk 0:04:04]} 25.
    Rd1 {[%clk 0:05:30]} 25... Rc4 {[%clk 0:03:24]} 26. Ng8 {[%clk 0:04:02]} 26...
    Kxg8 {[%clk 0:02:38]} 27. Bb2 {[%clk 0:03:23]} 27... Be8 {[%clk 0:02:15]} 28.
    Rd8 {[%clk 0:03:32]} 28... Kf8 {[%clk 0:02:24]} 29. h3 {[%clk 0:03:33]} 29...
    Rc2 {[%clk 0:00:25]} 30. Be5 {[%clk 0:02:56]} 30... f6 {[%clk 0:00:28]} 31. Bd6+
    {[%clk 0:03:04]} 31... Kf7 {[%clk 0:00:37]} 32. Rc8 {[%clk 0:03:12]} 32... Bc6
    {[%clk 0:00:32]} 33. h4 {[%clk 0:02:50]} 33... h5 {[%clk 0:00:29]} 34. f3 {[%clk
    0:02:57]} 34... g5 {[%clk 0:00:26]} 35. hxg5 {[%clk 0:02:37]} 35... fxg5 {[%clk
    0:00:36]} 36. e4 {[%clk 0:02:45]} 36... g4 {[%clk 0:00:20]} 37. Rh8 {[%clk
    0:02:33]} 37... Kg6 {[%clk 0:00:17]} 38. Rg8+ {[%clk 0:02:40]} 38... Kf6 {[%clk
    0:00:18]} 39. Kh1 {[%clk 0:01:59]} 39... Bb5 {[%clk 0:00:12]} 40. Kg1 {[%clk
    0:01:16]} 40... Bc6 {[%clk 0:00:21]} 41. Rf8+ {[%clk 0:01:19]} 41... Kg6 {[%clk
    0:00:26]} 42. Rb8 {[%clk 0:01:25]} 42... Kf7 {[%clk 0:00:32]} 43. Rd8 {[%clk
    0:01:20]} 43... Kg7 {[%clk 0:00:26]} 44. Rf8 {[%clk 0:01:06]} 44... Kg6 {[%clk
    0:00:25]} 45. Rh8 {[%clk 0:01:01]} 45... Kg5 {[%clk 0:00:15]} 46. Rg8+ {[%clk
    0:00:41]} 46... Kf6 {[%clk 0:00:24]} 47. fxg4 {[%clk 0:00:36]} 47... hxg4 {[%clk
    0:00:25]} 48. Rxg4 {[%clk 0:00:44]} 48... e5 {[%clk 0:00:18]} 49. Rh4 {[%clk
    0:00:53]} 49... Re2 {[%clk 0:00:24]} 50. Rh6+ {[%clk 0:00:47]} 50... Kg5 {[%clk
    0:00:23]} 51. Re6 {[%clk 0:00:43]} 51... Rxe4 {[%clk 0:00:31]} 52. Kf2 {[%clk
    0:00:37]} 52... Kf5 {[%clk 0:00:29]} 53. Re7 {[%clk 0:00:45]} 53... Rf4+ {[%clk
    0:00:38]} 54. Ke3 {[%clk 0:00:52]} 54... Re4+ {[%clk 0:00:39]} 55. Kd3 {[%clk
    0:00:46]} 55... Rd4+ {[%clk 0:00:47]} 56. Kc3 {[%clk 0:00:54]} 56... Rg4 {[%clk
    0:00:40]} 57. Rxe5+ {[%clk 0:00:58]} 57... Kf6 {[%clk 0:00:48]} 58. Re1 {[%clk
    0:00:52]} 58... Rxg2 {[%clk 0:00:52]} 59. Be5+ {[%clk 0:00:57]} 59... Kf5 {[%clk
    0:00:52]} 60. Bd4 {[%clk 0:01:01]} 60... Rg4 {[%clk 0:00:46]} 61. Re5+ {[%clk
    0:01:04]} 61... Kg6 {[%clk 0:00:54]} 62. Re7 {[%clk 0:01:10]} 62... Re4 {[%clk
    0:01:01]} 63. Rg7+ {[%clk 0:01:16]} 63... Kf5 {[%clk 0:01:06]} 64. Rh7 {[%clk
    0:01:22]} 64... Rg4 {[%clk 0:01:09]} 65. Rh6 {[%clk 0:01:26]} 65... Rg6 {[%clk
    0:01:11]} 66. Rh5+ {[%clk 0:01:32]} 66... Rg5 {[%clk 0:01:19]} 67. Rh8 {[%clk
    0:01:37]} 67... Ke4 {[%clk 0:01:26]} 68. Rh4+ {[%clk 0:01:34]} 68... Kd5 {[%clk
    0:01:32]} 69. Be3 {[%clk 0:01:40]} 69... Rg3 {[%clk 0:01:35]} 70. Kd2 {[%clk
    0:01:41]} 70... Rg2+ {[%clk 0:01:35]} 71. Kd3 {[%clk 0:01:42]} 71... Bb5+ {[%clk
    0:01:28]} 72. Kc3 {[%clk 0:01:49]} 72... Rg3 {[%clk 0:01:34]} 73. Kd2 {[%clk
    0:01:34]} 73... Rg2+ {[%clk 0:01:42]} 74. Kc3 {[%clk 0:01:43]} 74... Rg3 {[%clk
    0:01:51]} 75. Kb4 {[%clk 0:01:24]} 75... Rxe3 {[%clk 0:01:53]} 76. Kxb5 {[%clk
    0:01:02]} 76... Rb3+ {[%clk 0:02:02]} 77. Rb4 {[%clk 0:01:11]} 77... Rxb4+
    {[%clk 0:02:02]} 78. Kxb4 {[%clk 0:01:20]} 78... Kc6 {[%clk 0:02:19]} 79. Kc4
    {[%clk 0:01:29]} 79... b6 {[%clk 0:02:28]} 80. cxb6 {[%clk 0:01:38]} 80... Kxb6
    {[%clk 0:02:37]} 1/2-1/2`);
    equal(b.getFen(), `8/8/1k6/8/2K5/8/8/8 w - - 0 81`);
    equal(b._moves.length, 160);
});
