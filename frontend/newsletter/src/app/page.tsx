import { FrontPageContent } from "@/app/FrontPageContent";
import {
  getCategories,
  getPublishedPosts,
} from "@/lib/api";
import styles from "./page.module.scss";

export default async function HomePage() {
  const [postsPage, categories] = await Promise.all([
    getPublishedPosts(0, 48),
    getCategories(),
  ]);

  const posts = postsPage.content;

  return (
    <main className={styles.shell}>
      <FrontPageContent
        posts={posts}
        categories={categories}
        kofiUrl={process.env.NEXT_PUBLIC_KOFI_URL}
      />
    </main>
  );
}
