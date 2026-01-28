import { apiRequest } from '@/lib/api';
import { TeamMember, ApiResponse } from './types';

export const teamService = {
  async getMembers(): Promise<ApiResponse<TeamMember[]>> {
    const response = await apiRequest<TeamMember[]>({
      method: 'GET',
      url: '/members',
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async getMemberByUsername(username: string): Promise<ApiResponse<TeamMember>> {
    const response = await apiRequest<TeamMember>({
      method: 'GET',
      url: `/members/username/${username}`,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async getMemberById(id: string): Promise<ApiResponse<TeamMember>> {
    const response = await apiRequest<TeamMember>({
      method: 'GET',
      url: `/members/${id}`,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async updateMemberProfile(
    username: string,
    updates: Partial<Pick<TeamMember, 'bio' | 'photoUrl' | 'googleScholarLink' | 'email' | 'phone' | 'expertise'>>
  ): Promise<ApiResponse<TeamMember>> {
    const response = await apiRequest<TeamMember>({
      method: 'PUT',
      url: `/members/username/${username}/profile`,
      data: updates,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async createMember(member: Omit<TeamMember, 'id'>): Promise<ApiResponse<TeamMember>> {
    const response = await apiRequest<TeamMember>({
      method: 'POST',
      url: '/members',
      data: member,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async deleteMember(id: string): Promise<ApiResponse<void>> {
    const response = await apiRequest<void>({
      method: 'DELETE',
      url: `/members/${id}`,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true };
  },

  async updateMember(id: string, updates: Partial<TeamMember>): Promise<ApiResponse<TeamMember>> {
    const response = await apiRequest<TeamMember>({
      method: 'PUT',
      url: `/members/${id}`,
      data: updates,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async uploadMemberPhoto(username: string, file: File): Promise<ApiResponse<{ photoUrl: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${baseUrl}/upload/member-photo/${username}`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, data: { photoUrl: data.photoUrl } };
      } else {
        return { success: false, error: data.error || 'Upload failed' };
      }
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: 'Failed to upload photo' };
    }
  },

  async updateMemberSettings(
    username: string,
    settings: {
      name?: string;
      username?: string;
      currentPassword?: string;
      newPassword?: string;
    }
  ): Promise<ApiResponse<TeamMember>> {
    const response = await apiRequest<TeamMember>({
      method: 'PUT',
      url: `/members/username/${username}/settings`,
      data: settings,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },
};
