import styles from "./styles.module.css";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGame from "@/lib/hooks/useGame";
import View from "@/components/View";
import DefaultButton from "@/components/DefaultButton";
import DefaultInput from "@/components/DefaultInput";
import FormGroup from "@/components/FormGroup";

export default function HomeView() {
  const [gameCode, setGameCode] = useState("");
  const { createGame, joinGame } = useGame();

  const navigate = useNavigate();

  async function handleCreateGame() {
    const newGameCode = await createGame();
    navigate(`/lobby/${newGameCode}`);
  }

  useEffect(() => {
    console.log({ gameCode });
  }, [gameCode]);

  async function handleJoinGame(e: FormEvent) {
    e.preventDefault();
    if (gameCode) {
      await joinGame(gameCode);
      navigate(`/lobby/${gameCode}`);
    }
  }

  return (
    <View pageTitle="Home" header="Qwixx Clone" className={styles.homeView}>
      <DefaultButton type="button" onClick={handleCreateGame}>
        Create Game
      </DefaultButton>
      {/* </div> */}
      <form className={styles.joinGameInputGroup} onSubmit={handleJoinGame}>
        <FormGroup>
          <DefaultInput
            maxLength={5}
            type="text"
            placeholder="Game Code"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
          ></DefaultInput>
          <DefaultButton type="submit" disabled={!gameCode}>
            Join Game
          </DefaultButton>
        </FormGroup>
      </form>
    </View>
  );
}
