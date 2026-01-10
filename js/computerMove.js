function getComputerMove() {
  const color = computerColor;
  const opponent = color === 'W' ? 'B' : 'W';
  const allMoves = [];

  for (let r = 1; r <= 8; r++) {
    for (let c = 1; c <= 8; c++) {
      const boxId = `b${r}${c}`;
      const box = document.getElementById(boxId);

      if (box && box.dataset.piece && box.dataset.piece.startsWith(color)) {
        const pieceType = box.dataset.piece;
        const moves = getValidMoves(pieceType, boxId, true);

        moves.forEach((moveId) => {
          const targetBox = document.getElementById(moveId);
          if (targetBox) {
            allMoves.push({
              from: boxId,
              to: moveId,
              piece: pieceType,
              targetPiece: targetBox.dataset.piece,
            });
          }
        });
      }
    }
  }

  if (allMoves.length === 0) return null;

  const captures = allMoves.filter((move) => move.targetPiece);
  const checks = [];

  for (const move of allMoves) {
    const startBox = document.getElementById(move.from);
    const targetBox = document.getElementById(move.to);

    if (!startBox || !targetBox) continue;

    const originalStartPiece = startBox.dataset.piece;
    const originalTargetPiece = targetBox.dataset.piece;

    targetBox.dataset.piece = originalStartPiece;
    delete startBox.dataset.piece;

    const opponentKingPos = getKingPosition(opponent);
    if (opponentKingPos && isPositionUnderAttack(opponentKingPos, color)) {
      checks.push(move);
    }

    startBox.dataset.piece = originalStartPiece;
    if (originalTargetPiece) {
      targetBox.dataset.piece = originalTargetPiece;
    } else {
      delete targetBox.dataset.piece;
    }
  }

  let selectedMoves;

  if (checks.length > 0) {
    selectedMoves = checks;
  } else if (captures.length > 0) {
    selectedMoves = captures;
  } else {
    selectedMoves = allMoves;
  }

  if (selectedMoves.length === 0) {
    selectedMoves = allMoves;
  }

  const randomIndex = Math.floor(Math.random() * selectedMoves.length);
  return selectedMoves[randomIndex];
}
