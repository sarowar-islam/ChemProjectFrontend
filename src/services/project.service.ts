import { apiRequest } from '@/lib/api';
import { Project, ApiResponse } from './types';

export const projectService = {
  async getProjects(): Promise<ApiResponse<Project[]>> {
    const response = await apiRequest<Project[]>({
      method: 'GET',
      url: '/projects',
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async getProjectById(id: string): Promise<ApiResponse<Project>> {
    const response = await apiRequest<Project>({
      method: 'GET',
      url: `/projects/${id}`,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async createProject(project: Omit<Project, 'id'>): Promise<ApiResponse<Project>> {
    const response = await apiRequest<Project>({
      method: 'POST',
      url: '/projects',
      data: project,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<ApiResponse<Project>> {
    const response = await apiRequest<Project>({
      method: 'PUT',
      url: `/projects/${id}`,
      data: updates,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    const response = await apiRequest<void>({
      method: 'DELETE',
      url: `/projects/${id}`,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true };
  },
};
