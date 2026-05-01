import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Masthead } from "@/components/newspaper/Masthead";
import { getPublishedPosts, getRecipeBySlug } from "@/lib/api";
import styles from "./page.module.scss";

type Props = {
  params: Promise<{ slug: string }>;
};

function RatingStars({ value }: { value: number }) {
  return (
    <span className={styles.starRow} aria-label={`${value} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= value ? undefined : styles.emptySpan}>
          ★
        </span>
      ))}
    </span>
  );
}

async function lookupPostSlug(postId: number | null): Promise<string | null> {
  if (postId == null) return null;
  const bundle = await getPublishedPosts(0, 900);
  return bundle.content.find((p) => p.id === postId)?.slug ?? null;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) return { title: "Not found" };
  return {
    title: `${recipe.name} · Recipes`,
    description: `${recipe.name} — kitchen notes.`,
  };
}

export default async function RecipeDetailPage(props: Props) {
  const { slug } = await props.params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) notFound();

  const postSlug = await lookupPostSlug(recipe.postId);
  const madeLabel =
    recipe.dateMade != null
      ? new Date(recipe.dateMade).toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : null;

  return (
    <>
      <Masthead issueLine="SECTION · RECIPES" />
      <main className={styles.main}>
        <div className={styles.navRow}>
          <Link href="/recipes" className={styles.back}>
            ← Recipe index
          </Link>
        </div>

        <article className={styles.hero}>
          <header>
            <h1 className={styles.title}>{recipe.name}</h1>
            <div className={styles.metaBand}>
              {recipe.cookTime ? (
                <p>
                  <strong>Cook time:</strong> {recipe.cookTime}
                </p>
              ) : null}
              {madeLabel ? (
                <p>
                  <strong>Made:</strong> {madeLabel}
                </p>
              ) : null}
              <p>
                <strong>Stars:</strong>{" "}
                {recipe.rating != null ? <RatingStars value={recipe.rating} /> : <span>Unrated</span>}
              </p>
            </div>
          </header>

          {recipe.photoUrl ? (
            <figure className={styles.figure}>
              {/* eslint-disable-next-line @next/next/no-img-element -- remote recipe photos */}
              <img src={recipe.photoUrl} alt="" className={styles.photo} />
            </figure>
          ) : null}
        </article>

        <section className={styles.section}>
          <h2>Ingredients</h2>
          <ul className={styles.ingredients}>
            {recipe.ingredients.map((ing, i) => (
              <li key={`${ing}-${i}`}>{ing}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Instructions</h2>
          <ol className={styles.steps}>
            {recipe.steps.map((step, i) => (
              <li key={`${step}-${i}`}>{step}</li>
            ))}
          </ol>
        </section>

        {postSlug ? (
          <div className={styles.related}>
            <p>Featured in the paper</p>
            <Link href={`/posts/${postSlug}`}>Read companion essay →</Link>
          </div>
        ) : null}
      </main>
    </>
  );
}
