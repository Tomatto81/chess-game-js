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

document.addEventListener('DOMContentLoaded', () => {
  coloring();
  initializeBoard();
  createNotations();
  disableBoard();

  const initialPositionKey = generatePositionKey();
  positionHistory[initialPositionKey] = 1;

  setupEventListeners();
});

function setupEventListeners() {
  document.querySelectorAll('.box').forEach((box) => {
    box.addEventListener('click', handleBoxClick);
  });

  document.getElementById('reset-btn').addEventListener('click', startNewGame);
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('chooseWhite').addEventListener('click', () => chooseColor('W'));
  document.getElementById('chooseBlack').addEventListener('click', () => chooseColor('B'));
  document.getElementById('chooseRandom').addEventListener('click', chooseRandomColor);

  document.getElementById('gameModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('gameModal')) {
      closeModal();
    }
  });
}

function handleBoxClick() {
  if (!isBoardActive || isGameOver || isModalOpen || currentTurn !== playerColor) return;

  const isTargetValid = this.style.backgroundColor === 'greenyellow';

  if (!selectedPiece) {
    if (this.dataset.piece && this.dataset.piece.startsWith(currentTurn)) {
      selectedPiece = this;
      highlightValidMoves(selectedPiece);
    }
  } else if (isTargetValid) {
    const startId = selectedPiece.id;
    const targetId = this.id;
    const pieceType = selectedPiece.dataset.piece;

    const moveStatus = movePiece(selectedPiece, this);
    const promotedPiece = checkPawnPromotion(this);

    const moveNotation = generateSAN(
      startId,
      targetId,
      pieceType,
      moveStatus.isCapture,
      moveStatus.isCastling,
      promotedPiece
    );
    updateMoveLog(moveNotation);

    currentTurn = currentTurn === 'W' ? 'B' : 'W';
    updateTurnDisplay();

    if (currentTurn === 'W') fullMoveNumber += 1;

    selectedPiece = null;
    clearHighlights();

    const positionKey = generatePositionKey();
    positionHistory[positionKey] = (positionHistory[positionKey] || 0) + 1;

    const gameEnded = checkForCheckOrCheckmate(positionKey);

    if (!gameEnded && currentTurn === computerColor) {
      setTimeout(makeComputerMove, 500);
    }
  } else {
    selectedPiece = null;
    clearHighlights();
  }
}

function chooseColor(color) {
  playerColor = color;
  computerColor = color === 'W' ? 'B' : 'W';
  document.getElementById('colorModal').classList.add('hidden');
  initializeGame();
}

