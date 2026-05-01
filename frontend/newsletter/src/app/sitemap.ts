import type { MetadataRoute } from "next";
import { apiFetch } from "@/lib/api";
import type { PagedResponse, Post, Category } from "@evalieu/common";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://newsletter.evalieu.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/issues`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/hobbies`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/recipes`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/recommendations`, changeFrequency: "weekly", priority: 0.5 },
  ];

  try {
    const postsPage = await apiFetch<PagedResponse<Post>>("/api/posts?size=500&page=0", { revalidate: 3600 });
    for (const p of postsPage.content) {
      entries.push({
        url: `${SITE_URL}/posts/${p.slug}`,
        lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  } catch {
    // API unavailable during build — static entries only
  }

  try {
    const categories = await apiFetch<Category[]>("/api/categories", { revalidate: 3600 });
    for (const c of categories) {
      entries.push({
        url: `${SITE_URL}/categories/${c.slug}`,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    // API unavailable during build
  }

  return entries;
}
