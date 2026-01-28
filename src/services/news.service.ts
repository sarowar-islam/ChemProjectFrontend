import { apiRequest } from '@/lib/api';
import { News, ApiResponse } from './types';

export const newsService = {
  async getNews(): Promise<ApiResponse<News[]>> {
    const response = await apiRequest<News[]>({
      method: 'GET',
      url: '/news',
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async getRecentNews(limit: number = 3): Promise<ApiResponse<News[]>> {
    const response = await apiRequest<News[]>({
      method: 'GET',
      url: '/news/recent',
      params: { limit },
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async getNewsById(id: string): Promise<ApiResponse<News>> {
    const response = await apiRequest<News>({
      method: 'GET',
      url: `/news/${id}`,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async createNews(news: Omit<News, 'id' | 'date'>): Promise<ApiResponse<News>> {
    const response = await apiRequest<News>({
      method: 'POST',
      url: '/news',
      data: news,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async updateNews(id: string, news: Partial<Omit<News, 'id' | 'date'>>): Promise<ApiResponse<News>> {
    const response = await apiRequest<News>({
      method: 'PUT',
      url: `/news/${id}`,
      data: news,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async deleteNews(id: string): Promise<ApiResponse<void>> {
    const response = await apiRequest<void>({
      method: 'DELETE',
      url: `/news/${id}`,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true };
  },
};
