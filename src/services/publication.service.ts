import { apiRequest } from '@/lib/api';
import { Publication, ApiResponse } from './types';

export const publicationService = {
  async getPublications(): Promise<ApiResponse<Publication[]>> {
    const response = await apiRequest<Publication[]>({
      method: 'GET',
      url: '/publications',
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async getPublicationsByMember(memberId: string): Promise<ApiResponse<Publication[]>> {
    const response = await apiRequest<Publication[]>({
      method: 'GET',
      url: `/publications/member/${memberId}`,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async getPublicationById(id: string): Promise<ApiResponse<Publication>> {
    const response = await apiRequest<Publication>({
      method: 'GET',
      url: `/publications/${id}`,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async createPublication(publication: Omit<Publication, 'id'>): Promise<ApiResponse<Publication>> {
    const response = await apiRequest<Publication>({
      method: 'POST',
      url: '/publications',
      data: publication,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async updatePublication(id: string, updates: Partial<Publication>): Promise<ApiResponse<Publication>> {
    const response = await apiRequest<Publication>({
      method: 'PUT',
      url: `/publications/${id}`,
      data: updates,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async deletePublication(id: string): Promise<ApiResponse<void>> {
    const response = await apiRequest<void>({
      method: 'DELETE',
      url: `/publications/${id}`,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true };
  },

  // Scrape publications from Google Scholar (handled by Spring Boot backend)
  async scrapeGoogleScholar(profileUrl: string): Promise<ApiResponse<Publication[]>> {
    const response = await apiRequest<Publication[]>({
      method: 'POST',
      url: '/publications/scrape-scholar',
      data: { scholarUrl: profileUrl },
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },
};
