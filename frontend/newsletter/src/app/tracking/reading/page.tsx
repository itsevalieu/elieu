import Link from "next/link";
import type { Metadata } from "next";
import { Masthead } from "@/components/newspaper/Masthead";
import { getTrackingByCategory } from "@/lib/api";
import styles from "../page.module.scss";

export const metadata: Metadata = {
  title: "Reading list · The Eva Times",
  description: "Books and essays on rotation.",
};

export default async function ReadingTrackingPage() {
  const trackers = await getTrackingByCategory("reading");

  return (
    <>
      <Masthead issueLine="SECTION · READING" />
      <main className={styles.main}>
        <div className={styles.navRow}>
          <Link href="/" className={styles.back}>
            ← Front page
          </Link>
        </div>
        <h1 className={styles.head}>Reading</h1>
        <p className={styles.intro}>
          Highlights from notebooks and backlog lists — mirrored from the hobbies ledger under the{" "}
          <em>reading</em> tag.
        </p>

        {trackers.map((t) => {
          const rows = [...(Array.isArray(t.entries) ? t.entries : [])].sort(
            (a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime(),
          );
          return (
            <section key={t.id} className={styles.series}>
              <h2 className={styles.seriesTitle}>{t.name}</h2>
              {rows.length === 0 ? (
                <p className={styles.emptyMsg}>Nothing logged yet.</p>
              ) : (
                <ul className={styles.list}>
                  {rows.map((e) => (
                    <li key={e.id}>
                      {e.note?.trim() || <em>Milestone marker</em>}
                      <span className={styles.dim}>
                        ({new Date(e.entryDate).toLocaleDateString()})
                        {e.milestone ? " · milestone" : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}

        {trackers.length === 0 ? <p className={styles.emptyMsg}>Nothing filed under reading yet.</p> : null}
      </main>
    </>
  );
}
