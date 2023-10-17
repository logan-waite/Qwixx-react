import styles from "./styles.module.css";
import useGame from "@/lib/hooks/useGame";
import usePlayer from "@/lib/hooks/usePlayer";
import { useNavigate, useParams } from "react-router-dom";
import Die from "./components/Die";
import { createArray } from "@/lib/utils";
import ScoreRow from "./components/ScoreRow";
import ActionButton from "./components/ActionButton";
import type { BoxSelection, ScoreRow as ScoreRowType } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useEffectWithPrevState from "@/lib/hooks/useEffectWithPrevState";
import View from "@/components/View";

export default function GameView() {
  const navigate = useNavigate();
  const { gameCode } = useParams();
  document.title = `Qwixx Clone | ${gameCode} Game`;

  const { gameRef, game, updateGame } = useGame(gameCode);
  const { player, updatePlayer } = usePlayer(gameRef);

  const [selectedWhiteBox, setSelectedWhiteBox] = useState<BoxSelection | null>(
    null
  );
  const [selectedColorBox, setSelectedColorBox] = useState<BoxSelection | null>(
    null
  );

  const playerIndex = game.players.findIndex((p) => p.id === player.id);
  const isMyTurn = game.currentTurnIndex === playerIndex;

  const lockedColors = game.diceRoll.filter((d) => d.locked);

  // turns end when the currentTurnIndex changes
  const isMounted = useRef(false);
  useEffectWithPrevState(
    (previous) => {
      const [lastTurnIndex] = previous;
      const wasMyTurn = playerIndex === lastTurnIndex;
      // only run after the component has been mounted.
      if (isMounted.current) {
        // Save the scores
        if (wasMyTurn && !selectedWhiteBox && !selectedColorBox) {
          updatePlayer({
            ready: false,
            score: {
              passedTurns: player.score.passedTurns + 1,
              scoreRows: player.score.scoreRows,
            },
          });
        } else {
          const updatedScoreRows = [selectedWhiteBox, selectedColorBox].reduce(
            (scoreRows, selection) => {
              if (selection) {
                const scoreRowIndex = scoreRows.findIndex(
                  (sr) => sr.color === selection.color
                );
                scoreRows[scoreRowIndex].selectedNumbers.push(selection.value);
                if (selection.willLock) {
                  scoreRows[scoreRowIndex].selectedNumbers.push(-1);
                  // scoreRows[scoreRowIndex].locked = true;
                  const updatedDice = game.diceRoll.map((d) => {
                    if (d.color === selection.color) {
                      d.locked = true;
                    }
                    return d;
                  });
                  updateGame({ diceRoll: updatedDice });
                }
              }
              return scoreRows;
            },
            player.score.scoreRows as ScoreRowType[]
          );
          updatePlayer({
            ready: false,
            score: {
              passedTurns: player.score.passedTurns,
              scoreRows: updatedScoreRows,
            },
          });
        }
        // clear the selections for the next turn
        setSelectedWhiteBox(null);
        setSelectedColorBox(null);
      } else {
        isMounted.current = true;
      }
    },
    [game.currentTurnIndex]
  );

  // Game ends when a player has passed 4 times or two rows are locked.
  useEffect(() => {
    if (
      player.score.passedTurns === 4 ||
      game.diceRoll.filter((d) => d.locked).length >= 2
    ) {
      console.log("End of game!");
      updateGame({ status: "ended" });
    }
  }, [player.score.passedTurns, game.diceRoll]);

  // If game is ended, navigate away
  useEffect(() => {
    if (game.status === "ended") {
      navigate(`/game/${gameCode}/end`);
    }
  }, [game.status]);

  function handleSelection(
    selectingFor: "white" | "color" | "both",
    selection: BoxSelection | null
  ) {
    switch (selectingFor) {
      case "white":
        setSelectedWhiteBox(selection);
        break;
      case "color":
        setSelectedColorBox(selection);
        break;
      case "both":
        setSelectedWhiteBox(selection);
        setSelectedColorBox(selection);
        break;
      default:
        const _exhaustiveCheck: never = selectingFor;
        console.error("unexpected `selectingFor` value:", selectingFor);
    }
  }

  return (
    <View pageTitle={`${gameCode} Game`} header={`Qwixx Game ${gameCode}`}>
      <div className={styles.diceTray}>
        {game.diceRoll.map((die, i) => (
          <Die
            key={i}
            color={die.color}
            pipColor={die.pipColor}
            value={die.value}
            locked={die.locked}
          />
        ))}
      </div>
      <div className={styles.actions}>
        <div className={styles.buttons}>
          <ActionButton
            isMyTurn={isMyTurn}
            madeSelection={!!selectedColorBox || !!selectedWhiteBox}
          ></ActionButton>
        </div>
        <div className={styles.turnDisplay}>
          Current Turn
          <div>
            {game.players.map((p, i) => (
              <span
                key={i}
                className={[
                  game.currentTurnIndex === i ? styles.activePlayer : "",
                  styles.player,
                ].join(" ")}
              >
                {p.name}&nbsp;{" "}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.emptyRolls}>
          <h5>Turns Passed</h5>
          <div className={styles.emptyRollMarker__wrapper}>
            {createArray(4).map((_, i) => (
              <div key={i} className={styles.emptyRollMarker}>
                {player.score.passedTurns > i ? (
                  <FontAwesomeIcon icon={["fas", "x"]} />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.scorecard}>
        <div className={styles.lockBoxes}>
          <h5>At Least 5 X's</h5>
        </div>
        <ScoreRow
          color="red"
          ascOrder={true}
          isMyTurn={isMyTurn}
          onSelect={handleSelection}
          currentlySelected={{
            white: selectedWhiteBox,
            color: selectedColorBox,
          }}
        ></ScoreRow>
        <ScoreRow
          color="yellow"
          ascOrder={true}
          isMyTurn={isMyTurn}
          onSelect={handleSelection}
          currentlySelected={{
            white: selectedWhiteBox,
            color: selectedColorBox,
          }}
        ></ScoreRow>
        <ScoreRow
          color="green"
          ascOrder={false}
          isMyTurn={isMyTurn}
          onSelect={handleSelection}
          currentlySelected={{
            white: selectedWhiteBox,
            color: selectedColorBox,
          }}
        ></ScoreRow>
        <ScoreRow
          color="blue"
          ascOrder={false}
          isMyTurn={isMyTurn}
          onSelect={handleSelection}
          currentlySelected={{
            white: selectedWhiteBox,
            color: selectedColorBox,
          }}
        ></ScoreRow>
      </div>
    </View>
  );
}
