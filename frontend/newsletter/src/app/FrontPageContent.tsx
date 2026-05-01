"use client";

import type { Category, Post } from "@evalieu/common";
import { useLayout } from "@/context/LayoutContext";
import { Masthead } from "@/components/newspaper/Masthead";
import { CategoryStrip } from "@/components/newspaper/CategoryStrip";
import { NewspaperGrid } from "@/components/newspaper/NewspaperGrid";
import { MagazineHeader } from "@/components/magazine/MagazineHeader";
import { MagazineFrontPageGrid } from "@/components/magazine/MagazineFrontPageGrid";
import { SubscribeForm } from "@/components/engagement/SubscribeForm";
import { AdSlot } from "@/components/AdSlot";
import { KoFiButton } from "@/components/KoFiButton";
import styles from "./FrontPageContent.module.scss";

export type FrontPageContentProps = {
  posts: Post[];
  categories: Category[];
  issueLine: string | null;
  kofiUrl?: string | null;
};

export function FrontPageContent({
  posts,
  categories,
  issueLine,
  kofiUrl,
}: FrontPageContentProps) {
  const { layout } = useLayout();

  if (layout === "magazine") {
    return (
      <div className={styles.magazineShell}>
        <MagazineHeader issueLine={issueLine} />
        <CategoryStrip categories={categories} />
        {posts.length > 0 ? (
          <>
            <MagazineFrontPageGrid
              posts={posts}
              categories={categories}
              betweenStripSlot={<AdSlot slot="front-magazine-between-strips" />}
            />
            <AdSlot slot="front-magazine-before-subscribe" />
          </>
        ) : (
          <p className={styles.empty}>No editions available yet.</p>
        )}
        <footer className={styles.subscribeFooter}>
          <SubscribeForm compactHeading />
          <KoFiButton kofiUrl={kofiUrl ?? ""} />
        </footer>
      </div>
    );
  }

  return (
    <>
      <Masthead issueLine={issueLine ?? undefined} />
      <CategoryStrip categories={categories} />
      {posts.length > 0 ? (
        <>
          <NewspaperGrid
            posts={posts}
            midSlot={<AdSlot slot="front-newspaper-mid" />}
          />
          <AdSlot slot="front-newspaper-footer" />
        </>
      ) : (
        <p className={styles.empty}>No editions available yet.</p>
      )}
      <footer className={styles.subscribeFooter}>
        <SubscribeForm compactHeading />
        <KoFiButton kofiUrl={kofiUrl ?? ""} />
      </footer>
    </>
  );
}
