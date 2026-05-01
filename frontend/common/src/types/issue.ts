import type { Post } from './post';

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
