import useGame from "@/lib/hooks/useGame";
import styles from "./styles.module.css";
import usePlayer from "@/lib/hooks/usePlayer";
import DefaultButton from "@/components/DefaultButton";

type ActionButtonPropTypes = {
  isMyTurn: boolean;
  madeSelection: boolean;
};

export default function ActionButton({
  isMyTurn,
  madeSelection,
}: ActionButtonPropTypes) {
  const { rollDice, game, updateGame } = useGame();
  const { player, updatePlayer } = usePlayer();

  function RollDiceButton() {
    // available to current turn player
    async function handleRollDice() {
      await rollDice();
    }

    return <DefaultButton onClick={handleRollDice}>Roll Dice</DefaultButton>;
  }

  function EndTurnButton() {
    // available to current turn player after rolling dice
    // disabled until everybody is ready
    async function handleEndTurn() {
      const playerCount = game.players.length;
      const nextTurnIndex =
        game.currentTurnIndex + 1 === playerCount
          ? 0
          : game.currentTurnIndex + 1;
      await updateGame({ diceRolled: false, currentTurnIndex: nextTurnIndex });
    }
    //TODO: Make it a "Pass Turn" button until the player makes a selection
    const otherPlayers = game.players.filter((p) => p.id !== player.id);
    return (
      <DefaultButton
        onClick={handleEndTurn}
        disabled={!otherPlayers.every((p) => p.ready)}
      >
        {madeSelection ? "End Turn" : "Pass Turn"}
      </DefaultButton>
    );
  }

  function ReadyButton() {
    // available to other players.
    // is disabled until the dice are rolled

    async function handleReady() {
      updatePlayer({ ready: !player.ready });
    }

    return (
      <DefaultButton onClick={handleReady} disabled={!game.diceRolled}>
        {player.ready ? "Ready" : "Not Ready"}
      </DefaultButton>
    );
  }

  if (isMyTurn && !game.diceRolled) {
    return <RollDiceButton></RollDiceButton>;
  } else if (isMyTurn && game.diceRolled) {
    return <EndTurnButton></EndTurnButton>;
  } else if (!isMyTurn) {
    return <ReadyButton></ReadyButton>;
  } else {
    return null;
  }
}
