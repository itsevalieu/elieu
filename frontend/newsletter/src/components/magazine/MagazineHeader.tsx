import styles from "./MagazineHeader.module.scss";

function formatCoverDate(): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
  }).format(new Date());
}

export function MagazineHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <div className={styles.pub}>
          <span className={styles.pubName}>The Eva Times</span>
          <time className={styles.date}>{formatCoverDate()}</time>
        </div>
      </div>
    </header>
  );
}
