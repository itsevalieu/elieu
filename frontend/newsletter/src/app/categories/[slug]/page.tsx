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
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const cats = await getCategories();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) return { title: "Not found" };
  return {
    title: `${cat.name} · The Eva Times`,
    description: `Posts in ${cat.name}.`,
  };
}

export default async function CategoryPage(props: Props) {
  const { slug } = await props.params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();

  const postsPage = await getPublishedPosts(0, 48, slug);
  const posts = postsPage.content;

  return (
    <>
      <Masthead issueLine={`SECTION · ${cat.name.toUpperCase()}`} />
      <CategoryStrip categories={categories} />
      <main className={styles.main}>
        <div className={styles.navRow}>
          <Link href="/" className={styles.back}>
            ← Front page
          </Link>
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
