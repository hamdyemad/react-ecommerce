import type { PaginationMeta } from './common';

export interface BlogCategory {
  id: number;
  slug: string;
  title: string;
  description: string;
  blogs_count: number;
  image: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
  created_at: string;
  updated_at: string;
}

export interface BlogComment {
  id: number;
  comment: string;
  customer: {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    image: string;
    lang?: string;
    gender?: string;
    status?: boolean;
    verified?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface Blog {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  category: BlogCategory;
  views_count: number;
  comments_count: number;
  comments?: BlogComment[];
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
  created_at: string;
  updated_at: string;
  read_time?: string;
}

export interface BlogCategoryResponse {
  status: boolean;
  message: string;
  errors: any[];
  data: BlogCategory[];
  pagination: PaginationMeta;
}

export interface BlogResponse {
  status: boolean;
  message: string;
  errors: any[];
  data: Blog[];
  pagination: PaginationMeta;
}

export interface BlogParams {
  page?: number;
  per_page?: number;
  search?: string;
  blog_category_id?: number | string;
}
