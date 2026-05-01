export interface Recommendation {
  id: number;
  type: 'book' | 'show' | 'movie' | 'other';
  title: string;
  note: string | null;
  submittedBy: string | null;
  status: 'pending' | 'reviewed';
  createdAt: string;
}
