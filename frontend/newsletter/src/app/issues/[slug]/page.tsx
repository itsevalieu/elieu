import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Masthead } from "@/components/newspaper/Masthead";
import { NewspaperGrid } from "@/components/newspaper/NewspaperGrid";
import { getIssueBySlug } from "@/lib/api";
import { formatIssueVolLine } from "@/lib/issueDisplay";
import styles from "./page.module.scss";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const issue = await getIssueBySlug(slug);
  if (!issue) return { title: "Not found" };
  return {
    title: `${issue.title} · The Eva Times`,
    description: `Issue from ${issue.year}: ${issue.title}`,
  };
}

export default async function IssueDetailPage(props: Props) {
  const { slug } = await props.params;
  const issue = await getIssueBySlug(slug);
  if (!issue) notFound();

  const line = formatIssueVolLine(issue);

  return (
    <>
      <Masthead issueLine={line} />
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>{issue.title}</h1>
          <p className={styles.byline}>{line}</p>
          <Link href="/issues" className={styles.crumb}>
            ← All issues
          </Link>
        </header>
        {issue.coverImageUrl ? (
          <div className={styles.cover}>
            <Image
              src={issue.coverImageUrl}
              alt=""
              width={880}
              height={440}
              className={styles.coverImage}
              sizes="(max-width: 900px) 100vw, 880px"
              priority
            />
          </div>
        ) : null}
        {issue.posts.length ? (
          <NewspaperGrid posts={issue.posts} />
        ) : (
          <p className={styles.noPosts}>This issue does not contain any linked posts.</p>
        )}
      </main>
    </>
  );
}
