import { apiRequest } from '@/lib/api';
import { ApiResponse } from './types';

export interface ScholarProfile {
  name: string;
  affiliation: string;
  imageUrl: string;
  interests: string;
  totalCitations: number;
  hIndex: number;
  i10Index: number;
}

export interface ScholarPublication {
  title: string;
  authors: string[];
  year: string;
  journal: string;
  citedBy: string;
  articleUrl: string;
  scholarId: string;
}

export interface ScholarResponse {
  success: boolean;
  profile?: ScholarProfile;
  publications?: ScholarPublication[];
  error?: string;
  message?: string;
}

export interface MemberScholarResponse {
  success: boolean;
  member?: {
    id: string;
    name: string;
    googleScholarLink?: string;
  };
  profile?: ScholarProfile;
  publications?: ScholarPublication[];
  error?: string;
  message?: string;
}

export const scholarService = {
  /**
   * Get publications from the main site's Google Scholar profile
   */
  async getMainPublications(): Promise<ApiResponse<ScholarResponse>> {
    const response = await apiRequest<ScholarResponse>({
      method: 'GET',
      url: '/scholar/publications',
    });

    if (!response.success) {
      return { success: false, error: 'error' in response ? response.error : 'Unknown error' };
    }

    return { success: true, data: response.data };
  },

  /**
   * Get publications from a specific Google Scholar URL
   */
  async getPublicationsByUrl(scholarUrl: string): Promise<ApiResponse<ScholarResponse>> {
    const response = await apiRequest<ScholarResponse>({
      method: 'GET',
      url: '/scholar/publications/url',
      params: { scholarUrl },
    });

    if (!response.success) {
      return { success: false, error: 'error' in response ? response.error : 'Unknown error' };
    }

    return { success: true, data: response.data };
  },

  /**
   * Get publications for a specific team member
   */
  async getMemberPublications(memberId: string): Promise<ApiResponse<MemberScholarResponse>> {
    const response = await apiRequest<MemberScholarResponse>({
      method: 'GET',
      url: `/scholar/member/${memberId}/publications`,
    });

    if (!response.success) {
      return { success: false, error: 'error' in response ? response.error : 'Unknown error' };
    }

    return { success: true, data: response.data };
  },

  /**
   * Get profile stats from Google Scholar
   */
  async getProfileStats(): Promise<ApiResponse<ScholarResponse>> {
    const response = await apiRequest<ScholarResponse>({
      method: 'GET',
      url: '/scholar/profile',
    });

    if (!response.success) {
      return { success: false, error: 'error' in response ? response.error : 'Unknown error' };
    }

    return { success: true, data: response.data };
  },
};
