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

export interface Issue {
  id: number;
  month: number;
  year: number;
  title: string;
  slug: string;
  layoutPreference: 'newspaper' | 'magazine';
  status: 'draft' | 'published';
  coverImageUrl: string | null;
  posts: Post[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
}

export interface Comment {
  id: number;
  postId: number;
  authorName: string;
  body: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Hobby {
  id: number;
  name: string;
  category: string;
  startedAt: string | null;
  entries: HobbyProgressEntry[];
  createdAt: string;
}

export interface HobbyProgressEntry {
  id: number;
  hobbyId: number;
  entryDate: string;
  note: string | null;
  milestone: boolean;
  photoUrl: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Recipe {
  id: number;
  name: string;
  slug: string;
  ingredients: string[];
  steps: string[];
  cookTime: string | null;
  rating: number | null;
  photoUrl: string | null;
  dateMade: string | null;
  postId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface SystemLog {
  id: number;
  severity: string;
  service: string;
  message: string;
  stackTrace: string | null;
  endpoint: string | null;
  loggedAt: string;
}

export interface AdminAuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  detail: Record<string, unknown> | null;
  performedAt: string;
}
