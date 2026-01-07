/* =========================================================
   CHESS GAME SCRIPT
   Author : Ammar Shidqi
   Purpose: Manage chess game logic, UI, and rules
========================================================= */

/* =========================================================
   1. BOARD INITIALIZATION & DISPLAY
========================================================= */

// Initialize board from HTML text to data-pieces
function initializeBoard() {
  document.querySelectorAll('.box').forEach((box) => {
    const text = box.innerText.trim();
    if (text.length !== 0) {
      box.dataset.piece = text;
      box.innerHTML = '';
    }
  });
  insertImage();
}

// Display piece images based on data-pieces
function insertImage() {
  document.querySelectorAll('.box').forEach((box) => {
    box.innerHTML = '';
    if (box.dataset.piece) {
      const pieceType = box.dataset.piece;
      const img = document.createElement('img');
      img.src = `images/${pieceType}.png`;
      img.className = 'all-img';
      img.alt = pieceType;
      box.appendChild(img);
      box.style.cursor = 'pointer';
    } else {
      box.style.cursor = 'default';
    }
  });
}

// Color the chessboard (alternating black-white)
function coloring() {
  const boxes = document.querySelectorAll('.box');
  boxes.forEach((box) => {
    const getId = box.id;
    const arr = Array.from(getId);
    arr.shift();
    const aside = eval(arr.pop());
    const aup = eval(arr.shift());
    const a = aside + aup;

    if (a % 2 === 0) {
      box.style.backgroundColor = 'rgb(233 235 239)';
    } else {
      box.style.backgroundColor = 'rgb(125 135 150)';
    }
  });
}

// Add rank (1–8) and file (a–h) notation
function addBoardNotation() {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  for (let r = 1; r <= 8; r += 1) {
    for (let c = 1; c <= 8; c += 1) {
      const box = document.getElementById(`b${r}${c}`);

      // Numbers only in the first column
      if (c === 1) {
        box.setAttribute('data-rank', r);
      } else {
        box.removeAttribute('data-rank');
      }

      // Files only on the first row
      if (r === 1) {
        box.setAttribute('data-file', files[c - 1]);
      } else {
        box.removeAttribute('data-file');
      }
    }
  }
}

/* =========================================================
   2. GLOBAL GAME STATE
========================================================= */

let selectedPiece = null;
let currentTurn = 'W';
let lastMovedPawn = null;
let halfMoveClock = 0;
let positionHistory = {};
let isGameOver = false;
let isModalOpen = false;

let castlingRights = {
  W: { kingSide: true, queenSide: true },
  B: { kingSide: true, queenSide: true },
};

let fullMoveNumber = 1;

/* =========================================================
   3. GAME INITIALIZATION
========================================================= */

coloring();
initializeBoard();
addBoardNotation();

// Record initial position for repetition rule
const initialPositionKey = generatePositionKey();
positionHistory[initialPositionKey] = 1;

/* =========================================================
   4. EVENT LISTENER (CLICK ON BOARD)
========================================================= */

document.querySelectorAll('.box').forEach((box) => {
  box.addEventListener('click', () => {
    if (isGameOver || isModalOpen) return; // Board is locked when game is over / modal active

    const isTargetValid = box.style.backgroundColor === 'greenyellow';

    // Select piece
    if (selectedPiece === null) {
      if (box.dataset.piece && box.dataset.piece.startsWith(currentTurn)) {
        selectedPiece = box;
        highlightValidMoves(selectedPiece);
      }
    }
    // Move piece
    else if (isTargetValid) {
      const startId = selectedPiece.id;
      const targetId = box.id;
      const pieceType = selectedPiece.dataset.piece;

      const moveStatus = movePiece(selectedPiece, box);
      const promotedPiece = checkPawnPromotion(box);

      const moveNotation = generateSAN(
        startId,
        targetId,
        pieceType,
        moveStatus.isCapture,
        moveStatus.isCastling,
        promotedPiece,
      );
      updateMoveLog(moveNotation);

      // Switch turn
      currentTurn = currentTurn === 'W' ? 'B' : 'W';
      document.getElementById('tog').innerText = currentTurn === 'W'
        ? "White's Turn"
        : "Black's Turn";

      if (currentTurn === 'W') {
        fullMoveNumber += 1;
      }

      selectedPiece = null;
      clearHighlights();

      // Save position for repetition rule
      const positionKey = generatePositionKey();
      positionHistory[positionKey] = (positionHistory[positionKey] || 0) + 1;

      checkForCheckOrCheckmate(positionKey);
    }
    // Click on invalid square
    else {
      selectedPiece = null;
      clearHighlights();
    }
  });
});

