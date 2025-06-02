import React, { useState } from "react";
import "./App.css";

const API_URL = "https://tic-tac-toe-ai-ursp.onrender.com";
const initialState = Array(9).fill(0);

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
    if (winner) return endGame(winner);

    setMessage("AI is thinking...");
    try {
      const response = await fetch(`${API_URL}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: newBoard }),
      });
      const data = await response.json();
      const aiMove = data.move;

      if (newBoard[aiMove] === 0) {
        newBoard[aiMove] = 2;
        setBoard([...newBoard]);

        const winner = checkWinner(newBoard);
        winner ? endGame(winner) : setMessage("Your move!");
      } else {
        setMessage("AI returned an invalid move!");
      }
    } catch (error) {
      setMessage("Error contacting AI.");
    }
  };

  async function sendTrainingResult(winner, finalBoard) {
    try {
      await fetch(`${API_URL}/train`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result: winner, final_state: finalBoard }),
      });
    } catch (err) {
      console.error("Training API error:", err);
    }
  }

  const endGame = (winner) => {
    setIsGameOver(true);
    setMessage(
      winner === 1 ? "🎉 You win!" :
      winner === 2 ? "💻 AI wins!" :
      "😐 It's a draw!"
    );

    sendTrainingResult(winner, board);
  };

  const resetGame = () => {
    setBoard(initialState);
    setMessage("Your move!");
    setIsGameOver(false);
  };

  const renderCell = (index) => {
    const value = board[index];
    return (
      <div
        key={index}
        onClick={() => handleClick(index)}
        className={`cell ${value === 1 ? "player" : value === 2 ? "ai" : ""}`}
      >
        {value === 1 ? "X" : value === 2 ? "O" : ""}
      </div>
    );
  };

  return (
    <div className="app">
      <h1 className="title">Tic Tac Toe <span className="ai-tag">with AI</span></h1>
      <div className="message">{message}</div>
      <div className="board">{board.map((_, i) => renderCell(i))}</div>
      <button className="reset" onClick={resetGame}>Restart Game</button>
    </div>
  );
}

export default App;
