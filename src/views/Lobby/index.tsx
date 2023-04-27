import GameContext from "@/contexts/GameContext";
import { PlayerState } from "@/contexts/PlayerContext";
import useGame from "@/lib/hooks/useGame";
import usePlayer from "@/lib/hooks/usePlayer";
import {
  generateGuid,
  getFromLocal,
  randomNumber,
  saveToLocal,
} from "@/lib/utils";
import { FormEvent, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function LobbyView() {
  const { gameCode } = useParams();
  document.title = `Qwixx Clone | ${gameCode} Lobby`;
  const navigate = useNavigate();
  const { gameRef, game, updateGame } = useGame(gameCode);
  const { player, addPlayer, updatePlayer } = usePlayer();

  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    if (gameRef) {
      (async () => {
        const savedPlayer = getFromLocal<PlayerState>("player");
        if (!savedPlayer) {
          const newPlayer = {
            id: generateGuid(),
            name: "Guest",
          };
          saveToLocal("player", newPlayer);
          addPlayer(gameRef, newPlayer);
        } else {
          addPlayer(gameRef, savedPlayer);
        }
      })();
    }
  }, [gameRef]);

  useEffect(() => {
    if (game.status === "in progress") {
      navigate(`/game/${gameCode}`);
    }
  }, [game.status]);

  async function handleNameChange(e: FormEvent) {
    e.preventDefault();
    await updatePlayer({ name: playerName });
    saveToLocal("player", { id: player.id, name: playerName });
  }

  async function startGame() {
    const startingPlayerIndex = randomNumber(0, game.players.length - 1);
    await updateGame({
      status: "in progress",
      currentTurnIndex: startingPlayerIndex,
    });
  }

  async function toggleReady() {
    updatePlayer({ ready: !player.ready });
  }

  return (
    <main>
      <h1>Lobby for {gameCode}</h1>
      <h2>Welcome, {player.name}</h2>
      <form onSubmit={handleNameChange}>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        ></input>
        <button type="submit">Change Name</button>
      </form>
      <h3>Joined Players</h3>
      <ul>
        {game.players.map((gamePlayer) => {
          return (
            <li key={gamePlayer.id}>
              {gamePlayer.name}: {gamePlayer.ready ? "ready" : "not ready"}
            </li>
          );
        })}
      </ul>
      <div>
        {player?.id === game.players[0]?.id ? (
          <button
            onClick={startGame}
            disabled={
              game.players.filter((p) => p.ready).length <
              game.players.length - 1
            }
          >
            Start Game
          </button>
        ) : (
          <button onClick={toggleReady}>Ready</button>
        )}
      </div>
    </main>
  );
}
