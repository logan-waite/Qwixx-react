import { ComponentProps } from "react";
import styles from "./styles.module.css";

export default function DefaultInput({
  children,
  ...props
}: ComponentProps<"input">) {
  return (
    <input className={styles.defaultInput} {...props}>
      {children}
    </input>
  );
}
