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
