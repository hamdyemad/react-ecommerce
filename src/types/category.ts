import type { Department } from './department';

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  icon?: string;
  summary?: string;
  products_count?: number;
  department?: Department;
  parent?: Category;
  sub_categories?: Category[];
  created_at?: string;
  updated_at?: string;
}
