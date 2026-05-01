"use client";

import { useLayout } from "@/context/LayoutContext";
import styles from "./LayoutToggle.module.scss";

export function LayoutToggle() {
  const { layout, setLayout } = useLayout();

  return (
    <div
      className={styles.wrapper}
      role="radiogroup"
      aria-label="Front page layout"
    >
      <button
        type="button"
        role="radio"
        aria-checked={layout === "newspaper"}
        className={`${styles.option} ${layout === "newspaper" ? styles.active : ""}`}
        onClick={() => setLayout("newspaper")}
      >
        Newspaper
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={layout === "magazine"}
        className={`${styles.option} ${layout === "magazine" ? styles.active : ""}`}
        onClick={() => setLayout("magazine")}
      >
        Magazine
      </button>
    </div>
  );
}
