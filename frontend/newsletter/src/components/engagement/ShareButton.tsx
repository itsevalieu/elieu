"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ShareButton.module.scss";

function buildPostUrl(origin: string, slug: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/posts/${encodeURIComponent(slug)}`;
}

type Props = {
  title: string;
  text?: string | null;
  slug: string;
};

export function ShareButton({ title, text, slug }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return undefined;
    const onDocMouse = (evt: MouseEvent) => {
      if (!wrapRef.current?.contains(evt.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocMouse);
    return () => document.removeEventListener("mousedown", onDocMouse);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!copiedToast) return undefined;
    const t = window.setTimeout(() => setCopiedToast(false), 2200);
    return () => window.clearTimeout(t);
  }, [copiedToast]);

  const getUrl = (): string => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (siteUrl) return `${siteUrl.replace(/\/$/, "")}/posts/${encodeURIComponent(slug)}`;
    if (typeof window === "undefined") return "";
    return buildPostUrl(window.location.origin, slug);
  };

  const excerpt = text?.trim()?.slice(0, 280) ?? "";

  const url = () => getUrl();

  const onPrimaryClick = async () => {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      const u = url();
      try {
        await navigator.share({
          title,
          text: excerpt || title,
          url: u,
        });
        return;
      } catch {
        /* user cancelled → fall through to menu */
      }
    }
    setDropdownOpen((v) => !v);
  };

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopiedToast(true);
      setDropdownOpen(false);
    } catch {
      setDropdownOpen(false);
    }
  };

  const onShareX = () => {
    const u = encodeURIComponent(url());
    const tweet = `https://twitter.com/intent/tweet?url=${u}&text=${encodeURIComponent(title)}`;
    window.open(tweet, "_blank", "noopener,noreferrer,width=600,height=520");
    setDropdownOpen(false);
  };

  const onShareFacebook = () => {
    const u = encodeURIComponent(url());
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      "_blank",
      "noopener,noreferrer,width=600,height=520"
    );
    setDropdownOpen(false);
  };

  const onShareEmail = () => {
    const u = url();
    const body = `${excerpt ? `${excerpt}\n\n` : ""}${u}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    setDropdownOpen(false);
  };

  return (
    <div ref={wrapRef} className={styles.wrapper}>
      <button type="button" className={styles.shareBtn} onClick={() => void onPrimaryClick()}>
        <svg
          className={styles.icon}
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.59 13.51l6.83 3.98" />
          <path d="M15.41 6.51l-6.82 3.98" />
        </svg>
        Share
      </button>

      {dropdownOpen ? (
        <div role="menu" className={styles.menu}>
          <button type="button" className={styles.menuBtn} onClick={() => void onCopyLink()}>
            Copy link
          </button>
          <button type="button" className={styles.menuBtn} onClick={onShareX}>
            Share on X (Twitter)
          </button>
          <button type="button" className={styles.menuBtn} onClick={onShareFacebook}>
            Share on Facebook
          </button>
          <button type="button" className={styles.menuBtn} onClick={onShareEmail}>
            Share via email
          </button>
        </div>
      ) : null}

      {copiedToast ? (
        <div className={styles.toast} role="status">
          Copied!
        </div>
      ) : null}
    </div>
  );
}
