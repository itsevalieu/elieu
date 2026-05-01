import type { Category, Issue, PagedResponse, Post } from "@evalieu/common";

type IssueApiRecord = Omit<Issue, "posts"> & { posts?: Post[] | null };

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { revalidate?: number }
): Promise<T> {
  const revalidate = options?.revalidate ?? 60;
  const fetchInit: RequestInit = { ...(options ?? {}) };
  delete (fetchInit as RequestInit & { revalidate?: number }).revalidate;
  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchInit,
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

function normalizeIssue(data: IssueApiRecord): Issue {
  return {
    ...data,
    posts: Array.isArray(data.posts) ? data.posts : [],
  };
}

/** Most recently published issue (first page). */
export async function getLatestIssue(): Promise<Issue | null> {
  const page =
    await apiFetch<PagedResponse<IssueApiRecord>>(`/api/issues?page=0&size=1`);
  const raw = page.content[0];
  return raw ? normalizeIssue(raw) : null;
}

export async function getIssueBySlug(slug: string): Promise<Issue | null> {
  const path = `/api/issues/${encodeURIComponent(slug)}`;
  const revalidate = 60;
  const res = await fetch(`${API_BASE}${path}`, { next: { revalidate } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  const raw = (await res.json()) as IssueApiRecord;
  return normalizeIssue(raw);
}

export async function getPublishedPosts(
  page = 0,
  size = 20,
  category?: string
): Promise<PagedResponse<Post>> {
  const qs = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (category) qs.set("category", category);
  return apiFetch<PagedResponse<Post>>(`/api/posts?${qs}`);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const path = `/api/posts/${encodeURIComponent(slug)}`;
  const revalidate = 60;
  const res = await fetch(`${API_BASE}${path}`, { next: { revalidate } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<Post>;
}

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/categories");
}

export async function listIssuesPaged(
  page = 0,
  size = 12
): Promise<PagedResponse<Issue>> {
  const qs = new URLSearchParams({ page: String(page), size: String(size) });
  const res = await apiFetch<PagedResponse<IssueApiRecord>>(`/api/issues?${qs}`);
  return {
    ...res,
    content: res.content.map(normalizeIssue),
  };
}
