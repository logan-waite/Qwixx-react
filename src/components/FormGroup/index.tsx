import styles from "./styles.module.css";
import { ReactNode } from "react";

export default function FormGroup({ children }: { children: ReactNode }) {
  return <div className={styles.formGroup}>{children}</div>;
}