/* =========================================================
   5. FEN & POSITION KEY GENERATION
========================================================= */

// Generate full FEN
function generateFEN() {
  let fen = '';

  // 1. Piece positions
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

        if (piece.startsWith('B')) fen += pieceCode.toLowerCase();
        else fen += pieceCode;
      } else {
        empty += 1;
      }
    }
    if (empty > 0) fen += empty;
    if (r > 1) fen += '/';
  }

  // 2. Turn
  fen += ` ${currentTurn === 'W' ? 'w' : 'b'}`;

  // 3. Castling Rights
  let castlingString = '';
  if (castlingRights.W.kingSide) castlingString += 'K';
  if (castlingRights.W.queenSide) castlingString += 'Q';
  if (castlingRights.B.kingSide) castlingString += 'k';
  if (castlingRights.B.queenSide) castlingString += 'q';
  fen += ` ${castlingString || '-'}`;

  // 4. En Passant
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

  // 5. Clocks
  fen += ` ${halfMoveClock} ${fullMoveNumber}`;

  return fen.trim();
}

// Generate position key (for repetition, without clocks)
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

        if (piece.startsWith('B')) fen += pieceCode.toLowerCase();
        else fen += pieceCode;
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

/* =========================================================
   6. MOVE EXECUTION LOGIC
========================================================= */

function movePiece(startBox, targetBox) {
  const pieceType = startBox.dataset.piece;
  const originalTargetPiece = targetBox.dataset.piece;
  const isPawnMove = pieceType.includes('pawn');
  let isCapture = !!originalTargetPiece;
  const color = pieceType[0];
  let isCastling = false;
  let isEnPassant = false;

  if (isPawnMove || isCapture) halfMoveClock = 0;
  else halfMoveClock += 1;

  // Castling: move the rook
  if (pieceType.includes('king')) {
    const startCol = parseInt(startBox.id[2], 10);
    const targetCol = parseInt(targetBox.id[2], 10);
    const row = startBox.id[1];

    if (Math.abs(targetCol - startCol) === 2) {
      isCastling = true;

      if (targetCol - startCol === 2) {
        // Kingside
        const rookStart = document.getElementById(`b${row}8`);
        const rookTarget = document.getElementById(`b${row}6`);
        rookTarget.dataset.piece = rookStart.dataset.piece;
        delete rookStart.dataset.piece;
      } else if (startCol - targetCol === 2) {
        // Queenside
        const rookStart = document.getElementById(`b${row}1`);
        const rookTarget = document.getElementById(`b${row}4`);
        rookTarget.dataset.piece = rookStart.dataset.piece;
        delete rookStart.dataset.piece;
      }
    }
  }

  // Update castling rights
  if (pieceType.includes('king')) {
    castlingRights[color].kingSide = false;
    castlingRights[color].queenSide = false;
  }
  if (pieceType.includes('rook')) {
    const row = color === 'W' ? 1 : 8;
    if (startBox.id === `b${row}8`) castlingRights[color].kingSide = false;
    if (startBox.id === `b${row}1`) castlingRights[color].queenSide = false;
  }
  if (isCapture && originalTargetPiece && originalTargetPiece.includes('rook')) {
    const oppColor = color === 'W' ? 'B' : 'W';
    const oppRow = oppColor === 'W' ? 1 : 8;
    if (targetBox.id === `b${oppRow}8`) castlingRights[oppColor].kingSide = false;
    if (targetBox.id === `b${oppRow}1`) castlingRights[oppColor].queenSide = false;
  }

  // Move piece
  targetBox.dataset.piece = pieceType;
  delete startBox.dataset.piece;

  // Pawn logic (double move & en passant)
  let isDoubleMove = false;
  if (pieceType.includes('pawn')) {
    const startRow = parseInt(startBox.id[1], 10);
    const targetRow = parseInt(targetBox.id[1], 10);
    const startCol = parseInt(startBox.id[2], 10);
    const targetCol = parseInt(targetBox.id[2], 10);

    if (Math.abs(targetRow - startRow) === 2) {
      lastMovedPawn = targetBox.id;
      isDoubleMove = true;
    } else if (Math.abs(startCol - targetCol) === 1 && !originalTargetPiece) {
      const capturedRow = pieceType.startsWith('W') ? targetRow - 1 : targetRow + 1;
      const capturedId = `b${capturedRow}${targetCol}`;
      const capturedBox = document.getElementById(capturedId);

      if (capturedBox && capturedBox.id === lastMovedPawn) {
        delete capturedBox.dataset.piece;
        isCapture = true;
        isEnPassant = true;
      }
    }
  }

  if (!isDoubleMove) lastMovedPawn = null;

  insertImage();
  return { isCapture, isCastling, isEnPassant };
}

