// gameState.js

let selectedPiece = null;
let currentTurn = 'W';
let lastMovedPawn = null;
let halfMoveClock = 0;
let positionHistory = {};
let isGameOver = false;
let isModalOpen = false;
let isBoardActive = false;
let playerColor = 'W';
let computerColor = 'B';
let castlingRights = {
  W: { kingSide: true, queenSide: true },
  B: { kingSide: true, queenSide: true },
};
let fullMoveNumber = 1;
let promotionPending = false;
let promotionCallback = null;
let pendingPromotionBox = null;

function generateFEN() {
  let fen = '';

  for (let r = 8; r >= 1; r -= 1) {
    let empty = 0;
    for (let c = 1; c <= 8; c += 1) {
      const box = document.getElementById(`b${r}${c}`);
      const piece = box.dataset.piece;

      if (piece) {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }

        let pieceCode = '';
        if (piece.includes('king')) pieceCode = 'K';
        else if (piece.includes('queen')) pieceCode = 'Q';
        else if (piece.includes('rook')) pieceCode = 'R';
        else if (piece.includes('bishop')) pieceCode = 'B';
        else if (piece.includes('knight')) pieceCode = 'N';
        else if (piece.includes('pawn')) pieceCode = 'P';

        fen += piece.startsWith('B') ? pieceCode.toLowerCase() : pieceCode;
      } else {
        empty += 1;
      }
    }
    if (empty > 0) fen += empty;
    if (r > 1) fen += '/';
  }

  fen += ` ${currentTurn === 'W' ? 'w' : 'b'}`;

  let castlingString = '';
  if (castlingRights.W.kingSide) castlingString += 'K';
  if (castlingRights.W.queenSide) castlingString += 'Q';
  if (castlingRights.B.kingSide) castlingString += 'k';
  if (castlingRights.B.queenSide) castlingString += 'q';
  fen += ` ${castlingString || '-'}`;

  if (lastMovedPawn) {
    const row = parseInt(lastMovedPawn[1], 10);
    const col = parseInt(lastMovedPawn[2], 10);
    let epRow = null;

    if (row === 4) epRow = 3;
    else if (row === 5) epRow = 6;

    if (epRow !== null) {
      const epColChar = String.fromCharCode('a'.charCodeAt(0) + col - 1);
      fen += ` ${epColChar}${epRow}`;
    } else {
      fen += ' -';
    }
  } else {
    fen += ' -';
  }

  fen += ` ${halfMoveClock} ${fullMoveNumber}`;
  return fen.trim();
}

function generatePositionKey() {
  let fen = '';

  for (let r = 8; r >= 1; r -= 1) {
    let empty = 0;
    for (let c = 1; c <= 8; c += 1) {
      const box = document.getElementById(`b${r}${c}`);
      const piece = box.dataset.piece;

      if (piece) {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }

        let pieceCode = '';
        if (piece.includes('king')) pieceCode = 'K';
        else if (piece.includes('queen')) pieceCode = 'Q';
        else if (piece.includes('rook')) pieceCode = 'R';
        else if (piece.includes('bishop')) pieceCode = 'B';
        else if (piece.includes('knight')) pieceCode = 'N';
        else if (piece.includes('pawn')) pieceCode = 'P';

        fen += piece.startsWith('B') ? pieceCode.toLowerCase() : pieceCode;
      } else {
        empty += 1;
      }
    }
    if (empty > 0) fen += empty;
    if (r > 1) fen += '/';
  }

  fen += ` ${currentTurn === 'W' ? 'w' : 'b'}`;

  let castlingString = '';
  if (castlingRights.W.kingSide) castlingString += 'K';
  if (castlingRights.W.queenSide) castlingString += 'Q';
  if (castlingRights.B.kingSide) castlingString += 'k';
  if (castlingRights.B.queenSide) castlingString += 'q';
  fen += ` ${castlingString || '-'}`;

  if (lastMovedPawn) {
    const row = parseInt(lastMovedPawn[1], 10);
    const col = parseInt(lastMovedPawn[2], 10);
    let epRow = null;

    if (row === 4) epRow = 3;
    else if (row === 5) epRow = 6;

    if (epRow !== null) {
      const epColChar = String.fromCharCode('a'.charCodeAt(0) + col - 1);
      fen += ` ${epColChar}${epRow}`;
    } else {
      fen += ' -';
    }
  } else {
    fen += ' -';
  }

  return fen.trim();
}