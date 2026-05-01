export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  subcategoryId: number | null;
  subcategoryName: string | null;
  coverImageUrl: string | null;
  galleryUrls: string[];
  videoUrl: string | null;
  videoType: 'hosted' | 'youtube' | 'vimeo' | null;
  status: 'draft' | 'published' | 'archived';
  format:
    | 'article'
    | 'photo-caption'
    | 'embedded-game'
    | 'project-link'
    | 'list'
    | 'recipe'
    | 'tracking-entry'
    | 'quote';
  layoutHint: 'featured' | 'column' | 'brief' | 'sidebar' | 'pull-quote';
  issueId: number | null;
  tags: string[];
  publishedAt: string | null;
  commentCount: number;
  reactionCounts: Record<string, number>;
  quoteAuthor: string | null;
  quoteSource: string | null;
  gameUrl: string | null;
  gameType: 'iframe' | 'canvas' | 'link' | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}
