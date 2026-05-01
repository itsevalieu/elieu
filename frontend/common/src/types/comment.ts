export interface Comment {
  id: number;
  postId: number;
  authorName: string;
  body: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
