import styles from "./styles.module.css";
import DefaultButton from "@/components/DefaultButton";
import DefaultInput from "@/components/DefaultInput";
import FormGroup from "@/components/FormGroup";
import View from "@/components/View";
import { PlayerState } from "@/contexts/PlayerContext";
import useGame from "@/lib/hooks/useGame";
import usePlayer from "@/lib/hooks/usePlayer";
import {
  generateGuid,
  getFromLocal,
  randomNumber,
  saveToLocal,
} from "@/lib/utils";
import { FormEvent, useEffect, useState } from "react";
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
    <View pageTitle="Lobby" className={styles.lobbyView}>
      <h1>Lobby for {gameCode}</h1>
      <h2>Welcome, {player.name}</h2>
      <form onSubmit={handleNameChange}>
        <FormGroup>
          <DefaultInput
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          ></DefaultInput>
          <DefaultButton type="submit">Change Name</DefaultButton>
        </FormGroup>
      </form>
      <h3 className={styles.joinedPlayerTitle}>Joined Players</h3>
      <ul className={styles.joinedPlayerList}>
        {game.players.map((gamePlayer) => {
          return (
            <li className={styles.joinedPlayerList__player} key={gamePlayer.id}>
              {gamePlayer.name}
            </li>
          );
        })}
      </ul>
      <div>
        {player?.id === game.players[0]?.id ? (
          <DefaultButton
            onClick={startGame}
            disabled={
              game.players.filter((p) => p.ready).length <
              game.players.length - 1
            }
          >
            Start Game
          </DefaultButton>
        ) : (
          <DefaultButton onClick={toggleReady}>
            {player.ready ? "Ready" : "Not Ready"}
          </DefaultButton>
        )}
      </div>
    </View>
  );
}
