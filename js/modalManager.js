// modalManager.js

function showModal(message, buttonsHTML) {
  const modal = document.getElementById('gameModal');
  const modalText = document.getElementById('modalText');
  const modalButtons = document.getElementById('modalButtons');

  modalText.innerText = message;
  modalButtons.innerHTML = buttonsHTML;
  modal.classList.remove('hidden');
  isModalOpen = true;
}

function showPromotionModal(pieceColor, callback) {
  const modal = document.getElementById('promotionModal');
  const optionsContainer = document.getElementById('promotionOptions');
  const errorEl = document.getElementById('promotionError');
  
  errorEl.innerText = '';
  optionsContainer.innerHTML = '';
  promotionCallback = callback;
  promotionPending = true;
  isModalOpen = true;
  
  const promotionPieces = [
    { type: 'queen', name: 'Queen', symbol: 'Q' },
    { type: 'rook', name: 'Rook', symbol: 'R' },
    { type: 'bishop', name: 'Bishop', symbol: 'B' },
    { type: 'knight', name: 'Knight', symbol: 'N' }
  ];
  
  promotionPieces.forEach(piece => {
    const button = document.createElement('button');
    button.className = 'promotion-choice';
    button.dataset.piece = piece.type;
    
    button.innerHTML = `
      <img src="../images/${pieceColor}${piece.type}.png" 
           alt="${piece.name}" 
           class="all-img"
           style="width: 40px; height: 40px; margin-bottom: 5px;">
      <div style="font-size: 12px;">${piece.name}</div>
    `;
    
    button.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px;
      border: 2px solid #ddd;
      border-radius: 5px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 80px;
    `;
    
    button.addEventListener('mouseenter', () => {
      button.style.borderColor = '#4CAF50';
      button.style.backgroundColor = '#f8fff8';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.borderColor = '#ddd';
      button.style.backgroundColor = 'white';
    });
    
    button.addEventListener('click', () => {
      if (promotionCallback) {
        promotionCallback(piece.type);
      }
      closePromotionModal();
    });
    
    optionsContainer.appendChild(button);
  });
  
  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('gameModal').classList.add('hidden');
  isModalOpen = false;
}

function closePromotionModal() {
  const modal = document.getElementById('promotionModal');
  modal.classList.add('hidden');
  promotionPending = false;
  promotionCallback = null;
  pendingPromotionBox = null;
  isModalOpen = false;
}

function endGame(message) {
  isGameOver = true;
  promotionPending = false;
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