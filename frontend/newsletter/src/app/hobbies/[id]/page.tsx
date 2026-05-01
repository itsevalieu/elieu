import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Hobby } from "@evalieu/common";
import { Masthead } from "@/components/newspaper/Masthead";
import { getHobbyById } from "@/lib/api";
import styles from "./page.module.scss";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params;
  const num = Number.parseInt(id, 10);
  if (!Number.isFinite(num)) return { title: "Not found" };
  try {
    const hobby = await getHobbyById(num);
    return {
      title: `${hobby.name} · Hobbies`,
      description: hobby.name,
    };
  } catch {
    return { title: "Not found" };
  }
}

export default async function HobbyDetailPage(props: Props) {
  const { id } = await props.params;
  const num = Number.parseInt(id, 10);
  if (!Number.isFinite(num)) notFound();

  let hobby: Hobby;
  try {
    hobby = await getHobbyById(num);
  } catch (e) {
    if (String((e as Error).message).startsWith("HOBBY_NOT_FOUND")) notFound();
    throw e;
  }

  const entries = [...(Array.isArray(hobby.entries) ? hobby.entries : [])].sort(
    (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime(),
  );

  const startedLabel = hobby.startedAt ? new Date(hobby.startedAt).toLocaleDateString() : "—";

  return (
    <>
      <Masthead issueLine={`HOBBIES · ${hobby.name.toUpperCase()}`} />
      <main className={styles.main}>
        <div className={styles.navRow}>
          <Link href="/hobbies" className={styles.back}>
            ← All hobbies
          </Link>
        </div>

        <header className={styles.header}>
          <h1 className={styles.title}>{hobby.name}</h1>
          <div className={styles.meta}>
            <span>Category · {hobby.category}</span>
            <span>Started · {startedLabel}</span>
          </div>
        </header>

        {entries.length === 0 ? (
          <p className={styles.empty}>No progress entries filed for this pursuit yet.</p>
        ) : (
          <ol className={styles.timeline}>
            {entries.map((e) => (
              <li key={e.id} className={styles.item}>
                <article className={`${styles.itemInner} ${e.milestone ? styles.milestoneInner : ""}`}>
                  <p className={styles.entryDate}>
                    {new Date(e.entryDate).toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {e.milestone ? <div className={styles.milestoneRibbon}>Milestone</div> : null}
                  {e.note ? <p className={styles.note}>{e.note}</p> : null}
                  {e.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.photoUrl} alt="" className={styles.photo} />
                  ) : null}
                </article>
              </li>
            ))}
          </ol>
        )}
      </main>
    </>
  );
}
