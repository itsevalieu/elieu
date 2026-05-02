"use client";

import { useEffect, useRef, useState } from "react";
import type { Post } from "@evalieu/common";
import { addReaction } from "@/lib/api";
import styles from "./ReactionBar.module.scss";

const ALLOWED_LIST = ["❤️", "🔥", "😂", "👏", "😮", "😢", "👍", "🎉", "💡", "💯", "🌱"] as const;

function reactionStorageKey(postId: number) {
  return `evalieu_reactions:${postId}`;
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

function loadSelectedSet(postId: number): Set<string> {
  try {
    const raw = localStorage.getItem(reactionStorageKey(postId));
    if (!raw) {
      const legacy = localStorage.getItem(`evalieu_reaction:${postId}`);
      if (legacy) {
        localStorage.removeItem(`evalieu_reaction:${postId}`);
        localStorage.setItem(reactionStorageKey(postId), JSON.stringify([legacy]));
        return new Set([legacy]);
      }
      return new Set();
    }
    const arr = JSON.parse(raw) as string[];
    return new Set(arr.filter((e) => ALLOWED_LIST.includes(e as typeof ALLOWED_LIST[number])));
  } catch {
    return new Set();
  }
}

function saveSelectedSet(postId: number, set: Set<string>) {
  const key = reactionStorageKey(postId);
  try {
    if (set.size === 0) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify([...set]));
  } catch { /* ignore */ }
}

type Props = {
  postId: number;
  initialReactionCounts: Post["reactionCounts"];
};

export function ReactionBar({ postId, initialReactionCounts }: Props) {
  const [counts, setCounts] = useState(() =>
    mergeCounts(initialReactionCounts ?? {}),
  );

  useEffect(() => {
    setCounts(mergeCounts(initialReactionCounts ?? {}));
  }, [initialReactionCounts, postId]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  useEffect(() => {
    setSelected(loadSelectedSet(postId));
  }, [postId]);

  const [inflight, setInflight] = useState<Set<string>>(new Set());
  const inflightCountRef = useRef(0);
  const [error, setError] = useState<string | null>(null);

  const onPick = (emoji: typeof ALLOWED_LIST[number]) => {
    if (inflight.has(emoji)) return;

    const sessionId = getSessionId();
    if (!sessionId) {
      setError("Could not start a reaction session.");
      return;
    }

    setError(null);

    setInflight((prev) => new Set(prev).add(emoji));
    inflightCountRef.current += 1;

    const wasSelected = selected.has(emoji);

    const nextSelected = new Set(selected);
    if (wasSelected) {
      nextSelected.delete(emoji);
    } else {
      nextSelected.add(emoji);
    }

    setCounts((prev) => {
      const copy = { ...prev };
      copy[emoji] = wasSelected
        ? Math.max(0, (copy[emoji] ?? 0) - 1)
        : (copy[emoji] ?? 0) + 1;
      return copy;
    });
    setSelected(nextSelected);
    saveSelectedSet(postId, nextSelected);

    addReaction(postId, emoji, sessionId)
      .then((post) => {
        inflightCountRef.current -= 1;
        if (inflightCountRef.current === 0) {
          setCounts(mergeCounts(post.reactionCounts ?? {}));
        }
      })
      .catch(() => {
        inflightCountRef.current -= 1;
        setCounts((prev) => {
          const copy = { ...prev };
          copy[emoji] = wasSelected
            ? (copy[emoji] ?? 0) + 1
            : Math.max(0, (copy[emoji] ?? 0) - 1);
          return copy;
        });
        setSelected((prev) => {
          const rollback = new Set(prev);
          if (wasSelected) rollback.add(emoji);
          else rollback.delete(emoji);
          saveSelectedSet(postId, rollback);
          return rollback;
        });
        setError("Couldn't save your reaction. Try again.");
      })
      .finally(() => {
        setInflight((prev) => {
          const next = new Set(prev);
          next.delete(emoji);
          return next;
        });
      });
  };

  return (
    <section className={styles.bar} aria-label="Reactions">
      <span className={styles.label}>React</span>
      <div className={styles.reactionsRow}>
        {ALLOWED_LIST.map((emoji) => {
          const active = selected.has(emoji);
          const loading = inflight.has(emoji);
          return (
            <button
              key={emoji}
              type="button"
              className={`${styles.btn}${active ? ` ${styles.selected}` : ""}${loading ? ` ${styles.loading}` : ""}`}
              aria-pressed={active}
              aria-label={`React with ${emoji}`}
              onClick={() => onPick(emoji)}
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
