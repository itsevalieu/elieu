"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { Category } from "@evalieu/common";
import styles from "./CategoryStrip.module.scss";

type Props = { categories: Category[] };

export function CategoryStrip({ categories }: Props) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setQuery("");
  }

  function toggleCategory(slug: string) {
    setExpandedSlug((prev) => (prev === slug ? null : slug));
    setSearchOpen(false);
  }

  function toggleSearch() {
    setSearchOpen((v) => !v);
    setExpandedSlug(null);
  }

  if (!categories.length) return null;
  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  const expanded = sorted.find((c) => c.slug === expandedSlug) ?? null;

  return (
    <nav className={styles.wrapper} aria-label="Sections">
      <div className={styles.nav}>
        {sorted.map((c, i) => {
          const isActive = expandedSlug === c.slug;
          const hasSubs = c.subcategories && c.subcategories.length > 0;
          return (
            <span
              key={c.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--spacing-sm)",
              }}
            >
              {i > 0 ? <span className={styles.sep}>·</span> : null}
              {hasSubs ? (
                <button
                  type="button"
                  className={`${styles.catBtn}${isActive ? ` ${styles.catBtnActive}` : ""}`}
                  aria-expanded={isActive}
                  onClick={() => toggleCategory(c.slug)}
                >
                  {c.name}
                </button>
              ) : (
                <Link href={`/categories/${c.slug}`} className={styles.link}>
                  {c.name}
                </Link>
              )}
            </span>
          );
        })}
        <span className={styles.sep}>·</span>
        <a href={process.env.NEXT_PUBLIC_PORTFOLIO_URL ?? "/"} className={styles.link}>Portfolio</a>
        <span className={styles.sep}>·</span>
        <button
          type="button"
          className={styles.searchBtn}
          aria-label="Toggle search"
          aria-expanded={searchOpen}
          onClick={toggleSearch}
        >
          <Search size={14} strokeWidth={2} aria-hidden />
        </button>
      </div>

      {expanded && expanded.subcategories.length > 0 && (
        <div className={styles.subBar}>
          <Link
            href={`/categories/${expanded.slug}`}
            className={styles.subLink}
          >
            All {expanded.name}
          </Link>
          {expanded.subcategories.map((s) => (
            <Link
              key={s.id}
              href={`/categories/${expanded.slug}?sub=${s.slug}`}
              className={styles.subLink}
            >
              {s.name}
            </Link>
          ))}
        </div>
      )}

      {searchOpen && (
        <form className={styles.searchBar} onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="search"
            className={styles.searchInput}
            placeholder="Search posts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className={styles.searchSubmit}>
            Go
          </button>
        </form>
      )}
    </nav>
  );
}
