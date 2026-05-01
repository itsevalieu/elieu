"use client";

import type { Category, Post } from "@evalieu/common";
import { useLayout } from "@/context/LayoutContext";
import { Masthead } from "@/components/newspaper/Masthead";
import { CategoryStrip } from "@/components/newspaper/CategoryStrip";
import { NewspaperGrid } from "@/components/newspaper/NewspaperGrid";
import { MagazineHeader } from "@/components/magazine/MagazineHeader";
import { MagazineFrontPageGrid } from "@/components/magazine/MagazineFrontPageGrid";
import styles from "./FrontPageContent.module.scss";

export type FrontPageContentProps = {
  posts: Post[];
  categories: Category[];
  issueLine: string | null;
};

export function FrontPageContent({
  posts,
  categories,
  issueLine,
}: FrontPageContentProps) {
  const { layout } = useLayout();

  if (layout === "magazine") {
    return (
      <div className={styles.magazineShell}>
        <MagazineHeader issueLine={issueLine} />
        {posts.length > 0 ? (
          <MagazineFrontPageGrid posts={posts} categories={categories} />
        ) : (
          <p className={styles.empty}>No editions available yet.</p>
        )}
      </div>
    );
  }

  return (
    <>
      <Masthead issueLine={issueLine ?? undefined} />
      <CategoryStrip categories={categories} />
      {posts.length > 0 ? (
        <NewspaperGrid posts={posts} />
      ) : (
        <p className={styles.empty}>No editions available yet.</p>
      )}
    </>
  );
}
