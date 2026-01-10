# ♟️ JavaScript Chess Game - Player vs Computer

This project is a complete implementation of a standard chess game using HTML, CSS, and pure Vanilla JavaScript. The game now features Player vs Computer mode.

## ✨ Key Features

* **Player vs Computer Mode**: Play against an AI opponent
* **Color Selection**: Choose to play as White, Black, or Random
* **Board Rotation**: When playing as Black, the board automatically rotates
* **Computer AI**: Basic AI that makes legal moves with simple strategy
* **All Standard Chess Rules**:
    * Complete piece movement rules
    * En Passant capture
    * Castling (both sides)
    * Pawn promotion
    * Check, Checkmate, and Stalemate detection
    * Draw rules: Threefold/Fivefold repetition, 50-move rule
* **Move History**: Complete move log with Standard Algebraic Notation

## 🎮 How to Play

1. Click "New Game" button
2. Choose your color (White, Black, or Random)
3. White always moves first
4. Click on your piece to select it, then click on a highlighted square to move
5. The computer will automatically make its move after yours
6. When the game ends, click "Close" to view move history or "New Game" to play again

## 🛠️ Technologies Used

* **HTML5**: Game structure and board layout
* **CSS3**: Styling, animations, and responsive design
* **JavaScript (ES6+)**: Game logic, AI, and state management
* **Pure Vanilla JS**: No external libraries or frameworks

## 📁 File Structure

* `html/index.html` - Main HTML file
* `css/style.css` - Styling and responsive design
* `js/main.js` - Main game logic and player interaction
* `js/computerMove.js` - Computer AI logic
* `images/` - Chess piece images
* `README.md` - This documentation