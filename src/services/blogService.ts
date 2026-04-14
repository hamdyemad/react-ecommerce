import { api } from '../api/client';
import type { Blog, BlogCategory, BlogParams, BlogResponse, BlogCategoryResponse, BlogComment } from '../types/api';

export const blogService = {
  getBlogs: async (params?: BlogParams): Promise<BlogResponse> => {
    const response = await api.get('/blogs', { params });
    return response.data;
  },

  getBlogBySlug: async (slug: string): Promise<{ status: boolean; data: Blog }> => {
    const response = await api.get(`/blogs/${slug}`);
    return response.data;
  },

  getCategories: async (params?: any): Promise<BlogCategoryResponse> => {
    const response = await api.get('/blog-categories', { params });
    return response.data;
  },

  getCategoryBySlug: async (slug: string): Promise<{ status: boolean; data: BlogCategory }> => {
    const response = await api.get(`/blog-categories/${slug}`);
    return response.data;
  },

  addComment: async (blogId: number | string, comment: string): Promise<{ status: boolean; data: BlogComment }> => {
    const response = await api.post(`/blogs/${blogId}/comments`, { comment });
    return response.data;
  }
};
