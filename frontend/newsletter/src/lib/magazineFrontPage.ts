import type { Category, Post } from "@evalieu/common";
import { splitFeaturedAndRest } from "@/lib/postDisplay";

const STRIP_CAPACITY = 4;

export type MagazineStrip = {
  slug: string;
  name: string;
  posts: Post[];
};

export function partitionMagazineFrontPage(
  posts: Post[],
  categories: Category[],
): {
  featured: Post | null;
  strips: MagazineStrip[];
  remainder: Post[];
} {
  const { featured, rest } = splitFeaturedAndRest(posts);
  const bySlug = new Map<string, Post[]>();
  for (const p of rest) {
    const list = bySlug.get(p.categorySlug);
    if (list) list.push(p);
    else bySlug.set(p.categorySlug, [p]);
  }

  const orderedSlugs: string[] = [];
  const seen = new Set<string>();
  for (const c of [...categories].sort((a, b) => a.sortOrder - b.sortOrder)) {
    if (bySlug.has(c.slug)) {
      orderedSlugs.push(c.slug);
      seen.add(c.slug);
    }
  }
  for (const slug of [...bySlug.keys()].sort()) {
    if (!seen.has(slug)) orderedSlugs.push(slug);
  }

  const stripPostIds = new Set<number>();
  const strips: MagazineStrip[] = [];

  for (const slug of orderedSlugs) {
    const all = bySlug.get(slug) ?? [];
    const chunk = all.slice(0, STRIP_CAPACITY);
    chunk.forEach((p) => stripPostIds.add(p.id));
    if (chunk.length > 0) {
      const name =
        categories.find((c) => c.slug === slug)?.name ??
        chunk[0]?.categoryName ??
        slug;
      strips.push({ slug, name, posts: chunk });
    }
  }

  const remainder = rest.filter((p) => !stripPostIds.has(p.id));

  return { featured, strips, remainder };
}
