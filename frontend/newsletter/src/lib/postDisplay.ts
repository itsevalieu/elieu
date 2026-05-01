import type { Post } from "@evalieu/common";

export function leadExcerpt(post: Pick<Post, "excerpt" | "body">, maxLen = 200): string {
  const raw = (post.excerpt?.trim() || post.body?.trim() || "").replace(/\s+/g, " ");
  if (!raw.length) return "";
  if (raw.length <= maxLen) return raw;
  return `${raw.slice(0, Math.max(maxLen - 1, 0)).trimEnd()}…`;
}

export function topReactions(
  reactionCounts: Record<string, number>,
  take = 2
): [string, number][] {
  return Object.entries(reactionCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, take);
}

/** First featured post wins; otherwise uses the leading item. Returns null if empty. */
export function splitFeaturedAndRest(posts: Post[]): {
  featured: Post | null;
  rest: Post[];
} {
  if (!posts.length) return { featured: null, rest: [] };
  const ix = posts.findIndex((p) => p.layoutHint === "featured");
  if (ix >= 0) {
    const featured = posts[ix];
    return {
      featured,
      rest: posts.filter((_, i) => i !== ix),
    };
  }
  return { featured: posts[0], rest: posts.slice(1) };
}

export function distributeColumns<T>(items: T[], columnCount = 3): T[][] {
  const cols: T[][] = Array.from({ length: columnCount }, () => []);
  items.forEach((item, index) => {
    cols[index % columnCount]?.push(item);
  });
  return cols;
}
