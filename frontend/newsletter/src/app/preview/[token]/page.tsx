import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { getPostByPreviewToken } from "@/lib/api";
import { renderMarkdown } from "@/lib/markdown";
import { Masthead } from "@/components/newspaper/Masthead";
import { VideoPlayer } from "@/components/VideoPlayer";
import { GameEmbed } from "@/components/GameEmbed";
import styles from "../../posts/[slug]/page.module.scss";
import previewStyles from "./page.module.scss";

type Props = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  return { title: "Preview", robots: { index: false, follow: false } };
}

export default async function PreviewPage(props: Props) {
  const { token } = await props.params;
  const post = await getPostByPreviewToken(token);
  if (!post) notFound();

  const html = await renderMarkdown(post.body);

  return (
    <>
      <Masthead />
      <div className={previewStyles.banner}>
        Draft Preview — not published
      </div>
      <article className={styles.article}>
        <p className={styles.overline}>
          {post.categoryName ?? "Uncategorized"}
        </p>
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.byline}>
          <div className={styles.bylineMain}>
            <span>Status: {post.status}</span>
          </div>
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

        {post.format === "embedded-game" && post.gameUrl && post.gameType ? (
          <GameEmbed gameUrl={post.gameUrl} gameType={post.gameType} title={post.title} />
        ) : null}

        {post.videoUrl && post.videoType ? (
          <VideoPlayer
            url={post.videoUrl}
            type={post.videoType as "hosted" | "youtube" | "vimeo"}
          />
        ) : null}

        <footer className={styles.footer}>
          <Link href="/" className={styles.back}>
            ← Back to front page
          </Link>
        </footer>
      </article>
    </>
  );
}
