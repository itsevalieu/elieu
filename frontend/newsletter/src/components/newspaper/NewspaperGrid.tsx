import type { ReactNode } from "react";
import type { Category, Post } from "@evalieu/common";
import { splitFeaturedAndRest } from "@/lib/postDisplay";
import { AdSlot } from "@/components/AdSlot";
import { ExcerptCard } from "./ExcerptCard";
import { FeaturedArticle } from "./FeaturedArticle";
import { SectionDivider } from "./SectionDivider";
import { SidebarCard } from "./SidebarCard";
import { QuoteSidebarCard } from "./QuoteSidebarCard";
import styles from "./NewspaperGrid.module.scss";

type Props = {
  posts: Post[];
  categories: Category[];
  midSlot?: ReactNode;
  sidebarFooter?: ReactNode;
  gridFooter?: ReactNode;
};

type CardVariant = "wide" | "full" | "default" | "compact";

interface SlottedPost {
  post: Post;
  variant: CardVariant;
  subcategoryName: string;
}

function buildSections(
  posts: Post[],
  categories: Category[],
): {
  sections: { categoryName: string; categorySlug: string; items: SlottedPost[] }[];
  quotes: Post[];
  photos: Post[];
  sidebarFeatures: Post[];
} {
  const SIDEBAR_SUBS = new Set(["affirmations", "watercolors", "photos"]);

  const postsBySubId = new Map<number, Post[]>();
  const postsByCatId = new Map<number, Post[]>();
  const quotes: Post[] = [];
  const photos: Post[] = [];
  const sidebarFeatures: Post[] = [];

  for (const p of posts) {
    if (p.format === "quote") {
      quotes.push(p);
      continue;
    }
    if (p.subcategoryId != null) {
      const arr = postsBySubId.get(p.subcategoryId) ?? [];
      arr.push(p);
      postsBySubId.set(p.subcategoryId, arr);
    } else {
      const arr = postsByCatId.get(p.categoryId) ?? [];
      arr.push(p);
      postsByCatId.set(p.categoryId, arr);
    }
  }

  const pick = (list: Post[] | undefined): Post | null => {
    if (!list?.length) return null;
    return [...list].sort((a, b) => b.viewCount - a.viewCount)[0];
  };

  const sections: { categoryName: string; categorySlug: string; items: SlottedPost[] }[] = [];

  for (const cat of categories) {
    const items: SlottedPost[] = [];

    for (const sub of cat.subcategories) {
      if (SIDEBAR_SUBS.has(sub.slug)) {
        const reps = postsBySubId.get(sub.id) ?? [];
        if (sub.slug === "photos") {
          const rep = pick(reps);
          if (rep) photos.push(rep);
        } else {
          const rep = pick(reps);
          if (rep) sidebarFeatures.push(rep);
        }
        continue;
      }
      const rep = pick(postsBySubId.get(sub.id));
      if (!rep) continue;
      items.push({ post: rep, variant: "default", subcategoryName: sub.name });
    }

    const uncatRep = pick(postsByCatId.get(cat.id));
    if (uncatRep) {
      items.push({ post: uncatRep, variant: "default", subcategoryName: cat.name });
    }

    if (!items.length) continue;

    let hasWide = false;
    for (const item of items) {
      if (item.post.layoutHint === "brief") {
        item.variant = "compact";
      } else if (!hasWide && item.post.coverImageUrl) {
        item.variant = "wide";
        hasWide = true;
      }
    }

    sections.push({ categoryName: cat.name, categorySlug: cat.slug, items });
  }

  return { sections, quotes, photos, sidebarFeatures };
}

export function NewspaperGrid({ posts, categories, midSlot, sidebarFooter, gridFooter }: Props) {
  const { featured, rest } = splitFeaturedAndRest(posts);
  const { sections, quotes, photos, sidebarFeatures } = buildSections(rest, categories);

  const sidebarPosts: Post[] = [];
  const mainSections: typeof sections = [];

  for (const section of sections) {
    const candidate = section.items.find(
      (i) => i.variant !== "wide" && i.variant !== "compact",
    );
    const mainItems = section.items.filter((i) =>
      !candidate || i.post.id !== candidate.post.id,
    );

    if (candidate) sidebarPosts.push(candidate.post);
    if (mainItems.length) {
      mainSections.push({ ...section, items: mainItems });
    }
  }

  return (
    <div className={styles.outerGrid}>
      <div className={styles.contentRow}>
        {/* ── Main column ── */}
        <div className={styles.mainContent}>
          {featured ? (
            <section className={styles.featured} aria-labelledby="featured-heading">
              <span id="featured-heading" className="visuallyHidden">
                Featured story
              </span>
              <FeaturedArticle post={featured} />
            </section>
          ) : null}

          {midSlot ?? null}

          {mainSections.map((section, si) => {
            const cols = 3;
            let used = 0;
            for (const { variant } of section.items) {
              if (variant === "full") { used += cols; }
              else if (variant === "wide") { used += 2; }
              else { used += 1; }
            }
            const remainder = used % cols;
            const emptySlots = remainder === 0 ? 0 : cols - remainder;

            return (
              <div key={section.categorySlug}>
                <SectionDivider
                  label={section.categoryName}
                  variant={si === 0 ? "rule" : "banner"}
                />
                <div className={styles.mainGrid}>
                  {section.items.map(({ post: p, variant }) => (
                    <div
                      key={p.id}
                      className={`${styles.cell} ${
                        variant === "wide" ? styles.cellWide :
                        variant === "full" ? styles.cellFull : ""
                      }`}
                    >
                      <ExcerptCard post={p} variant={variant} />
                    </div>
                  ))}
                  {emptySlots > 0 ? (
                    <div
                      className={`${styles.cell} ${styles.adCell} ${
                        emptySlots >= 2 ? styles.cellWide : ""
                      }`}
                    >
                      <AdSlot slot={`grid-${section.categorySlug}`} />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Around the Times</h3>
          {sidebarPosts.map((p, i) => (
            <SidebarCard key={p.id} post={p} showImage={i === 0} />
          ))}

          {sidebarFeatures.length > 0 ? (
            <div className={styles.sidebarSection}>
              {sidebarFeatures.map((p, i) => (
                <SidebarCard key={p.id} post={p} showImage={!!p.coverImageUrl && i === 0} />
              ))}
            </div>
          ) : null}

          {quotes.length > 0 ? (
            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarTitle}>Affirmations</h3>
              {quotes.map((q) => (
                <QuoteSidebarCard key={q.id} post={q} />
              ))}
            </div>
          ) : null}

          {photos.length > 0 ? (
            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarTitle}>Photos</h3>
              {photos.map((p) => (
                <SidebarCard key={p.id} post={p} showImage={!!p.coverImageUrl} />
              ))}
            </div>
          ) : null}

          {sidebarFooter ? (
            <div className={styles.sidebarFooter}>{sidebarFooter}</div>
          ) : null}
        </aside>
      </div>

      {gridFooter ? (
        <div className={styles.gridFooter}>{gridFooter}</div>
      ) : null}
    </div>
  );
}
