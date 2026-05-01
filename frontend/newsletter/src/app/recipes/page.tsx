import Link from "next/link";
import type { Metadata } from "next";
import { Masthead } from "@/components/newspaper/Masthead";
import { getRecipes } from "@/lib/api";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Recipes · The Eva Times",
  description: "What’s cooking — notes from the kitchen with timings and verdicts.",
};

const PAGE_SIZE = 20;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

function StarDots({ rating }: { rating: number | null }) {
  if (rating == null || rating < 1) {
    return <p className={styles.meta}>No rating filed</p>;
  }
  return (
    <div className={styles.starRow} aria-label={`Rated ${rating} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rating ? styles.starFilled : styles.starEmpty}>
          ★
        </span>
      ))}
    </div>
  );
}

export default async function RecipesPage(props: Props) {
  const params = await props.searchParams;
  const pageRaw = Number.parseInt(params.page ?? "0", 10);
  const page = Number.isFinite(pageRaw) ? Math.max(0, pageRaw) : 0;

  const paged = await getRecipes(page, PAGE_SIZE);

  const first = page * PAGE_SIZE + 1;
  const lastFirst = Math.min((page + 1) * PAGE_SIZE, paged.totalElements || 0);
  const summary =
    paged.totalElements === 0
      ? "No recipes"
      : `Showing ${first}–${lastFirst} of ${paged.totalElements}`;

  return (
    <>
      <Masthead issueLine="SECTION · RECIPES" />
      <main className={styles.main}>
        <div className={styles.navRow}>
          <Link href="/" className={styles.back}>
            ← Front page
          </Link>
        </div>

        <h1 className={styles.head}>Recipes</h1>
        <p className={styles.intro}>
          Everyday dishes annotated with timings, shorthand stars, and the odd photograph pulled from notebook margins.
        </p>

        {paged.content.length === 0 ? (
          <p className={styles.intro}>Nothing on the chopping board yet.</p>
        ) : (
          <>
            <ul className={styles.grid}>
              {paged.content.map((recipe) => (
                <li key={recipe.id}>
                  <Link href={`/recipes/${recipe.slug}`} className={styles.link}>
                    <div className={styles.photoWrap}>
                      {recipe.photoUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element -- remote thumbnails */}
                          <img src={recipe.photoUrl} alt="" className={styles.photo} />
                        </>
                      ) : (
                        <div className={styles.photoPlaceholder}>No photo</div>
                      )}
                    </div>
                    <div className={styles.copy}>
                      <h2 className={styles.name}>{recipe.name}</h2>
                      {recipe.cookTime ? (
                        <p className={styles.meta}>Cook time · {recipe.cookTime}</p>
                      ) : (
                        <p className={styles.meta}>Cook time · —</p>
                      )}
                      <StarDots rating={recipe.rating} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <nav className={styles.pager} aria-label="Recipe pages">
              <span className={styles.pagerMuted}>{summary}</span>
              <div className={styles.pagerLinks}>
                {page <= 0 ? (
                  <span className={styles.pagerMuted}>← Previous</span>
                ) : (
                  <Link href={`/recipes?page=${page - 1}`}>← Previous</Link>
                )}
                {page + 1 >= paged.totalPages ? (
                  <span className={styles.pagerMuted}>Next →</span>
                ) : (
                  <Link href={`/recipes?page=${page + 1}`}>Next →</Link>
                )}
              </div>
            </nav>
          </>
        )}
      </main>
    </>
  );
}
