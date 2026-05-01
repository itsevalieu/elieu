import type { Metadata } from "next";
import Link from "next/link";
import { Masthead } from "@/components/newspaper/Masthead";
import { RecommendationForm } from "@/components/engagement/RecommendationForm";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Recommend something · The Eva Times",
  description: "Tell Eva about a book, show, movie, or other thing worth mentioning.",
};

export default function RecommendationsPage() {
  return (
    <>
      <Masthead issueLine="READERS · RECOMMEND" />
      <main className={styles.main}>
        <div className={styles.navRow}>
          <Link href="/" className={styles.back}>
            ← Front page
          </Link>
        </div>

        <h1 className={styles.head}>Recommend something!</h1>
        <p className={styles.intro}>
          If there&apos;s a book, film, series, or oddity you think might fit the letter, drop it
          here. No promise of a write-up, but every note is read.
        </p>

        <RecommendationForm compact />
      </main>
    </>
  );
}
