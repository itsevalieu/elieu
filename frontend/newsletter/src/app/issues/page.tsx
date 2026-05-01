import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { Masthead } from "@/components/newspaper/Masthead";
import { listIssuesPaged } from "@/lib/api";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Past issues · The Eva Times",
  description: "Browse published newsletter issues.",
};

export default async function IssuesIndexPage() {
  const issues = await listIssuesPaged(0, 48);

  return (
    <>
      <Masthead />
      <main className={styles.main}>
        <h1 className={styles.head}>Past Issues</h1>
        <ul className={styles.list}>
          {issues.content.map((issue) => (
            <li key={issue.id} className={styles.item}>
              <Link href={`/issues/${issue.slug}`} className={styles.row}>
                <div className={styles.copy}>
                  <span className={styles.issueTitle}>{issue.title}</span>
                  <span className={styles.issueMeta}>
                    {issue.year} · Month {issue.month}
                  </span>
                </div>
                <div className={styles.coverWrap}>
                  {issue.coverImageUrl ? (
                    <Image
                      src={issue.coverImageUrl}
                      alt=""
                      width={180}
                      height={120}
                      className={styles.cover}
                      sizes="180px"
                    />
                  ) : (
                    <div className={styles.coverPlaceholder}>No cover</div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
