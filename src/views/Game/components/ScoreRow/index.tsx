import { BoxSelection, Color } from "@/lib/types";
import styles from "./styles.module.css";
import {
  createArray,
  getValueByColor,
  max,
  min,
  objectsAreEqual,
} from "@/lib/utils";
import ScoreRowBox from "../ScoreRowBox";
import useGame from "@/lib/hooks/useGame";
import { useEffect, useState } from "react";
import usePlayer from "@/lib/hooks/usePlayer";

type ScoreRowPropTypes = {
  ascOrder: boolean;
  color: Color;
  isMyTurn: boolean;
  onSelect: (
    selectingFor: "white" | "color" | "both",
    selection: BoxSelection | null
  ) => void;
  currentlySelected: {
    white: BoxSelection | null;
    color: BoxSelection | null;
  };
};

export default function ScoreRow({
  ascOrder,
  color,
  isMyTurn,
  onSelect,
  currentlySelected,
}: ScoreRowPropTypes) {
  const { game } = useGame();
  const { player } = usePlayer();
  const [whiteValue, setWhiteValue] = useState(0);
  const [colorValue1, setColorValue1] = useState(0);
  const [colorValue2, setColorValue2] = useState(0);
  const getColorValue = getValueByColor(color);

  const selectedNumbers = player.score.scoreRows.find(
    (sr) => sr.color === color
  )!.selectedNumbers;
  const selectedWhiteNumber = getColorValue(currentlySelected.white);
  const selectedColorNumber = getColorValue(currentlySelected.color);

  const boxes = createArray(11, 0).map((_, i) => (ascOrder ? i + 2 : 12 - i));
  const markedBoxes =
    selectedNumbers.length + +!!selectedWhiteNumber + +!!selectedColorNumber;

  const rightmostNumber = ascOrder
    ? max(selectedWhiteNumber, selectedColorNumber, ...selectedNumbers)
    : min(selectedWhiteNumber, selectedColorNumber, ...selectedNumbers);

  const whiteWillLock =
    currentlySelected.white?.color === color &&
    !!currentlySelected.white.willLock;
  const colorWillLock =
    currentlySelected.color?.color === color &&
    !!currentlySelected.color?.willLock;
  const rowWillLock = whiteWillLock || colorWillLock;

  useEffect(() => {
    const whiteDice = game.diceRoll.filter((die) => die.color === "white");
    const colorDie = game.diceRoll.find((die) => die.color === color)!;

    setWhiteValue(whiteDice[0].value + whiteDice[1].value);
    setColorValue1(whiteDice[0].value + colorDie.value);
    setColorValue2(whiteDice[1].value + colorDie.value);
  }, [game.diceRoll]);

  function handleSelect(
    selectingFor: "white" | "color" | "both",
    selection: BoxSelection | null
  ) {
    if (
      // We aren't deselecting
      selectingFor === "white" &&
      currentlySelected.color !== null &&
      selection !== null
    ) {
      if (
        // the white option is to the right of a selected color option
        (currentlySelected.color.color === selection.color &&
          ascOrder &&
          selection.value > currentlySelected.color.value) ||
        (!ascOrder && selection.value < currentlySelected.color.value)
      ) {
        onSelect("color", null);
      }
    }
    onSelect(selectingFor, selection);
  }

  const rowLocked = game.diceRoll
    .filter((d) => d.locked)
    .map((d) => d.color)
    .includes(color);

  return (
    <div
      className={`${styles.scoreRow} ${styles[`scoreRow--${color}`]} ${
        rowLocked ? styles[`scoreRow--locked`] : ""
      }`}
    >
      {boxes.map((boxNumber, i) => {
        const isLockNumber = i + 1 === boxes.length; // The last box
        const numberIsFree = isLockNumber ? markedBoxes >= 5 : true;

        const validWhiteOption =
          game.diceRolled &&
          !rowLocked &&
          boxNumber === whiteValue &&
          numberIsFree;
        const validColorOption =
          isMyTurn &&
          game.diceRolled &&
          !rowLocked &&
          (boxNumber === colorValue1 || boxNumber === colorValue2) &&
          numberIsFree;

        const isSelected =
          objectsAreEqual(currentlySelected.white, {
            color,
            value: boxNumber,
            willLock: isLockNumber,
          }) ||
          objectsAreEqual(currentlySelected.color, {
            color,
            value: boxNumber,
            willLock: isLockNumber,
          });

        return (
          <ScoreRowBox
            key={i}
            color={color}
            value={boxNumber}
            validWhiteOption={validWhiteOption}
            validColorOption={validColorOption}
            isAvailable={
              ascOrder
                ? boxNumber > rightmostNumber
                : boxNumber < rightmostNumber
            }
            isSelected={isSelected}
            onSelect={handleSelect}
            currentlySelected={currentlySelected}
            isLockNumber={isLockNumber}
          ></ScoreRowBox>
        );
      })}
      <ScoreRowBox value={-1} color={color} isSelected={rowWillLock} />
    </div>
  );
}
