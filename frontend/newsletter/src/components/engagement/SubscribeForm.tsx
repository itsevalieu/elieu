"use client";

import { useState } from "react";
import { subscribe } from "@/lib/api";
import styles from "./SubscribeForm.module.scss";

type Props = {
  /** When true, omits the heading for footer / tight layouts */
  compactHeading?: boolean;
};

export function SubscribeForm({ compactHeading }: Props) {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email.");
      return;
    }
    setBusy(true);
    try {
      await subscribe(trimmed, { honeypot });
      setSuccess(true);
      setEmail("");
      setHoneypot("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again later.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.widget}>
      {!compactHeading ? (
        <h2 className={styles.title}>Get the newsletter by email</h2>
      ) : (
        <p className={styles.title}>Get the newsletter</p>
      )}
      <form className={styles.form} onSubmit={(e) => void onSubmit(e)} noValidate>
        <input
          type="text"
          name="company"
          aria-hidden="true"
          tabIndex={-1}
          autoComplete="off"
          className={styles.hp}
          value={honeypot}
          onChange={(evt) => setHoneypot(evt.target.value)}
        />
        <div className={styles.row}>
          <label htmlFor="subscribe-email" className={styles.visuallyHidden}>
            Email address
          </label>
          <input
            id="subscribe-email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            required
            className={styles.input}
            value={email}
            onChange={(evt) => setEmail(evt.target.value)}
            disabled={busy}
          />
          <button type="submit" className={styles.btn} disabled={busy}>
            {busy ? "…" : "Subscribe"}
          </button>
        </div>
        {success ? (
          <p className={`${styles.msg} ${styles.successMsg}`}>
            Check your email to confirm!
          </p>
        ) : null}
        {error ? <p className={`${styles.msg} ${styles.errorMsg}`}>{error}</p> : null}
      </form>
    </div>
  );
}
