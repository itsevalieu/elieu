'use client';

import styles from "./VideoPlayer.module.scss";

export type VideoPlayerProps = {
  url: string;
  type: "hosted" | "youtube" | "vimeo";
};

function youtubeEmbedUrl(src: string): string | undefined {
  try {
    const u = new URL(src);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : undefined;
    }
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").replace(/\/$/, "");
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : undefined;
    }
  } catch {
    /* invalid URL */
  }
  return undefined;
}

function vimeoEmbedUrl(src: string): string | undefined {
  try {
    const u = new URL(src);
    if (!u.hostname.includes("vimeo.com")) return undefined;
    const match =
      u.pathname.match(/\/video\/(\d+)/) || u.pathname.match(/\/(\d+)/);
    const id = match?.[1];
    return id ? `https://player.vimeo.com/video/${encodeURIComponent(id)}` : undefined;
  } catch {
    return undefined;
  }
}

export function VideoPlayer({ url, type }: VideoPlayerProps) {
  if (type === "hosted") {
    return (
      <div className={styles.frame}>
        <video className={styles.video} controls src={url}>
          Your browser does not support embedded video.
        </video>
      </div>
    );
  }

  if (type === "youtube") {
    const embed = youtubeEmbedUrl(url);
    if (!embed) return null;
    return (
      <div className={styles.frame}>
        <iframe
          src={embed}
          title="YouTube video"
          className={styles.iframe}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  if (type === "vimeo") {
    const embed = vimeoEmbedUrl(url);
    if (!embed) return null;
    return (
      <div className={styles.frame}>
        <iframe
          src={embed}
          title="Vimeo video"
          className={styles.iframe}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return null;
}
