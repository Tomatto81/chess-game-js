// moveHandler.js

function movePiece(startBox, targetBox) {
  const pieceType = startBox.dataset.piece;
  const originalTargetPiece = targetBox.dataset.piece;
  const isPawnMove = pieceType.includes('pawn');
  let isCapture = !!originalTargetPiece;
  const color = pieceType[0];
  let isCastling = false;
  let isEnPassant = false;
  let promotedPiece = null;

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

  targetBox.dataset.piece = pieceType;
  delete startBox.dataset.piece;

  insertImage();
  
  return { 
    isCapture, 
    isCastling, 
    isEnPassant,
    promotedPiece: null
  };
}

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