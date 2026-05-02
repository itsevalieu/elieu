import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Masthead } from "@/components/newspaper/Masthead";
import { CategoryStrip } from "@/components/newspaper/CategoryStrip";
import { NewspaperGrid } from "@/components/newspaper/NewspaperGrid";
import { getCategories, getPublishedPosts } from "@/lib/api";
import styles from "./page.module.scss";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const sp = await props.searchParams;
  const sub = typeof sp.sub === "string" ? sp.sub : undefined;
  const cats = await getCategories();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) return { title: "Not found" };
  const subcat = sub
    ? cat.subcategories?.find((s) => s.slug === sub)
    : undefined;
  const label = subcat ? subcat.name : cat.name;
  return {
    title: `${label} · The Eva Times`,
    description: `Posts in ${label}.`,
  };
}

export default async function CategoryPage(props: Props) {
  const { slug } = await props.params;
  const sp = await props.searchParams;
  const sub = typeof sp.sub === "string" ? sp.sub : undefined;

  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();

  const postsPage = await getPublishedPosts(0, 48, slug, sub);
  const posts = postsPage.content;

  const subcat = sub
    ? cat.subcategories?.find((s) => s.slug === sub)
    : undefined;
  const label = subcat ? subcat.name : cat.name;

  return (
    <>
      <Masthead issueLine={`SECTION · ${label.toUpperCase()}`} />
      <CategoryStrip categories={categories} />
      <main className={styles.main}>
        <div className={styles.navRow}>
          <Link href="/" className={styles.back}>
            ← Front page
          </Link>
          {subcat && (
            <Link href={`/categories/${slug}`} className={styles.back}>
              ← All {cat.name}
            </Link>
          )}
        </div>
        {posts.length ? (
          <NewspaperGrid posts={posts} />
        ) : (
          <p className={styles.empty}>No articles in this section yet.</p>
        )}
      </main>
    </>
  );
}
