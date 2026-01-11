// boardManager.js

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

function clearHighlights() {
  coloring();
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