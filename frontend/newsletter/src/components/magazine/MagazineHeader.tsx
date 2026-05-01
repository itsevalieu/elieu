"use client";

import { LayoutToggle } from "@/components/shared/LayoutToggle";
import styles from "./MagazineHeader.module.scss";

export type MagazineHeaderProps = {
  issueLine?: string | null;
};

function formatCoverDate(): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

export function MagazineHeader({ issueLine }: MagazineHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <div className={styles.pub}>
          <span className={styles.pubName}>The Eva Times</span>
          <time className={styles.date}>{formatCoverDate()}</time>
          {issueLine ? (
            <p className={styles.issueLine}>{issueLine}</p>
          ) : null}
        </div>
        <div className={styles.actions}>
          <LayoutToggle />
        </div>
      </div>
    </header>
  );
}
