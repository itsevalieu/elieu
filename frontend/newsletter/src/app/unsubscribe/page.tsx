"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import styles from "./page.module.scss";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

function UnsubscribeBody() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "ok" | "err">(() => (token ? "loading" : "err"));
  const [message, setMessage] = useState(() =>
    token ? "" : "Missing unsubscribe link.",
  );

  useEffect(() => {
    if (!token) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/unsubscribe?token=${encodeURIComponent(token)}`,
          { cache: "no-store" },
        );
        const text = await res.text();
        if (cancelled) return;
        if (res.ok) {
          setStatus("ok");
          setMessage(text.trim() || "You have been unsubscribed.");
        } else {
          setStatus("err");
          setMessage(text.trim() || "Could not complete unsubscribe.");
        }
      } catch {
        if (!cancelled) {
          setStatus("err");
          setMessage("Could not reach the server. Try again in a moment.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.h1}>Unsubscribe</h1>
        {status === "loading" ? <p className={styles.p}>Processing…</p> : null}
        {status === "ok" ? <p className={`${styles.p} ${styles.ok}`}>{message}</p> : null}
        {status === "err" ? <p className={`${styles.p} ${styles.err}`}>{message}</p> : null}
        <p className={styles.linkRow}>
          <Link href="/">Return home</Link>
        </p>
      </div>
    </main>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <main className={styles.main}>
          <div className={styles.card}>
            <p className={styles.p}>Loading…</p>
          </div>
        </main>
      }
    >
      <UnsubscribeBody />
    </Suspense>
  );
}
