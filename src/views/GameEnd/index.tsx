import View from "@/components/View";
import styles from "./style.module.css";
import useGame from "@/lib/hooks/useGame";
import { Score, ScoreRow } from "@/lib/types";
import { pipe, map, sumPlus, createArray } from "@/lib/utils";
import { useParams } from "react-router-dom";

export default function GameEnd() {
  const { gameCode } = useParams();
  document.title = `Qwixx Clone | ${gameCode} Game End`;
  const { game } = useGame(gameCode);

  function calculateScorePerColor(numbers: number[]) {
    return numbers.reduce((total, _, i) => total + i + 1, 0);
  }

  function calculateFinalScore(score: Score) {
    const finalScore = pipe(
      map((row: ScoreRow) =>
        row.selectedNumbers.reduce((total, _, i) => total + i + 1, 0)
      ),
      sumPlus(score.passedTurns * -5)
    )(score.scoreRows);

    return finalScore;
  }

  return (
    <View pageTitle={`Score for ${gameCode}`} header="Scores">
      <table className={styles.scoreTable}>
        <thead>
          <th></th>
          <th className={styles[`scoreTable__colorColumn__header--red`]}>
            Red
          </th>
          <th className={styles[`scoreTable__colorColumn__header--yellow`]}>
            Yellow
          </th>
          <th className={styles[`scoreTable__colorColumn__header--green`]}>
            Green
          </th>
          <th className={styles[`scoreTable__colorColumn__header--blue`]}>
            Blue
          </th>
          <th>Passed</th>
          <th className={styles.scoreTable__totalColumn}>Total Score</th>
        </thead>
        <tr>
          <td></td>
          {createArray(5).map((_) => (
            <td style={{ fontSize: "12px" }}>Xs (Score)</td>
          ))}
          <td></td>
        </tr>
        {game.players
          .toSorted(
            (a, b) =>
              calculateFinalScore(b.score) - calculateFinalScore(a.score)
          )
          .map((player) => (
            <tr>
              <th>{player.name}</th>
              {player.score.scoreRows.map((sr) => (
                <td
                  className={`${styles.scoreTable__colorColumn} ${
                    styles[`scoreTable__colorColumn--${sr.color}`]
                  }`}
                >
                  {sr.selectedNumbers.length} (
                  {calculateScorePerColor(sr.selectedNumbers)})
                </td>
              ))}
              <td>
                {player.score.passedTurns} ({player.score.passedTurns * -5})
              </td>
              <td>{calculateFinalScore(player.score)}</td>
            </tr>
          ))}
      </table>
    </View>
  );
}
