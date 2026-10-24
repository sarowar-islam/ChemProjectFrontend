import { apiRequest } from '@/lib/api';
import { ApiResponse } from './types';

export interface SiteSettings {
  id: string;
  googleScholarUrl: string | null;
  aboutUs: string | null;
  heroImages?: string[];
  updatedAt: string;
}

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const settingsService = {
  async getSettings(): Promise<ApiResponse<SiteSettings>> {
    const response = await apiRequest<SiteSettings>({
      method: 'GET',
      url: '/settings',
    });

    if (!response.success) {
      // Return default settings if not found
      const defaultSettings: SiteSettings = {
        id: 'default',
        googleScholarUrl: 'https://scholar.google.com/citations?user=5oILmB0AAAAJ&hl=en',
        aboutUs: 'Welcome to Prof. Dr. Yunus Ahmed Research Group at Chittagong University of Engineering & Technology (CUET). Our research focuses on environmental remediation, resource recovery, nanomaterials, and cutting-edge wastewater treatment technologies.',
        heroImages: [],
        updatedAt: new Date().toISOString(),
      };
      return { success: true, data: defaultSettings };
    }

    return { success: true, data: response.data };
  },

  async updateSettings(updates: Partial<Pick<SiteSettings, 'googleScholarUrl' | 'aboutUs' | 'heroImages'>>): Promise<ApiResponse<SiteSettings>> {
    const response = await apiRequest<SiteSettings>({
      method: 'PUT',
      url: '/settings',
      data: updates,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async uploadHeroImage(file: File): Promise<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${baseUrl}/upload/hero-image`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to upload hero image' };
      }
      return { success: true, data: { imageUrl: data.imageUrl } };
    } catch (error) {
      return { success: false, error: 'Network error uploading hero image' };
    }
  },
};
