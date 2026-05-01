import { FrontPageContent } from "@/app/FrontPageContent";
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
      <FrontPageContent
        posts={posts}
        categories={categories}
        issueLine={issueLine}
      />
    </main>
  );
}
