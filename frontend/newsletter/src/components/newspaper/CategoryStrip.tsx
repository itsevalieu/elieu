import Link from "next/link";
import type { Category } from "@evalieu/common";
import styles from "./CategoryStrip.module.scss";

type Props = { categories: Category[] };

export function CategoryStrip({ categories }: Props) {
  if (!categories.length) return null;
  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <nav className={styles.wrapper} aria-label="Sections">
      <div className={styles.nav}>
        <span className={styles.label}>Sections</span>
        {sorted.map((c, i) => (
          <span
            key={c.id}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--spacing-sm)",
            }}
          >
            {i > 0 ? <span className={styles.sep}>·</span> : null}
            <Link href={`/categories/${c.slug}`} className={styles.link}>
              {c.name}
            </Link>
          </span>
        ))}
        <span className={styles.sep}>·</span>
        <Link href="/issues" className={styles.link}>
          Issues
        </Link>
        <span className={styles.sep}>·</span>
        <Link href="/hobbies" className={styles.link}>
          Hobbies
        </Link>
        <span className={styles.sep}>·</span>
        <Link href="/recipes" className={styles.link}>
          Recipes
        </Link>
      </div>
    </nav>
  );
}
