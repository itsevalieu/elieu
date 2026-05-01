import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { getPostBySlug } from "@/lib/api";
import { renderMarkdown } from "@/lib/markdown";
import { topReactions } from "@/lib/postDisplay";
import { Masthead } from "@/components/newspaper/Masthead";
import { VideoPlayer } from "@/components/VideoPlayer";
import styles from "./page.module.scss";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not found" };
  const desc = post.excerpt?.slice(0, 160) || post.title;
  return {
    title: `${post.title} | The Eva Times`,
    description: desc,
  };
}

export default async function PostPage(props: Props) {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const html = await renderMarkdown(post.body);
  const reactions = topReactions(post.reactionCounts, 14);
  const published = post.publishedAt
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(post.publishedAt))
    : null;

  const showVideo =
    post.videoUrl &&
    post.videoType &&
    (post.videoType === "hosted" ||
      post.videoType === "youtube" ||
      post.videoType === "vimeo");

  return (
    <>
      <Masthead />
      <article className={styles.article}>
        <p className={styles.overline}>
          <Link href={`/categories/${post.categorySlug}`}>{post.categoryName}</Link>
        </p>
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.byline}>
          {published ? <time dateTime={post.publishedAt ?? undefined}>{published}</time> : null}
          {published ? <span className={styles.sep}> · </span> : null}
          <span>{post.commentCount} comments</span>
        </div>

        {post.coverImageUrl ? (
          <div className={styles.cover}>
            <Image
              src={post.coverImageUrl}
              alt=""
              fill
              className={styles.coverImage}
              sizes="(max-width: 900px) 100vw, 880px"
              priority
            />
          </div>
        ) : null}

        <div
          className={styles.markdown}
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {showVideo ? (
          <VideoPlayer
            url={post.videoUrl!}
            type={post.videoType as "hosted" | "youtube" | "vimeo"}
          />
        ) : null}

        <footer className={styles.footer}>
          {reactions.length > 0 ? (
            <div className={styles.reactions}>
              Reactions:{` `}
              {reactions.map(([emoji, count]) => (
                <span key={emoji} className={styles.react}>
                  {emoji} {count}
                </span>
              ))}
            </div>
          ) : (
            <p className={styles.footerMeta}>No reactions yet.</p>
          )}
          <p className={styles.footerMeta}>
            {post.commentCount} reader comment
            {post.commentCount !== 1 ? "s" : ""}
          </p>
          <Link href="/" className={styles.back}>
            ← Back to front page
          </Link>
        </footer>
      </article>
    </>
  );
}
