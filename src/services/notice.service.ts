import { apiRequest } from '@/lib/api';
import { Notice, ApiResponse } from './types';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const noticeService = {
  async getNotices(): Promise<ApiResponse<Notice[]>> {
    const response = await apiRequest<Notice[]>({
      method: 'GET',
      url: '/notices',
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async getRecentNotices(limit: number = 3): Promise<ApiResponse<Notice[]>> {
    const response = await apiRequest<Notice[]>({
      method: 'GET',
      url: '/notices/recent',
      params: { limit },
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async getNoticeById(id: string): Promise<ApiResponse<Notice>> {
    const response = await apiRequest<Notice>({
      method: 'GET',
      url: `/notices/${id}`,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async createNotice(notice: Omit<Notice, 'id' | 'date'>): Promise<ApiResponse<Notice>> {
    const response = await apiRequest<Notice>({
      method: 'POST',
      url: '/notices',
      data: notice,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async updateNotice(id: string, updates: Partial<Notice>): Promise<ApiResponse<Notice>> {
    const response = await apiRequest<Notice>({
      method: 'PUT',
      url: `/notices/${id}`,
      data: updates,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async deleteNotice(id: string): Promise<ApiResponse<void>> {
    const response = await apiRequest<void>({
      method: 'DELETE',
      url: `/notices/${id}`,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true };
  },

  async uploadNoticeFile(file: File): Promise<ApiResponse<{ fileUrl: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${baseUrl}/upload/notice-file`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to upload notice file' };
      }
      return { success: true, data: { fileUrl: data.fileUrl } };
    } catch (error) {
      return { success: false, error: 'Network error uploading notice file' };
    }
  },
};