function chooseRandomColor() {
  const colors = ['W', 'B'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  chooseColor(randomColor);
}

function startNewGame() {
  document.getElementById('colorModal').classList.remove('hidden');
  document.getElementById('gameModal').classList.add('hidden');
  document.getElementById('movesList').innerHTML = '';
  document.getElementById('checkWarning').innerText = '';
  isGameOver = false;
  isBoardActive = false;
  disableBoard();
  document.getElementById('tog').innerText = 'Choose your color';
}

function initializeGame() {
  resetBoard();

  if (playerColor === 'B') {
    flipBoard();
    currentTurn = 'W';
    updateTurnDisplay();
    setTimeout(makeComputerMove, 500);
  } else {
    unflipBoard();
    currentTurn = 'W';
    updateTurnDisplay();
  }

  isBoardActive = true;
  enableBoard();
}

function resetBoard() {
  const pieces = {
    b81: 'Brook', b82: 'Bknight', b83: 'Bbishop', b84: 'Bqueen',
    b85: 'Bking', b86: 'Bbishop', b87: 'Bknight', b88: 'Brook',
    b71: 'Bpawn', b72: 'Bpawn', b73: 'Bpawn', b74: 'Bpawn',
    b75: 'Bpawn', b76: 'Bpawn', b77: 'Bpawn', b78: 'Bpawn',
    b61: '', b62: '', b63: '', b64: '', b65: '', b66: '', b67: '', b68: '',
    b51: '', b52: '', b53: '', b54: '', b55: '', b56: '', b57: '', b58: '',
    b41: '', b42: '', b43: '', b44: '', b45: '', b46: '', b47: '', b48: '',
    b31: '', b32: '', b33: '', b34: '', b35: '', b36: '', b37: '', b38: '',
    b21: 'Wpawn', b22: 'Wpawn', b23: 'Wpawn', b24: 'Wpawn',
    b25: 'Wpawn', b26: 'Wpawn', b27: 'Wpawn', b28: 'Wpawn',
    b11: 'Wrook', b12: 'Wknight', b13: 'Wbishop', b14: 'Wqueen',
    b15: 'Wking', b16: 'Wbishop', b17: 'Wknight', b18: 'Wrook',
  };

  Object.keys(pieces).forEach((id) => {
    const box = document.getElementById(id);
    if (pieces[id]) {
      box.dataset.piece = pieces[id];
    } else {
      delete box.dataset.piece;
    }
  });

  insertImage();
  coloring();
  createNotations();

  currentTurn = 'W';
  lastMovedPawn = null;
  halfMoveClock = 0;
  fullMoveNumber = 1;
  positionHistory = {};
  castlingRights = {
    W: { kingSide: true, queenSide: true },
    B: { kingSide: true, queenSide: true },
  };
  selectedPiece = null;
  clearHighlights();

  const initialPositionKey = generatePositionKey();
  positionHistory[initialPositionKey] = 1;
}

function flipBoard() {
  const board = document.getElementById('chessBoard');
  const container = document.getElementById('chessBoardContainer');

  board.classList.add('flipped');
  container.classList.add('flipped');

  updateNotationsForPlayer();
}

function unflipBoard() {
  const board = document.getElementById('chessBoard');
  const container = document.getElementById('chessBoardContainer');

  board.classList.remove('flipped');
  container.classList.remove('flipped');

  updateNotationsForPlayer();
}

function createNotations() {
  const rankNotation = document.getElementById('rankNotation');
  const fileNotation = document.getElementById('fileNotation');

  rankNotation.innerHTML = '';
  fileNotation.innerHTML = '';

  for (let i = 8; i >= 1; i -= 1) {
    const rankItem = document.createElement('div');
    rankItem.className = 'notation-item';
    rankItem.textContent = i.toString();
    rankNotation.appendChild(rankItem);
  }

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  files.forEach((file) => {
    const fileItem = document.createElement('div');
    fileItem.className = 'notation-item';
    fileItem.textContent = file;
    fileNotation.appendChild(fileItem);
  });
}

function updateNotationsForPlayer() {
  const board = document.getElementById('chessBoard');
  const container = document.getElementById('chessBoardContainer');
  const isFlipped = board.classList.contains('flipped');

  if (isFlipped) {
    container.classList.add('flipped');
  } else {
    container.classList.remove('flipped');
  }

  const rankItems = document.querySelectorAll('#rankNotation .notation-item');
  const fileItems = document.querySelectorAll('#fileNotation .notation-item');

  if (isFlipped) {
    rankItems.forEach((item, index) => {
      item.textContent = (index + 1).toString();
    });

    const filesReversed = ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
    fileItems.forEach((item, index) => {
      item.textContent = filesReversed[index];
    });
  } else {
    rankItems.forEach((item, index) => {
      item.textContent = (8 - index).toString();
    });

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    fileItems.forEach((item, index) => {
      item.textContent = files[index];
    });
  }
}

function disableBoard() {
  document.querySelectorAll('.box').forEach((box) => {
    box.classList.add('disabled');
  });
}

function enableBoard() {
  document.querySelectorAll('.box').forEach((box) => {
    box.classList.remove('disabled');
  });
}

function updateTurnDisplay() {
  const turnText =
    currentTurn === playerColor
      ? `Your Turn (${playerColor === 'W' ? 'White' : 'Black'})`
      : 'Computer Thinking...';
  document.getElementById('tog').innerText = turnText;
}

function makeComputerMove() {
  if (isGameOver || currentTurn !== computerColor) return;

  const move = getComputerMove();
  if (move) {
    const startBox = document.getElementById(move.from);
    const targetBox = document.getElementById(move.to);

    if (startBox && targetBox) {
      const pieceType = startBox.dataset.piece;
      const moveStatus = movePiece(startBox, targetBox);
      const promotedPiece = checkComputerPawnPromotion(targetBox);

      const moveNotation = generateSAN(
        move.from,
        move.to,
        pieceType,
        moveStatus.isCapture,
        moveStatus.isCastling,
        promotedPiece
      );
      updateMoveLog(moveNotation);

      currentTurn = currentTurn === 'W' ? 'B' : 'W';
      updateTurnDisplay();

      if (currentTurn === 'W') fullMoveNumber += 1;

      const positionKey = generatePositionKey();
      positionHistory[positionKey] = (positionHistory[positionKey] || 0) + 1;

      checkForCheckOrCheckmate(positionKey);
    }
  }
}

function checkComputerPawnPromotion(box) {
  const piece = box.dataset.piece;
  const row = parseInt(box.id[1], 10);
  let promotedPieceType = null;

  if ((piece === 'Wpawn' && row === 8) || (piece === 'Bpawn' && row === 1)) {
    const color = piece[0];
    promotedPieceType = color + 'queen';
    box.dataset.piece = promotedPieceType;
    insertImage();
  }

  return promotedPieceType;
}

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

function coloring() {
  document.querySelectorAll('.box').forEach((box) => {
    const row = parseInt(box.id[1], 10);
    const col = parseInt(box.id[2], 10);
    box.style.backgroundColor =
      (row + col) % 2 === 0 ? 'rgb(125 135 150)' : 'rgb(233 235 239)';
  });
}

/* =========================
   FEN / POSITION KEY
========================= */

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

/* =========================
   MOVE EXECUTION
========================= */

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

  if (pieceType.includes('king')) {
    const startCol = parseInt(startBox.id[2], 10);
    const targetCol = parseInt(targetBox.id[2], 10);
    const row = startBox.id[1];

    if (Math.abs(targetCol - startCol) === 2) {
      isCastling = true;

      if (targetCol - startCol === 2) {
        const rookStart = document.getElementById(`b${row}8`);
        const rookTarget = document.getElementById(`b${row}6`);
        rookTarget.dataset.piece = rookStart.dataset.piece;
        delete rookStart.dataset.piece;
      } else {
        const rookStart = document.getElementById(`b${row}1`);
        const rookTarget = document.getElementById(`b${row}4`);
        rookTarget.dataset.piece = rookStart.dataset.piece;
        delete rookStart.dataset.piece;
      }
    }
  }

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

  targetBox.dataset.piece = pieceType;
  delete startBox.dataset.piece;

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

/* =========================
   MODAL & GAME END
========================= */

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
  document.getElementById('gameModal').classList.add('hidden');
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

/* =========================
   CHECK / CHECKMATE
========================= */

function checkForCheckOrCheckmate(fenToCheck) {
  const myColor = currentTurn;
  const opponentColor = myColor === 'W' ? 'B' : 'W';
  const myKingPos = getKingPosition(myColor);
  const warning = document.getElementById('checkWarning');

  warning.innerText = '';

  if (positionHistory[fenToCheck] >= 5) {
    endGame('Draw by Fivefold Repetition!');
    return true;
  }

  if (halfMoveClock >= 100) {
    endGame('Draw by 50-Move Rule!');
    return true;
  }

  if (positionHistory[fenToCheck] >= 3 && !isModalOpen) {
    showThreefoldChoice();
    return false;
  }

  let hasLegalMoves = false;

  for (let r = 1; r <= 8; r += 1) {
    for (let c = 1; c <= 8; c += 1) {
      const box = document.getElementById(`b${r}${c}`);
      if (box.dataset.piece && box.dataset.piece.startsWith(myColor)) {
        const moves = getValidMoves(box.dataset.piece, box.id, true);
        if (moves.length > 0) {
          hasLegalMoves = true;
          r = 9;
          break;
        }
      }
    }
  }

  const isMyKingChecked = isPositionUnderAttack(myKingPos, opponentColor);

  if (isMyKingChecked) {
    if (!hasLegalMoves) {
      updateMoveLog('#', false);
      const winner = opponentColor === 'W' ? 'White' : 'Black';
      endGame(`CHECKMATE! ${winner} Wins!`);
      return true;
    }
    updateMoveLog('+', false);
    warning.innerText = `${myColor === 'W' ? 'White' : 'Black'} is in Check!`;
  } else if (!hasLegalMoves) {
    endGame('Stalemate! Draw.');
    return true;
  }

  return false;
}

/* =========================
   MOVE HIGHLIGHTING
========================= */

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

/* =========================
   ATTACK & KING POSITION
========================= */

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

/* =========================
   PROMOTION
========================= */

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

/* =========================
   MOVE GENERATION
========================= */

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
  } else if (pieceType.includes('knight')) {
    const offsets = [
      [2, 1], [2, -1], [-2, 1], [-2, -1],
      [1, 2], [1, -2], [-1, 2], [-1, -2],
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
  } else if (pieceType.includes('king')) {
    const offsets = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [1, -1], [-1, 1], [-1, -1],
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
            if (
              !isPositionUnderAttack(`b${r}6`, opponent) &&
              !isPositionUnderAttack(`b${r}7`, opponent)
            ) {
              moves.push(`b${r}7`);
            }
          }
        }

        if (castlingRights[color].queenSide) {
          if (!isOccupied(r, 2) && !isOccupied(r, 3) && !isOccupied(r, 4)) {
            if (
              !isPositionUnderAttack(`b${r}3`, opponent) &&
              !isPositionUnderAttack(`b${r}4`, opponent)
            ) {
              moves.push(`b${r}3`);
            }
          }
        }
      }
    }
  } else {
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

/* =========================
   SAN NOTATION
========================= */

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

/* =========================
   MOVE LOG
========================= */

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
      const listItem = Array.from(movesList.children).find(
        (li) => parseInt(li.dataset.fullmove, 10) === currentMoveNumber
      );
      if (listItem) {
        listItem.innerText += ` ${moveNotation}`;
      }
    }
  } else {
    const targetFullMove = currentMoveNumber;
    const listItemToUpdate = Array.from(movesList.children).find(
      (li) => parseInt(li.dataset.fullmove, 10) === targetFullMove
    );

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
