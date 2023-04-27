import { useContext, useState } from "react";
import { generateGameCode } from "@/lib/firestore";
import { useNavigate } from "react-router-dom";
import GameContext from "@/contexts/GameContext";
import useGame from "@/lib/hooks/useGame";

export default function HomeView() {
  document.title = "Qwixx Clone | Home";
  const [gameCode, setGameCode] = useState("");
  const { createGame, joinGame } = useGame();

  const navigate = useNavigate();

  async function handleCreateGame() {
    const newGameCode = await createGame();
    navigate(`/lobby/${newGameCode}`);
  }

  async function handleJoinGame() {
    if (gameCode) {
      await joinGame(gameCode);
      navigate(`/lobby/${gameCode}`);
    }
  }

  return (
    <main>
      <div>
        <button type="button" onClick={handleCreateGame}>
          Create Game
        </button>
      </div>
      <div>
        <input
          type="text"
          placeholder="Game Code"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => (e.key === "Enter" ? handleJoinGame() : null)}
        ></input>
        <button type="button" disabled={!gameCode} onClick={handleJoinGame}>
          Join Game
        </button>
      </div>
    </main>
  );
}
