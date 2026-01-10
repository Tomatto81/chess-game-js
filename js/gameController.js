// gameController.js

async function handleBoxClick() {
  if (!isBoardActive || isGameOver || isModalOpen || promotionPending || currentTurn !== playerColor) return;

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
    const promotedPiece = await checkPawnPromotion(this);
    moveStatus.promotedPiece = promotedPiece;
    
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

function startNewGame() {
  document.getElementById('colorModal').classList.remove('hidden');
  document.getElementById('gameModal').classList.add('hidden');
  document.getElementById('promotionModal').classList.add('hidden');
  document.getElementById('movesList').innerHTML = '';
  document.getElementById('checkWarning').innerText = '';
  isGameOver = false;
  isBoardActive = false;
  promotionPending = false;
  promotionCallback = null;
  pendingPromotionBox = null;
  disableBoard();
  document.getElementById('tog').innerText = 'Choose your color';
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

function updateTurnDisplay() {
  const turnText =
    currentTurn === playerColor
      ? `Your Turn (${playerColor === 'W' ? 'White' : 'Black'})`
      : 'Computer Thinking...';
  document.getElementById('tog').innerText = turnText;
}

async function makeComputerMove() {
  if (isGameOver || promotionPending || currentTurn !== computerColor) return;

  const move = getComputerMove();
  if (move) {
    const startBox = document.getElementById(move.from);
    const targetBox = document.getElementById(move.to);

    if (startBox && targetBox) {
      const pieceType = startBox.dataset.piece;
      const moveStatus = movePiece(startBox, targetBox);
      const promotedPiece = checkComputerPawnPromotion(targetBox);
      moveStatus.promotedPiece = promotedPiece;

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