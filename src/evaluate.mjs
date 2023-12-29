import {
    PAWN_B, PAWN_W,
    isBishop, isRook, isQueen, isKing, isKnight , isPawn, isWhitePiece, isBlackPiece, isPieceOfColor,
    knightStartPositions, bishopStartPositions, queenStartPosition, kingStartPosition,
} from './pieces.mjs';
import { EMPTY, CASTLING_MOVES, FILES } from './board.mjs';
import { alwaysTrue, histogram, flatten1 } from './utils.mjs';
import { isChecking, moveToPgn, rookMoves, bishopMoves, queenMoves } from './move.mjs';
import { validMoves } from './valid-moves.mjs';

export const PIECE_VALUE = {
    'q': 9,
    'r': 5,
    'b': 3,
    'n': 3,
    'p': 1,
};

export const CHECKMATE      = 'checkmate';
export const DRAW_STALEMATE = 'draw: stalemate';
export const DRAW_3FOLD     = 'draw: threefold repetition';
export const DRAW_50MOVE    = 'draw: 50 moves wo/ captures or pawn moves';

export function getPieceMaterial(piece) {
    return PIECE_VALUE[piece.toLowerCase()] || 0;
}

export function getBoardMaterial(board, isWhite) {
    let mat = 0;
    for (const [_, piece] of board) {
        let v = getPieceMaterial(piece);
        if (v) {
            const sign = (isWhitePiece(piece) === isWhite) ? 1 : -1;
            mat += sign * v;
        }
    }
    return mat;
}

export function getBoardCaptureCount(board, isWhite) {
    const o = new Map([
        ['q', 1],
        ['r', 2],
        ['b', 2],
        ['n', 2],
        ['p', 8],
    ]);
    const isMyPiece = isPieceOfColor(isWhite);
    for (const [_, piece] of board) {
        if (isMyPiece(piece)) {
            const piece2 = piece.toLowerCase();
            if (piece2 === 'k') continue;
            let count = o.get(piece2);
            o.set(piece2, count - 1);
        }
    }
    return o;
}

export function getBoardCaptures(board) {
    const histW = getBoardCaptureCount(board, true);
    const histB = getBoardCaptureCount(board, false);
    const matW = Array.from(histW).reduce((mat, [k, count]) => mat + count * getPieceMaterial(k), 0);
    const matB = Array.from(histB).reduce((mat, [k, count]) => mat + count * getPieceMaterial(k), 0);
    return [histW, histB, matW - matB];
}

export function findMaterialDraws(board) {
    const p1 = board.getSidePositions(true ).map(([_, piece]) => piece.toLowerCase());
    const p2 = board.getSidePositions(false).map(([_, piece]) => piece.toLowerCase());
    const h1 = histogram(p1);
    const h2 = histogram(p2);

    if (h1.p > 0 || h2.p > 0) return;
    if (h1.r > 0 || h2.r > 0) return;
    if (h1.q > 0 || h2.q > 0) return;

    // K+B vs K
    if (h1.n === 0 && h2.n === 0 && ((h1.b === 0 && h2.b === 1) || (h1.b === 1 && h2.b === 0))) return 'draw: K+B vs K';

    // K+N vs K
    if (h1.b === 0 && h2.b === 0 && ((h1.n === 0 && h2.n === 1) || (h1.n === 1 && h2.n === 0))) return 'draw: K+N vs K';

    // TODO: KBw vs KBw || KBb vs KBb

    // K vs K
    if (h1.b > 0 || h2.b > 0) return;
    if (h1.n > 0 || h2.n > 0) return;
    return 'draw: K vs K';
}

export function isTie(board) {
    // threefold repetition
    if (board._moves.length >= 6) {
        const fenRepsMap = new Map();
        const boards = [...board._pastBoards, board];
        for (let b of boards) {
            const [boardFen, sideFen] = b.getFen().split(' ');
            const key = [boardFen, sideFen].join('_');
            const v = fenRepsMap.get(key);
            if (!v) fenRepsMap.set(key, 1);
            else if (v === 2) {
                console.log(b.toString()); // board which happened 3 times for the same side
                return DRAW_3FOLD;
            }
            else fenRepsMap.set(key, v + 1);
        }
    }

    // fifty move rule
    if (board._params.halfMoveClock === 100) return DRAW_50MOVE;

    return findMaterialDraws(board);
}

function _gmAux(stageName, froms, filterFn = alwaysTrue) {
    return {
        stage: stageName,
        moves: validMoves(board).filter((mv) => {
            const from = mv.substring(0, 2);
            return froms.includes(from);
        }).filter(filterFn),
    };
}

