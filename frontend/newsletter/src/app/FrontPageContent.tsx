"use client";

import Link from "next/link";
import type { Category, Post } from "@evalieu/common";
import { useLayout } from "@/context/LayoutContext";
import { Masthead } from "@/components/newspaper/Masthead";
import { CategoryStrip } from "@/components/newspaper/CategoryStrip";
import { NewspaperGrid } from "@/components/newspaper/NewspaperGrid";
import { MagazineHeader } from "@/components/magazine/MagazineHeader";
import { MagazineFrontPageGrid } from "@/components/magazine/MagazineFrontPageGrid";
import { RecommendationForm } from "@/components/engagement/RecommendationForm";
import { SubscribeForm } from "@/components/engagement/SubscribeForm";
import { LayoutToggle } from "@/components/shared/LayoutToggle";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { AdSlot } from "@/components/AdSlot";
import { KoFiButton } from "@/components/KoFiButton";
import styles from "./FrontPageContent.module.scss";

export type FrontPageContentProps = {
  posts: Post[];
  categories: Category[];
  kofiUrl?: string | null;
};

export function FrontPageContent({
  posts,
  categories,
  kofiUrl,
}: FrontPageContentProps) {
  const { layout } = useLayout();

  if (layout === "magazine") {
    return (
      <div className={styles.magazineShell}>
        <MagazineHeader />
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
        <section className={styles.recommendSection}>
          <RecommendationForm compact />
        </section>
        <footer className={styles.subscribeFooter}>
          <SubscribeForm compactHeading />
          <KoFiButton kofiUrl={kofiUrl ?? ""} />
          <div className={styles.layoutToggleRow}>
            <Link href="/issues" className={styles.footerLink}>Issues</Link>
            <span className={styles.footerSep}>·</span>
            <LayoutToggle />
            <ThemeToggle />
          </div>
        </footer>
      </div>
    );
  }

  const sidebarFooterContent = (
    <div className={styles.sidebarWidgets}>
      <div className={styles.sidebarWidget}>
        <h4 className={styles.widgetTitle}>Recommend</h4>
        <p className={styles.widgetIntro}>
          Know something worth sharing?
        </p>
        <RecommendationForm compact />
      </div>
      <div className={styles.sidebarWidget}>
        <KoFiButton kofiUrl={kofiUrl ?? ""} />
      </div>
    </div>
  );

  const gridFooterContent = (
    <div className={styles.gridFooterInner}>
      <div className={styles.subscribeRow}>
        <SubscribeForm compactHeading />
      </div>
      <div className={styles.layoutToggleRow}>
        <Link href="/issues" className={styles.footerLink}>Issues</Link>
        <span className={styles.footerSep}>·</span>
        <LayoutToggle />
        <ThemeToggle />
      </div>
    </div>
  );

  return (
    <>
      <Masthead issueNumber={1} editionLabel="Personal Edition" />
      <CategoryStrip categories={categories} />
      {posts.length > 0 ? (
        <NewspaperGrid
          posts={posts}
          categories={categories}
          midSlot={<AdSlot slot="front-newspaper-mid" />}
          sidebarFooter={sidebarFooterContent}
          gridFooter={gridFooterContent}
        />
      ) : (
        <p className={styles.empty}>No editions available yet.</p>
      )}
    </>
  );
}