/* =========================================================
   7. UI / MODAL HANDLING
========================================================= */

function showModal(message, buttonsHTML) {
  const modal = document.getElementById('gameModal');
  const modalText = document.getElementById('modalText');
  const modalButtons = document.getElementById('modalButtons');

  modalText.innerText = message;
  modalButtons.innerHTML = buttonsHTML;
  modal.classList.remove('hidden');
  isModalOpen = true;
}

function closeModal() {
  const modal = document.getElementById('gameModal');
  modal.classList.add('hidden');
  isModalOpen = false;
}

function endGame(message) {
  isGameOver = true;
  document.getElementById('checkWarning').innerText = message;
  const buttons = '<button class="btn-primary" onclick="location.reload()">New Game</button>';
  showModal(message, buttons);
}

function showThreefoldChoice() {
  const buttons = `
      <button class="btn-primary" onclick="endGame('Game Drawn by Agreement (Threefold)')">Accept Draw</button>
      <button class="btn-neutral" onclick="closeModal()">Continue Playing</button>
   `;
  if (document.getElementById('gameModal').classList.contains('hidden')) {
    showModal('Threefold Repetition Detected! Claim Draw?', buttons);
  }
}

/* =========================================================
   8. CHECK / CHECKMATE / DRAW LOGIC
========================================================= */

function checkForCheckOrCheckmate(fenToCheck) {
  const myColor = currentTurn;
  const opponentColor = myColor === 'W' ? 'B' : 'W';
  const myKingPos = getKingPosition(myColor);
  const warning = document.getElementById('checkWarning');

  warning.innerText = '';

  // Fivefold repetition
  if (positionHistory[fenToCheck] >= 5) {
    endGame('Draw by Fivefold Repetition!');
    return;
  }

  // 50-move rule
  if (halfMoveClock >= 100) {
    endGame('Draw by 50-Move Rule!');
    return;
  }

  // Threefold repetition (optional draw)
  if (positionHistory[fenToCheck] >= 3 && !isModalOpen) {
    showThreefoldChoice();
  }

  const isMyKingChecked = isPositionUnderAttack(myKingPos, opponentColor);
  let hasLegalMoves = false;

  if (isMyKingChecked) {
    if (!hasLegalMoves) {
      updateMoveLog('#', false);
      endGame(`CHECKMATE! ${opponentColor === 'W' ? 'White' : 'Black'} Wins!`);
    } else {
      updateMoveLog('+', false);
      warning.innerText = `${myColor === 'W' ? 'White' : 'Black'} is in Check!`;
    }
  } else {
    hasLegalMoves = false;
    for (let i = 1; i <= 8; i += 1) {
      for (let j = 1; j <= 8; j += 1) {
        const box = document.getElementById(`b${i}${j}`);
        if (box.dataset.piece && box.dataset.piece.startsWith(myColor)) {
          const moves = getValidMoves(box.dataset.piece, box.id, true);
          if (moves.length > 0) {
            hasLegalMoves = true;
            break;
          }
        }
      }
      if (hasLegalMoves) break;
    }
    if (!hasLegalMoves) {
      endGame('Stalemate! Draw.');
    }
  }
}

/* =========================================================
   9. HIGHLIGHT & HELPER FUNCTIONS
========================================================= */

function highlightValidMoves(pieceBox) {
  clearHighlights();
  pieceBox.style.backgroundColor = 'pink';

  const pieceType = pieceBox.dataset.piece;
  const currentPosition = pieceBox.id;
  const validMoves = getValidMoves(pieceType, currentPosition, true);

  validMoves.forEach((moveId) => {
    const targetBox = document.getElementById(moveId);
    if (targetBox) {
      targetBox.style.backgroundColor = 'greenyellow';
    }
  });
}

function clearHighlights() {
  coloring();
}

function getKingPosition(color) {
  for (let i = 1; i <= 8; i += 1) {
    for (let j = 1; j <= 8; j += 1) {
      const box = document.getElementById(`b${i}${j}`);
      if (box.dataset.piece === `${color}king`) {
        return `b${i}${j}`;
      }
    }
  }
  return null;
}

// Check king safety
function isPositionUnderAttack(positionId, attackerColor) {
  for (let i = 1; i <= 8; i += 1) {
    for (let j = 1; j <= 8; j += 1) {
      const box = document.getElementById(`b${i}${j}`);
      if (box.dataset.piece && box.dataset.piece.startsWith(attackerColor)) {
        const moves = getValidMoves(box.dataset.piece, box.id, false);
        if (moves.includes(positionId)) return true;
      }
    }
  }
  return false;
}

