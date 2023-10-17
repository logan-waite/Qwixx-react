import { BoxSelection, Color } from "@/lib/types";
import styles from "./styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import usePlayer from "@/lib/hooks/usePlayer";
import { getValueByColor } from "@/lib/utils";
import useGame from "@/lib/hooks/useGame";

type ScoreRowBoxPropTypes = {
  color: Color;
  value: number;
  validWhiteOption?: boolean;
  validColorOption?: boolean;
  isSelected: boolean;
  isAvailable?: boolean;
  onSelect?: (
    selectingFor: "white" | "color" | "both",
    selection: BoxSelection | null
  ) => void;
  currentlySelected?: {
    white: BoxSelection | null;
    color: BoxSelection | null;
  };
  isLockNumber?: boolean;
};

export default function ScoreRowBox({
  color,
  value,
  validWhiteOption = false,
  validColorOption = false,
  isSelected = false,
  isAvailable = false,
  onSelect = () => {},
  currentlySelected = { white: null, color: null },
  isLockNumber = false,
}: ScoreRowBoxPropTypes) {
  const { player } = usePlayer();
  const { game } = useGame();
  const getColorValue = getValueByColor(color);

  const colorClass = styles[`scoreRow__box--${color}`];
  const disabled = !validWhiteOption && !validColorOption;
  const isScored = player.score.scoreRows
    .find((sr) => sr.color === color)!
    .selectedNumbers.includes(value);

  function handleClick() {
    const selection = { color, value, willLock: isLockNumber };
    if (isSelected && validWhiteOption) {
      onSelect("white", null);
    } else if (isSelected && validColorOption) {
      onSelect("color", null);
    } else if (isSelected && validWhiteOption && validColorOption) {
      onSelect("both", null);
    } else if (isAvailable && validWhiteOption && validColorOption) {
      // default to white when there is conflict
      if (currentlySelected.white && !currentlySelected.color) {
        onSelect("color", selection);
      } else if (!currentlySelected.white && !currentlySelected.color) {
        onSelect("both", selection);
      } else {
        onSelect("white", selection);
      }
    } else if (isAvailable && validWhiteOption) {
      onSelect("white", selection);
    } else if (isAvailable && validColorOption) {
      onSelect("color", selection);
    }
  }

  const rowLocked = game.diceRoll
    .filter((d) => d.locked)
    .map((d) => d.color)
    .includes(color);

  return (
    <button
      type="button"
      className={`${styles.scoreRow__box} ${colorClass}`}
      disabled={disabled}
      onClick={handleClick}
    >
      {/* Actual Value */}
      {value > -1 ? (
        value
      ) : rowLocked ? (
        <FontAwesomeIcon icon={["fas", "lock"]} />
      ) : (
        <FontAwesomeIcon icon={["fas", "unlock"]} />
      )}

      {/* Locked row bar */}
      {(value === -1 || isAvailable) && rowLocked && !isScored ? (
        <hr className={styles["scoreRow__box__lockedBar"]} />
      ) : null}

      {/* Selection X */}
      {isSelected ? (
        <FontAwesomeIcon
          className={styles["scoreRow__box--selected"]}
          icon={["fas", "x"]}
        />
      ) : null}

      {/* Scored X */}
      {isScored ? (
        <FontAwesomeIcon
          className={styles["scoreRow__box--scored"]}
          icon={["fas", "x"]}
        />
      ) : null}

      {/* Valid White Option Icon */}
      {isAvailable && validWhiteOption ? (
        <FontAwesomeIcon
          className={styles["scoreRow__box--attention"]}
          icon={["fad", "circle-exclamation"]}
          style={{ left: "2px", top: "2px" }}
        />
      ) : null}

      {/* Valid Color Option Icon */}
      {isAvailable && validColorOption ? (
        <FontAwesomeIcon
          className={styles["scoreRow__box--attention"]}
          icon={["fad", "circle-exclamation"]}
          style={{ right: "2px", top: "2px" }}
          swapOpacity
        />
      ) : null}
    </button>
  );
}
