import Link from "next/link";
import type { Metadata } from "next";
import type { HobbyProgressEntry } from "@evalieu/common";
import { Masthead } from "@/components/newspaper/Masthead";
import { getHobbies } from "@/lib/api";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Hobbies · The Eva Times",
  description: "Creative pursuits, practice logs, and progress updates.",
};

function sortEntriesByDate(entries: HobbyProgressEntry[]): HobbyProgressEntry[] {
  return [...entries].sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
}

export default async function HobbiesIndexPage() {
  const hobbiesRaw = await getHobbies();

  const grouped = hobbiesRaw.reduce<Record<string, typeof hobbiesRaw>>((acc, h) => {
    const cat = (h.category || "other").toLowerCase();
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(h);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  return (
    <>
      <Masthead issueLine="SECTION · HOBBIES" />
      <main className={styles.main}>
        <div className={styles.navRow}>
          <Link href="/" className={styles.back}>
            ← Front page
          </Link>
        </div>
        <h1 className={styles.head}>Hobbies</h1>
        <p className={styles.intro}>
          Notes from ongoing projects — organized by pursuit. Each hobby keeps a dated log so you can see how practice
          adds up over time.
        </p>

        {categories.map((slug) => {
          const rows = [...grouped[slug]].sort((a, b) => a.name.localeCompare(b.name));
          return (
            <section key={slug} className={styles.section}>
              <h2 className={styles.sectionTitle}>{slug}</h2>
              <ul className={styles.grid}>
                {rows.map((hobby) => {
                  const entries = Array.isArray(hobby.entries) ? hobby.entries : [];
                  const milestones = entries.filter((e) => e.milestone).length;
                  const sorted = sortEntriesByDate(entries);
                  const latest = sorted[0];
                  const startedLabel = hobby.startedAt ? new Date(hobby.startedAt).toLocaleDateString() : "—";
                  const latestPreview = latest?.note?.slice(0, 140).trim();

                  return (
                    <li key={hobby.id}>
                      <Link href={`/hobbies/${hobby.id}`} className={styles.card}>
                        <span className={styles.catLabel}>{hobby.category}</span>
                        <h3 className={styles.name}>{hobby.name}</h3>
                        <p className={styles.started}>Started · {startedLabel}</p>
                        <div className={styles.latest}>
                          <span className={styles.latestLabel}>Latest</span>
                          {latestPreview ? (
                            <>
                              {latestPreview}
                              {(latest.note?.length ?? 0) > 140 ? "…" : ""}
                            </>
                          ) : (
                            <em>No entries yet.</em>
                          )}
                        </div>
                        <p className={styles.milestones}>
                          Milestones logged · <strong>{milestones}</strong>
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </main>
    </>
  );
}
