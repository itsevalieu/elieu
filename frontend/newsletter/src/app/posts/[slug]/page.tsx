import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { getPostBySlug } from "@/lib/api";
import { CommentSection } from "@/components/engagement/CommentSection";
import { ReactionBar } from "@/components/engagement/ReactionBar";
import { ShareButton } from "@/components/engagement/ShareButton";
import { AdSlot } from "@/components/AdSlot";
import { renderMarkdown } from "@/lib/markdown";
import { leadExcerpt } from "@/lib/postDisplay";
import { Masthead } from "@/components/newspaper/Masthead";
import { VideoPlayer } from "@/components/VideoPlayer";
import { GameEmbed } from "@/components/GameEmbed";
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

  const showGame =
    post.format === "embedded-game" &&
    post.gameUrl?.trim() &&
    post.gameType &&
    ["iframe", "canvas", "link"].includes(post.gameType);

  return (
    <>
      <Masthead />
      <article className={styles.article}>
        <p className={styles.overline}>
          <Link href={`/categories/${post.categorySlug}`}>{post.subcategoryName ?? post.categoryName}</Link>
        </p>
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.byline}>
          <div className={styles.bylineMain}>
            {published ? <time dateTime={post.publishedAt ?? undefined}>{published}</time> : null}
            {published ? <span className={styles.sep}> · </span> : null}
            <span>
              {post.commentCount} comment{post.commentCount !== 1 ? "s" : ""}
            </span>
          </div>
          <ShareButton
            title={post.title}
            text={leadExcerpt(post)}
            slug={slug}
          />
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

        {showGame ? (
          <GameEmbed gameUrl={post.gameUrl!} gameType={post.gameType!} title={post.title} />
        ) : null}

        {showVideo ? (
          <VideoPlayer
            url={post.videoUrl!}
            type={post.videoType as "hosted" | "youtube" | "vimeo"}
          />
        ) : null}

        <AdSlot slot={`post-${post.id}`} />

        <ReactionBar postId={post.id} initialReactionCounts={post.reactionCounts} />
        <CommentSection postId={post.id} slug={slug} />

        <footer className={styles.footer}>
          <Link href="/" className={styles.back}>
            ← Back to front page
          </Link>
        </footer>
      </article>
    </>
  );
}
