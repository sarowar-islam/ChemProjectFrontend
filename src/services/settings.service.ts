import { apiRequest } from '@/lib/api';
import { ApiResponse } from './types';

export interface SiteSettings {
  id: string;
  googleScholarUrl: string | null;
  aboutUs: string | null;
  updatedAt: string;
}

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
        updatedAt: new Date().toISOString(),
      };
      return { success: true, data: defaultSettings };
    }

    return { success: true, data: response.data };
  },

  async updateSettings(updates: Partial<Pick<SiteSettings, 'googleScholarUrl' | 'aboutUs'>>): Promise<ApiResponse<SiteSettings>> {
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
};