// returns an array of moves
export function goldenMoves(board) {
    const isWhite = board.isWhiteNext();

    if (board._moves.length > 20) // 10 moves
        return {
            stage: 'ended',
            moves: [],
        };

    // develop center pawns
    let moves = (isWhite ? ['d2', 'e2'] : ['d7', 'e7']).filter(p => isPawn(board.get(p)));
    let o = _gmAux('1.pawns', moves);
    if (o.moves.length > 0) return o;

    // develop knights
    moves = knightStartPositions(isWhite).filter(p => isKnight(board.get(p)));
    o = _gmAux('2.knights', moves, (mv) => ['6', '3'].includes(mv[3])); // avoid occluding bishops
    if (o.moves.length > 0) return o;

    // develop bishops
    moves = bishopStartPositions(isWhite).filter(p => isBishop(board.get(p)));
    o = _gmAux('3.bishops', moves);
    if (o.moves.length > 0) return o;

    // move queen?
    moves = [queenStartPosition(isWhite)].filter(p => isQueen(board.get(p)));
    o = _gmAux('4.queen', moves, (mv) => !(['1', '8'].includes(mv[3]))); // don't move to the side
    if (o.moves.length > 0) return o;

    // castle
    moves = [kingStartPosition(isWhite)].filter(p => isKing(board.get(p)));
    return _gmAux('5.castle', moves, (mv) => CASTLING_MOVES.includes(mv));
}


// TODO checks, captures and threats
export function checksCapturesAndThreats(board) {
    const isWhite = board.isWhiteNext();
    //const checks = 
}

// TODO detect discovered attacks

export function pawnStructure(board) {
    const isWhite = board.isWhiteNext();
    const colorFilter = isPieceOfColor(isWhite);
    const oppColorFilter = isPieceOfColor(!isWhite);
    const pawnPositions = board.positionsHaving((v) => isPawn(v) && colorFilter(v)).sort(); //sort by file
    const oppPawnPositions = board.positionsHaving((v) => isPawn(v) && oppColorFilter(v)).sort();
    const oppPawnFiles = new Set(oppPawnPositions.map(p => p[0]));

    const passed = pawnPositions.filter((pos) => {
        const file = pos[0];
        return !oppPawnFiles.has(file);
    });

    const clusters = [];
    let cluster = [];
    for (const f of FILES) {
        const res = pawnPositions.filter((pos) => pos[0] === f);
        if (res.length > 0) {
            cluster.push(res);
        } else if (cluster.length > 0) {
            clusters.push(cluster);
            cluster = [];
        }
    }
    if (cluster.length > 0) clusters.push(cluster);

    // TODO clusters can't have rank gaps >1 nor <-1
    

    const isolated = clusters.filter((c) => c.length === 1).map((c) => c[0]);
    //const nonIsolated = clusters.filter((c) => c.some((cc) => cc.length > 1));//.flat();
    const nonIsolated = flatten1(clusters.reduce((prev, c) => {
        const arr = c.filter((cc) => cc.length > 1);
        if (arr.length > 0) prev.push(arr);
        return prev;
    }, []));
    const doubled = nonIsolated;

    const backward = doubled.map(arr => {
        //const 
    });

    const o = {
        count: pawnPositions.length,
        clusters,
        isolated,
        doubled,
        backward,
        passed,
    };
    console.log('pawnStructure', JSON.stringify(o));
    return o
}

function boardSpace(board) {
    return validMoves(board).length;
}

// who played is attacking more than 1 enemy piece
export function canFork(board, mySide) {
    const vMoves = validMoves(board, mySide);
    const potentialCaptures = [];
    const isEnemyPiece = mySide ? isBlackPiece : isWhitePiece;
    for (const mv of vMoves) {
        const to = mv.substring(2, 4);
        const toPiece = board.get(to);
        if (isEnemyPiece(toPiece)) {
            potentialCaptures.push(toPiece);
        }
    }
    const result = potentialCaptures.length > 1;
    return { result, potentialCaptures };
}

// export function rateFork(potentialCaptures) {}

// long range pieces only (B, R, Q)
// instead of stopping at first enemy piece, continue until a pieces of ours is met
export function canPinSkewer(board, mySide) {
    const isMyPiece = isPieceOfColor(mySide);
    const attackedPiecePacks = [];
    const sidePositions = board.getSidePositions(mySide);
    for (const [pos, piece] of sidePositions) {
        let movesArr;
        if (isBishop(piece)) {
            movesArr = bishopMoves(pos);
        } else if (isRook(piece)) {
            movesArr = rookMoves(pos);
        } else if (isQueen(piece)) {
            movesArr = queenMoves(pos);
        } else {
            continue;
        }

        if (movesArr[0] && movesArr[0] instanceof Array) {
            for (const dirPositions of movesArr) {
                const attackedPieces = [];
                dirL: for (const to of dirPositions) {
                    const v = board.get(to);
                    if (isMyPiece(v)) {
                        break dirL;
                    } else if (v !== EMPTY) {
                        attackedPieces.push(v);
                    }
                }
                if (attackedPieces.length > 1) {
                    attackedPiecePacks.push(attackedPieces);
                }
            }
        }
    }
    const result = attackedPiecePacks.length > 0;
    return { result, attackedPiecePacks };
}

//export function ratePinSkewer(attackedPiecePacks) {}

