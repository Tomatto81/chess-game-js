# ♟️ JavaScript Chess Game

This project is a complete implementation of a standard chess game using HTML, CSS, and pure Vanilla JavaScript. The game incorporates nearly all official chess rules, making it a robust platform for understanding complex game logic.


## ✨ Key Features

This chess game is built with a strong focus on accurate rule implementation:

* **Core Logic:** Full movement implementation for all pieces (King, Queen, Rook, Bishop, Knight, Pawn).
* **Advanced Chess Rules:**
    * **En Passant:** Complete logic for the En Passant capture, including tracking the last moved pawn.
    * **Castling:** Valid King and Rook movement for both Kingside (`O-O`) and Queenside (`O-O-O`), including safety checks (cannot move through or land on an attacked square).
    * **Pawn Promotion:** Mechanism allowing pawns reaching the last rank to promote to a Queen, Rook, Bishop, or Knight (currently uses a `prompt()` UI).
* **Game Conditions:**
    * **Check & Checkmate:** Detection and display for the King being in 'Check' and 'Checkmate'.
    * **Stalemate:** Detection of a 'Stalemate' resulting in a Draw.
    * **Draw Rules:** Implementation for Draws via **Threefold Repetition** (claimable) and **Fivefold Repetition** (automatic Draw).
    * **50-Move Rule:** Automatic Draw detection after 100 half-moves (50 full moves) without a pawn move or capture.
* **Notation:** Generates Standard Algebraic Notation (SAN) for every move played.
* **UI/UX:** Highlights valid destination squares and indicates the current turn.

## 🛠️ Technologies Used

* **HTML5:** Main structure for the chessboard and game elements.
* **CSS3:** Styling for the board, pieces, and a responsive layout.
* **JavaScript (ES6+):** All game logic, move generation, rule validation, and state management.

## ⚙️ Project Structure
