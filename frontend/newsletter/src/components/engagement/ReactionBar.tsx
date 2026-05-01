"use client";

import { useCallback, useEffect, useState } from "react";
import type { Post } from "@evalieu/common";
import { addReaction, removeReaction } from "@/lib/api";
import styles from "./ReactionBar.module.scss";

const ALLOWED_LIST = ["❤️", "🔥", "😂", "👏", "😮", "😢"] as const;
const ALLOWED_KEYS = new Set<string>(ALLOWED_LIST);

function reactionStorageKey(postId: number) {
  return `evalieu_reaction:${postId}`;
}

function mergeCounts(initial: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of ALLOWED_LIST) out[e] = initial[e] ?? 0;
  return out;
}

function getSessionId(): string {
  try {
    let id = localStorage.getItem("evalieu_session_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("evalieu_session_id", id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

type Props = {
  postId: number;
  initialReactionCounts: Post["reactionCounts"];
};

export function ReactionBar({ postId, initialReactionCounts }: Props) {
  const [counts, setCounts] = useState(() =>
    mergeCounts(initialReactionCounts ?? {})
  );

  useEffect(() => {
    setCounts(mergeCounts(initialReactionCounts ?? {}));
  }, [initialReactionCounts, postId]);

  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(reactionStorageKey(postId));
      setSelected(saved && ALLOWED_KEYS.has(saved) ? saved : null);
    } catch {
      setSelected(null);
    }
  }, [postId]);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persistSelection = useCallback((emoji: string | null) => {
    const key = reactionStorageKey(postId);
    try {
      if (!emoji) localStorage.removeItem(key);
      else localStorage.setItem(key, emoji);
    } catch {
      /* ignore quota / privacy mode */
    }
  }, [postId]);

  const reconcileFromServer = (next: Record<string, number>) => {
    setCounts(mergeCounts(next ?? {}));
  };

  const onPick = async (emoji: (typeof ALLOWED_LIST)[number]) => {
    if (pending) return;

    const sessionId = getSessionId();
    if (!sessionId) {
      setError("Could not start a reaction session.");
      return;
    }

    setPending(true);
    setError(null);

    if (selected === emoji) {
      const before = counts;
      setCounts((prev) => {
        const copy = mergeCounts(prev);
        copy[emoji] = Math.max(0, (copy[emoji] ?? 0) - 1);
        return copy;
      });
      setSelected(null);
      persistSelection(null);

      try {
        await removeReaction(postId, sessionId);
      } catch {
        setCounts(before);
        setSelected(emoji);
        persistSelection(emoji);
        setError("Couldn’t remove your reaction. Try again.");
      } finally {
        setPending(false);
      }
      return;
    }

    const previous = selected;

    const before = counts;

    const optimisticSwap = (): Record<string, number> => {
      const copy = mergeCounts(before);
      if (previous) copy[previous] = Math.max(0, (copy[previous] ?? 0) - 1);
      copy[emoji] = (copy[emoji] ?? 0) + 1;
      return copy;
    };

    setCounts(optimisticSwap());
    setSelected(emoji);
    persistSelection(emoji);

    try {
      const post = await addReaction(postId, emoji, sessionId);
      reconcileFromServer(post.reactionCounts ?? {});
      setSelected(emoji);
      persistSelection(emoji);
    } catch {
      setCounts(before);
      setSelected(previous);
      persistSelection(previous);
      setError("Couldn’t save your reaction. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className={styles.bar} aria-label="Reactions">
      <span className={styles.label}>React</span>
      <div className={styles.reactionsRow}>
        {ALLOWED_LIST.map((emoji) => {
          const active = selected === emoji;
          return (
            <button
              key={emoji}
              type="button"
              className={`${styles.btn}${active ? ` ${styles.selected}` : ""}`}
              aria-pressed={active}
              aria-label={`React with ${emoji}`}
              disabled={pending}
              onClick={() => void onPick(emoji)}
            >
              <span aria-hidden>{emoji}</span>
              <span className={styles.count}>{counts[emoji] ?? 0}</span>
            </button>
          );
        })}
      </div>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
