"use client";

import { useState } from "react";
import type { Recommendation } from "@evalieu/common";
import { submitRecommendation } from "@/lib/api";
import styles from "./RecommendationForm.module.scss";

const TYPES: Recommendation["type"][] = ["book", "show", "movie", "other"];

type Props = {
  compact?: boolean;
};

export function RecommendationForm({ compact }: Props) {
  const [type, setType] = useState<Recommendation["type"]>("book");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const payload: Record<string, unknown> = {
      type,
      title: title.trim(),
      honeypot: honeypot.trim(),
    };
    const n = note.trim();
    if (n) payload.note = n;
    const by = submittedBy.trim();
    if (by) payload.submittedBy = by;

    setBusy(true);
    try {
      await submitRecommendation(payload);
      setSuccess(true);
      setTitle("");
      setNote("");
      setSubmittedBy("");
      setHoneypot("");
    } catch {
      setError("Could not send your suggestion. Try again later.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.widget}>
      {!compact ? (
        <h2 className={styles.title}>What should Eva check out?</h2>
      ) : null}
      <form className={styles.form} onSubmit={submit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="rec-type">
            Type
          </label>
          <select
            id="rec-type"
            className={styles.select}
            value={type}
            onChange={(evt) =>
              setType(evt.target.value as Recommendation["type"])
            }
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t === "show" ? "TV show" : t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="rec-title">
            Title *
          </label>
          <input
            id="rec-title"
            required
            className={styles.input}
            autoComplete="off"
            value={title}
            onChange={(evt) => setTitle(evt.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="rec-note">
            Note{" "}
            <span aria-hidden>(optional)</span>
          </label>
          <textarea
            id="rec-note"
            className={styles.textarea}
            rows={4}
            value={note}
            onChange={(evt) => setNote(evt.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="rec-by">
            Submitted by <span aria-hidden>(optional)</span>
          </label>
          <input
            id="rec-by"
            className={styles.input}
            maxLength={100}
            autoComplete="nickname"
            value={submittedBy}
            onChange={(evt) => setSubmittedBy(evt.target.value)}
          />
        </div>

        <label className={`${styles.honeypot}`}>
          Website
          <input
            name="companyWebsite"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(evt) => setHoneypot(evt.target.value)}
          />
        </label>

        <button type="submit" className={styles.submit} disabled={busy}>
          {busy ? "Sending…" : "Send recommendation"}
        </button>

        {success ? (
          <p className={styles.success} role="status">
            Thanks for the recommendation!
          </p>
        ) : null}
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
