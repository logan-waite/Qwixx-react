import styles from "./style.module.css";
import useGame from "@/lib/hooks/useGame";
import { Score, ScoreRow } from "@/lib/types";
import { pipe, map, sumPlus } from "@/lib/utils";
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
    <table className={styles.scoreTable}>
      <thead>
        <th></th>
        <th>Red</th>
        <th>Yellow</th>
        <th>Green</th>
        <th>Blue</th>
        <th>Passed</th>
        <th className={styles.scoreTable__totalColumn}>Total Score</th>
      </thead>
      {game.players.map((player) => (
        <tr>
          <th>{player.name}</th>
          {player.score.scoreRows.map((sr) => (
            <td className={styles[`scoreTable__colorColumn--${sr.color}`]}>
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
  );
  // return (
  //   <div>
  //     {game.players.map((player) => (
  //       <div>
  //         <span>{player.name}&nbsp;</span>
  //         {player.score.scoreRows.map((sr) => (
  //           <span>
  //             {sr.color} : {sr.selectedNumbers.length}
  //             &nbsp;&nbsp;&nbsp;
  //           </span>
  //         ))}
  //         <span>{player.score.passedTurns}&nbsp;&nbsp;&nbsp;</span>
  //         <span>Total Score: </span>
  //       </div>
  //     ))}
  //   </div>
  // );
}
