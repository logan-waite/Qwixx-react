import styles from "./styles.module.css";
import type { Die as DieType } from "@/lib/types";
import { createArray } from "@/lib/utils";

export default function Die({ color, pipColor, value, locked }: DieType) {
  return locked ? null : (
    <div className={styles.die} style={{ backgroundColor: color }}>
      {createArray(value).map((_, i) => (
        <div
          key={i}
          className={styles.die__pip}
          style={{ backgroundColor: pipColor }}
        ></div>
      ))}
    </div>
  );
}
