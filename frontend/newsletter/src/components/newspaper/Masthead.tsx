import Link from "next/link";
import styles from "./Masthead.module.scss";

function formatIssueDate(): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

export type MastheadProps = {
  /** Shown beneath the dateline when the latest issue is known */
  issueLine?: string | null;
};

export function Masthead({ issueLine }: MastheadProps) {
  return (
    <header className={styles.masthead}>
      <Link href="/" className={styles.homeLink}>
        <h1 className={styles.title}>THE EVA TIMES</h1>
      </Link>
      <p className={styles.dateLine}>{formatIssueDate()}</p>
      {issueLine ? <p className={styles.issueLine}>{issueLine}</p> : null}
    </header>
  );
}
