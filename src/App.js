import React, { useState } from "react";
import "./App.css";

// ✅ Replace this with your actual Render backend URL
const API_URL = "https://tic-tac-toe-ai-ursp.onrender.com/move";

const initialState = Array(9).fill(0); // 0 = empty, 1 = player, 2 = AI

function App() {
  const [board, setBoard] = useState(initialState);
  const [message, setMessage] = useState("Your move!");
  const [isGameOver, setIsGameOver] = useState(false);

  const checkWinner = (board) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return board.includes(0) ? null : "draw";
  };

  const handleClick = async (index) => {
    if (board[index] !== 0 || isGameOver) return;

    const newBoard = [...board];
    newBoard[index] = 1;
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner) {
      endGame(winner);
      return;
    }

    setMessage("AI is thinking...");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: newBoard }),
      });

      if (!response.ok) throw new Error("API error");

      const data = await response.json();
      const aiMove = data.move;

      if (newBoard[aiMove] === 0) {
        newBoard[aiMove] = 2;
        setBoard([...newBoard]);
        const winner = checkWinner(newBoard);
        if (winner) endGame(winner);
        else setMessage("Your move!");
      } else {
        setMessage("AI returned an invalid move!");
      }
    } catch (error) {
      console.error("Error contacting AI:", error);
      setMessage("Error contacting AI.");
    }
  };

  const endGame = (winner) => {
    setIsGameOver(true);
    setMessage(
      winner === 1 ? "🎉 You win!" :
      winner === 2 ? "💻 AI wins!" :
      "😐 It's a draw!"
    );
  };

  const resetGame = () => {
    setBoard(initialState);
    setMessage("Your move!");
    setIsGameOver(false);
  };

  return (
    <div className="App">
      <h1>Tic Tac Toe (AI)</h1>
      <p>{message}</p>
      <div className="board">
        {board.map((_, i) => (
          <button
            key={i}
            className="cell"
            onClick={() => handleClick(i)}
            disabled={isGameOver}
          >
            {board[i] === 1 ? "X" : board[i] === 2 ? "O" : ""}
          </button>
        ))}
      </div>
      <button className="reset" onClick={resetGame}>Restart Game</button>
    </div>
  );
}

export default App;
