import { apiRequest } from '@/lib/api';
import { ApiResponse, ResearchFocus } from './types';

export const researchFocusService = {
  getAll: async (): Promise<ApiResponse<ResearchFocus[]>> => {
    return apiRequest<ResearchFocus[]>({
      method: 'GET',
      url: '/research-focus',
    });
  },

  getById: async (id: string): Promise<ApiResponse<ResearchFocus>> => {
    return apiRequest<ResearchFocus>({
      method: 'GET',
      url: `/research-focus/${id}`,
    });
  },

  create: async (data: Partial<ResearchFocus>): Promise<ApiResponse<ResearchFocus>> => {
    return apiRequest<ResearchFocus>({
      method: 'POST',
      url: '/research-focus',
      data,
    });
  },

  update: async (id: string, data: Partial<ResearchFocus>): Promise<ApiResponse<ResearchFocus>> => {
    return apiRequest<ResearchFocus>({
      method: 'PUT',
      url: `/research-focus/${id}`,
      data,
    });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>({
      method: 'DELETE',
      url: `/research-focus/${id}`,
    });
  },
};
