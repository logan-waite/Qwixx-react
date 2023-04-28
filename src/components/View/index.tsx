import styles from "./styles.module.css";
import { ReactNode } from "react";

type ViewPropTypes = {
  pageTitle?: string;
  header?: string;
  className?: string;
  children: ReactNode;
};

export default function View({
  children,
  pageTitle,
  header,
  className,
}: ViewPropTypes) {
  const appName = "Qwixx Clone";
  document.title = pageTitle ? `${appName} | ${pageTitle}` : appName;

  const classes = `${styles.viewWrapper} ${className}`;
  return (
    <main className={classes}>
      {header ? <h1>{header}</h1> : null}
      {children}
    </main>
  );
}
