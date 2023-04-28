import styles from "./styles.module.css";
import { ComponentProps, ReactNode } from "react";

export default function DefaultButton({
  children,
  ...props
}: ComponentProps<"button">) {
  return (
    <button className={styles.defaultButton} {...props}>
      {children}
    </button>
  );
}
