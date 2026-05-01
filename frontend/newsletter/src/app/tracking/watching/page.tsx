import Link from "next/link";
import type { Metadata } from "next";
import { Masthead } from "@/components/newspaper/Masthead";
import { getTrackingByCategory } from "@/lib/api";
import styles from "../page.module.scss";

export const metadata: Metadata = {
  title: "Watching · The Eva Times",
  description: "Films and series worth remembering.",
};

export default async function WatchingTrackingPage() {
  const trackers = await getTrackingByCategory("watching");

  return (
    <>
      <Masthead issueLine="SECTION · WATCHING" />
      <main className={styles.main}>
        <div className={styles.navRow}>
          <Link href="/" className={styles.back}>
            ← Front page
          </Link>
        </div>
        <h1 className={styles.head}>Watching</h1>
        <p className={styles.intro}>
          Screen diary entries collected under <em>watching</em> pursuits — spoilers avoided, moods preserved.
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
                      {e.note?.trim() || <em>Watched marker</em>}
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

        {trackers.length === 0 ? <p className={styles.emptyMsg}>Nothing filed under watching yet.</p> : null}
      </main>
    </>
  );
}