/* =========================================================
   10. PAWN PROMOTION
========================================================= */

function checkPawnPromotion(box) {
  const piece = box.dataset.piece;
  const row = parseInt(box.id[1], 10);
  let promotedPieceType = null;

  if ((piece === 'Wpawn' && row === 8) || (piece === 'Bpawn' && row === 1)) {
    const newType = prompt('Promote to (queen, rook, bishop, knight):', 'queen') || 'queen';
    const color = piece[0];
    const valid = ['queen', 'rook', 'bishop', 'knight'].includes(newType.toLowerCase())
      ? newType.toLowerCase()
      : 'queen';

    promotedPieceType = color + valid;
    box.dataset.piece = promotedPieceType;

    insertImage();
  }

  return promotedPieceType;
}

/* =========================================================
   11. MOVE GENERATION (RULE ENGINE)
========================================================= */

function getValidMoves(pieceType, currentPosition, checkSafety = false) {
  let moves = [];
  const row = parseInt(currentPosition[1], 10);
  const col = parseInt(currentPosition[2], 10);
  const color = pieceType[0];
  const opponent = color === 'W' ? 'B' : 'W';

  const isOccupied = (r, c) => {
    const box = document.getElementById(`b${r}${c}`);
    return box && box.dataset.piece;
  };
  const isOpponent = (r, c) => {
    const box = document.getElementById(`b${r}${c}`);
    return box && box.dataset.piece && box.dataset.piece.startsWith(opponent);
  };

  // Pawn
  if (pieceType.includes('pawn')) {
    const direction = color === 'W' ? 1 : -1;
    const startRow = color === 'W' ? 2 : 7;

    if (!isOccupied(row + direction, col)) {
      moves.push(`b${row + direction}${col}`);
      if (row === startRow && !isOccupied(row + direction * 2, col)) {
        moves.push(`b${row + direction * 2}${col}`);
      }
    }
    [[direction, -1], [direction, 1]].forEach(([rOff, cOff]) => {
      const targetR = row + rOff;
      const targetC = col + cOff;
      if (isOpponent(targetR, targetC)) {
        moves.push(`b${targetR}${targetC}`);
      }
      if (!isOccupied(targetR, targetC) && lastMovedPawn) {
        const adjacentBoxId = `b${row}${targetC}`;
        if (lastMovedPawn === adjacentBoxId) {
          moves.push(`b${targetR}${targetC}`);
        }
      }
    });
  }

  // Knight
  else if (pieceType.includes('knight')) {
    const offsets = [
      [2, 1],
      [2, -1],
      [-2, 1],
      [-2, -1],
      [1, 2],
      [1, -2],
      [-1, 2],
      [-1, -2],
    ];
    offsets.forEach(([rOff, cOff]) => {
      const r = row + rOff;
      const c = col + cOff;
      if (r >= 1 && r <= 8 && c >= 1 && c <= 8) {
        const box = document.getElementById(`b${r}${c}`);
        if (!box.dataset.piece || box.dataset.piece.startsWith(opponent)) {
          moves.push(`b${r}${c}`);
        }
      }
    });
  }

  // King (normal + castling)
  else if (pieceType.includes('king')) {
    const offsets = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];
    offsets.forEach(([rOff, cOff]) => {
      const r = row + rOff;
      const c = col + cOff;
      if (r >= 1 && r <= 8 && c >= 1 && c <= 8) {
        const box = document.getElementById(`b${r}${c}`);
        if (!box.dataset.piece || box.dataset.piece.startsWith(opponent)) {
          moves.push(`b${r}${c}`);
        }
      }
    });

    if (checkSafety) {
      const myKingPos = getKingPosition(color);
      if (!isPositionUnderAttack(myKingPos, opponent)) {
        const r = color === 'W' ? 1 : 8;

        if (castlingRights[color].kingSide) {
          if (!isOccupied(r, 6) && !isOccupied(r, 7)) {
            if (!isPositionUnderAttack(`b${r}6`, opponent)
              && !isPositionUnderAttack(`b${r}7`, opponent)) {
              moves.push(`b${r}7`);
            }
          }
        }
        if (castlingRights[color].queenSide) {
          if (!isOccupied(r, 2) && !isOccupied(r, 3) && !isOccupied(r, 4)) {
            if (!isPositionUnderAttack(`b${r}3`, opponent)
              && !isPositionUnderAttack(`b${r}4`, opponent)) {
              moves.push(`b${r}3`);
            }
          }
        }
      }
    }
  }

  // Rook, Bishop, Queen (sliding pieces)
  else {
    const directions = [];
    if (pieceType.includes('rook') || pieceType.includes('queen')) {
      directions.push([1, 0], [-1, 0], [0, 1], [0, -1]);
    }
    if (pieceType.includes('bishop') || pieceType.includes('queen')) {
      directions.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
    }

    directions.forEach(([dRow, dCol]) => {
      let r = row + dRow;
      let c = col + dCol;
      while (r >= 1 && r <= 8 && c >= 1 && c <= 8) {
        const box = document.getElementById(`b${r}${c}`);
        if (box.dataset.piece) {
          if (box.dataset.piece.startsWith(opponent)) {
            moves.push(`b${r}${c}`);
          }
          break;
        }
        moves.push(`b${r}${c}`);
        r += dRow;
        c += dCol;
      }
    });
  }

  // Check king safety
  if (checkSafety) {
    const legalMoves = moves.filter((moveId) => {
      const startBox = document.getElementById(currentPosition);
      const targetBox = document.getElementById(moveId);

      const originalStartPiece = startBox.dataset.piece;
      const originalTargetPiece = targetBox.dataset.piece;

      targetBox.dataset.piece = originalStartPiece;
      delete startBox.dataset.piece;

      const myKingPos = getKingPosition(color);
      const currentKingPos = originalStartPiece.includes('king') ? moveId : myKingPos;
      const isCheck = isPositionUnderAttack(currentKingPos, opponent);

      startBox.dataset.piece = originalStartPiece;
      if (originalTargetPiece) {
        targetBox.dataset.piece = originalTargetPiece;
      } else {
        delete targetBox.dataset.piece;
      }

      return !isCheck;
    });
    return legalMoves;
  }

  return moves;
}

