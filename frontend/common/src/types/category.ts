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
