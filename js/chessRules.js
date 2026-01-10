// chessRules.js

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

function checkPawnPromotion(box) {
  const piece = box.dataset.piece;
  const row = parseInt(box.id[1], 10);
  let promotedPieceType = null;

  if ((piece === 'Wpawn' && row === 8) || (piece === 'Bpawn' && row === 1)) {
    pendingPromotionBox = box;
    
    disableBoard();
    
    return new Promise((resolve) => {
      const color = piece[0];
      
      showPromotionModal(color, (chosenPiece) => {
        promotedPieceType = color + chosenPiece;
        box.dataset.piece = promotedPieceType;
        insertImage();
        
        enableBoard();
        resolve(promotedPieceType);
      });
    });
  }
  
  return Promise.resolve(promotedPieceType);
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