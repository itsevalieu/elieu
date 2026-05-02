"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Post, PagedResponse } from "@evalieu/common";
import { Masthead } from "@/components/newspaper/Masthead";
import styles from "./page.module.scss";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const qs = new URLSearchParams({ q: q.trim(), page: "0", size: "50" });
      const res = await fetch(`${API_BASE}/api/posts/search?${qs}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = (await res.json()) as PagedResponse<Post>;
      setResults(data.content);
      setTotal(data.totalElements);
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQ) void doSearch(initialQ);
  }, [initialQ, doSearch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.replace(`/search?q=${encodeURIComponent(query.trim())}`);
    void doSearch(query);
  }

  return (
    <>
      <Masthead />
      <div className={styles.container}>
        <h1 className={styles.heading}>Search</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="search"
            className={styles.input}
            placeholder="Search posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? "..." : "Search"}
          </button>
        </form>

        {searched && !loading && (
          <p className={styles.meta}>
            {total} result{total !== 1 ? "s" : ""} for &ldquo;{initialQ || query}&rdquo;
          </p>
        )}

        <ul className={styles.results}>
          {results.map((post) => (
            <li key={post.id} className={styles.item}>
              <Link href={`/posts/${post.slug}`} className={styles.link}>
                <h2 className={styles.postTitle}>{post.title}</h2>
                {post.excerpt && (
                  <p className={styles.excerpt}>{post.excerpt}</p>
                )}
                <span className={styles.postMeta}>
                  {post.subcategoryName ?? post.categoryName}
                  {post.publishedAt
                    ? ` · ${new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`
                    : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {searched && !loading && results.length === 0 && (
          <p className={styles.empty}>No posts matched your search.</p>
        )}
      </div>
    </>
  );
}
