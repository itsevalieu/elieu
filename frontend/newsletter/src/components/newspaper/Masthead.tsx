import Link from "next/link";
import styles from "./Masthead.module.scss";

function formatDate(): string {
  const now = new Date();
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(now);
  const day = now.getDate();
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(now);
  const year = now.getFullYear();
  return `${weekday}, ${day} ${month.toUpperCase()}, ${year}`;
}

export type MastheadProps = {
  issueLine?: string | null;
  issueNumber?: number | null;
  editionLabel?: string | null;
};

export function Masthead({ issueLine, issueNumber, editionLabel }: MastheadProps) {
  return (
    <header className={styles.masthead}>
      <Link href="/" className={styles.homeLink}>
        <h1 className={styles.title}>THE EVA TIMES</h1>
      </Link>
      <div className={styles.subRow}>
        <span className={styles.subLeft}>
          {issueNumber != null ? `ISSUE #${issueNumber}` : "\u00A0"}
        </span>
        <span className={styles.subCenter}>{formatDate()}</span>
        <span className={styles.subRight}>
          {editionLabel ?? (issueLine || "\u00A0")}
        </span>
      </div>
    </header>
  );
}