/* =========================================================
   12. SAN NOTATION & MOVE LOG
========================================================= */

function getPieceSymbol(pieceType) {
  if (pieceType.includes('king')) return 'K';
  if (pieceType.includes('queen')) return 'Q';
  if (pieceType.includes('rook')) return 'R';
  if (pieceType.includes('bishop')) return 'B';
  if (pieceType.includes('knight')) return 'N';
  return '';
}

function idToNotation(boxId) {
  const row = parseInt(boxId[1], 10);
  const col = parseInt(boxId[2], 10);
  const file = String.fromCharCode('a'.charCodeAt(0) + col - 1);
  return `${file}${row}`;
}

function generateSAN(startId, targetId, pieceType, isCapture, isCastling, promotedType = null) {
  const symbol = getPieceSymbol(pieceType);
  const targetNotation = idToNotation(targetId);
  let san = '';

  if (isCastling) {
    const startCol = parseInt(startId[2], 10);
    const targetCol = parseInt(targetId[2], 10);
    san = targetCol > startCol ? 'O-O' : 'O-O-O';
  } else {
    san += symbol;

    if (isCapture) {
      if (symbol === '') {
        const startFile = idToNotation(startId)[0];
        san += startFile;
      }
      san += 'x';
    }

    san += targetNotation;

    if (promotedType) {
      san += `=${getPieceSymbol(promotedType)}`;
    }
  }

  return san;
}

function updateMoveLog(moveNotation, isFinal = true) {
  const movesList = document.getElementById('movesList');
  const isWhiteMove = currentTurn === 'W';
  const currentMoveNumber = fullMoveNumber;

  if (isFinal) {
    if (isWhiteMove) {
      const listItem = document.createElement('li');
      listItem.innerText = moveNotation;
      listItem.dataset.fullmove = currentMoveNumber;
      movesList.appendChild(listItem);
    } else {
      const listItem = Array.from(movesList.children)
        .find((li) => parseInt(li.dataset.fullmove, 10) === currentMoveNumber);
      if (listItem) {
        listItem.innerText += ` ${moveNotation}`;
      }
    }
  } else {
    const targetFullMove = currentMoveNumber;
    const listItemToUpdate = Array.from(movesList.children)
      .find((li) => parseInt(li.dataset.fullmove, 10) === targetFullMove);

    if (listItemToUpdate) {
      const currentText = listItemToUpdate.innerText.trim();
      const moves = currentText.split(' ');
      const lastMove = moves[moves.length - 1];
      const updatedLastMove = lastMove.replace(/[\+#]/g, '') + moveNotation;
      moves[moves.length - 1] = updatedLastMove;
      listItemToUpdate.innerText = moves.join(' ');
    }
  }

  movesList.scrollTop = movesList.scrollHeight;
}

/* =========================================================
   13. RESET BUTTON
========================================================= */

document.getElementById('reset-btn').addEventListener('click', () => {
  location.reload();
});
