// notationManager.js

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