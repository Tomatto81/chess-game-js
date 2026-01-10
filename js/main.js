// main.js

document.addEventListener('DOMContentLoaded', () => {
  coloring();
  initializeBoard();
  createNotations();
  disableBoard();

  const initialPositionKey = generatePositionKey();
  positionHistory[initialPositionKey] = 1;

  setupEventListeners();
});