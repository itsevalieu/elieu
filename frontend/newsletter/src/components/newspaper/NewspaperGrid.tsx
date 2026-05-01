import type { ReactNode } from "react";
import type { Post } from "@evalieu/common";
import { distributeColumns, splitFeaturedAndRest } from "@/lib/postDisplay";
import { ExcerptCard } from "./ExcerptCard";
import { FeaturedArticle } from "./FeaturedArticle";
import styles from "./NewspaperGrid.module.scss";

type Props = {
  posts: Post[];
  /** Rendered between the featured fold and excerpt columns when present (e.g. ad). */
  midSlot?: ReactNode;
};

export function NewspaperGrid({ posts, midSlot }: Props) {
  const { featured, rest } = splitFeaturedAndRest(posts);
  const columns = distributeColumns(rest, 3);

  return (
    <div className={styles.grid}>
      {featured ? (
        <section className={styles.featured} aria-labelledby="featured-heading">
          <span id="featured-heading" className="visuallyHidden">
            Featured story
          </span>
          <FeaturedArticle post={featured} />
        </section>
      ) : null}

      {midSlot ?? null}

      {columns.map((colPosts, ci) => (
        <div key={ci} className={styles.column}>
          {colPosts.map((p) => (
            <ExcerptCard key={p.id} post={p} />
          ))}
        </div>
      ))}
    </div>
  );
}