export function computeOutcomes(board) {
    const tieResult = isTie(board);
    if (tieResult) throw tieResult;

    const isWhite = board.isWhiteNext();

    const amIBeingChecked = isChecking(board, !isWhite);

    pawnStructure(board);

    const moves = validMoves(board);

    if (moves.length === 0) {
        throw (amIBeingChecked ? `${CHECKMATE} by ${board.getInvertedBoard()._params.next}` : DRAW_STALEMATE);
    }

    const captureMoves       = new Set();
    const forkMoves          = new Map();
    const pinSkewerMoves     = new Map();
    const promotionMoves     = new Set();
    const checkMoves         = new Set();
    const checkmateMoves     = new Set();
    const stalemateMoves     = new Set();
    const canBeCapturedMoves = new Set();
    const attackedPositions  = new Set();
    const viewedPositions    = [new Set(), new Set()];
    const defendedPositions  = new Set();

    const initialMaterial = getBoardMaterial(board, isWhite);

    const materialDiff = new Map();

    const myPiecePositions = board.getSidePositions(isWhite).map(([pos]) => pos);

    outerMPP: for (const pos of myPiecePositions) {
        if (isKing(board.get(pos))) continue;
        const board_ = board.clone();
        board_.set(pos, isWhite ? PAWN_B : PAWN_W);
        const moves_ = validMoves(board_);
        for (const mv_ of moves_) {
            const to_ = mv_.substring(2, 4);
            if (to_ === pos) {
                defendedPositions.add(pos);
                continue outerMPP;
            }
        }
    }

    for (const mv of moves) {
        const to = mv.substring(2, 4);
        const prom = mv[4];

        let bestEndMaterial  = -100000;
        let worseEndMaterial =  100000;
        materialDiff.set(mv, [0, 0]);

        if (board.get(to) !== EMPTY) captureMoves.add(mv);

        if (prom) promotionMoves.add(mv);
        const board2 = board.applyMove(mv);

        const pinSkewerRes = canPinSkewer(board2, isWhite);
        const forkRes      = canFork(board2, isWhite);
        if (pinSkewerRes.result) pinSkewerMoves.set(mv, pinSkewerRes.attackedPiecePacks);
        if (forkRes.result)      forkMoves.set(mv, forkRes.potentialCaptures);

        const amIChecking = isChecking(board2, isWhite);
        if (amIChecking) checkMoves.add(mv);

        const moves2 = validMoves(board2);
        for (const mv2 of moves2) {
            const board3 =  board2.applyMove(mv2);
            const endMaterial = getBoardMaterial(board3, isWhite);

            if (endMaterial > bestEndMaterial)  bestEndMaterial  = endMaterial;
            if (endMaterial < worseEndMaterial) worseEndMaterial = endMaterial;

            const myPiecePositions2 = board2.getSidePositions(isWhite).map(([pos]) => pos);
            const to2 = mv2.substring(2, 4);

            viewedPositions[0].add(to2);

            if (myPiecePositions.includes(to2) && board2.get(to2) !== EMPTY) attackedPositions.add(to2);
            if (myPiecePositions2.includes(to2)) canBeCapturedMoves.add(mv);
        }

        const moves2b = validMoves(board.getInvertedBoard());
        for (const mv2 of moves2b) {
            const to2 = mv2.substring(2, 4);
            viewedPositions[1].add(to2);
        }

        const numMoves = moves2.length;

        if (numMoves === 0) {
            const bag = amIChecking ? checkmateMoves : stalemateMoves;
            bag.add(mv);
        } else {
            materialDiff.set(
                mv, [
                    worseEndMaterial - initialMaterial,
                    bestEndMaterial  - initialMaterial,
                ]);
        }
    }

    const moveAttributesMap = new Map();

    for (const move of moves) {
        const isCheck        = checkMoves.has(move);
        const isCheckmate    = checkmateMoves.has(move);
        const isStalemate    = stalemateMoves.has(move);
        const isCapture      = captureMoves.has(move);
        const canBeCaptured  = canBeCapturedMoves.has(move);
        const isPromotion    = promotionMoves.has(move);
        const rnd = Math.random();
        const [worseMatDiff, bestMatDiff] = materialDiff.get(move);

        const isPinSkewer = pinSkewerMoves.has(move);
        const isFork      = forkMoves.has(move);
        
        const pgn = moveToPgn(move, board, moves) + (isCheckmate ? '#' : isCheck ? '+' : '');
        
        moveAttributesMap.set(move, {
            move,
            pgn,
            isCheck,
            isCheckmate,
            isStalemate,
            isCapture,
            isPinSkewer,
            isFork,
            canBeCaptured,
            isPromotion,
            worseMatDiff,
            bestMatDiff,
            rnd,
        });
    }

    const { stage, moves: gmMoves } = goldenMoves(board);
    //console.log(stage);
    for (const mv of gmMoves) {
        const o = moveAttributesMap.get(mv);
        o.isGoldenMove = true;
    }
    
    return {
        moves,
        pinSkewerMoves,
        forkMoves,
        moveAttributesMap,
        attackedPositions,
        defendedPositions,
        viewedPositions,
        amIBeingChecked,
    };
}
