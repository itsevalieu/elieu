import type { Post } from "@evalieu/common";
import { categoryColors } from "@/lib/categoryColors";
import { MagazineCard } from "./MagazineCard";
import styles from "./MagazineCategoryStrip.module.scss";

type Props = {
  categorySlug: string;
  categoryName: string;
  posts: Post[];
};

export function MagazineCategoryStrip({
  categorySlug,
  categoryName,
  posts,
}: Props) {
  const accent =
    categoryColors[categorySlug] ?? "hsl(220, 40%, 45%)";

  return (
    <section
      className={styles.strip}
      style={{ borderLeftColor: accent }}
      aria-labelledby={`strip-${categorySlug}`}
    >
      <header className={styles.header}>
        <h2 id={`strip-${categorySlug}`} className={styles.title}>
          {categoryName}
        </h2>
      </header>
      <div className={styles.grid}>
        {posts.map((p) => (
          <MagazineCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  );
}
