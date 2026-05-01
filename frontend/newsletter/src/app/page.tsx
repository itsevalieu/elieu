import { Masthead } from "@/components/newspaper/Masthead";
import { NewspaperGrid } from "@/components/newspaper/NewspaperGrid";
import { CategoryStrip } from "@/components/newspaper/CategoryStrip";
import {
  getCategories,
  getLatestIssue,
  getPublishedPosts,
} from "@/lib/api";
import { formatIssueVolLine } from "@/lib/issueDisplay";
import styles from "./page.module.scss";

export default async function HomePage() {
  const [postsPage, categories, latestIssue] = await Promise.all([
    getPublishedPosts(0, 48),
    getCategories(),
    getLatestIssue(),
  ]);

  const issueLine = latestIssue ? formatIssueVolLine(latestIssue) : null;
  const posts = postsPage.content;

  return (
    <main className={styles.shell}>
      <Masthead issueLine={issueLine} />
      <CategoryStrip categories={categories} />
      {posts.length > 0 ? (
        <NewspaperGrid posts={posts} />
      ) : (
        <p className={styles.empty}>No editions available yet.</p>
      )}
    </main>
  );
}
