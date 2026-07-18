import { apiRequest } from '@/lib/api';
import { AuthResponse, TeamMember, User } from './types';

export const authService = {
  async loginAdmin(email: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest<{ user: User; token: string }>({
      method: 'POST',
      url: '/auth/admin/login',
      data: { email, password },
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return {
      success: true,
      user: response.data.user,
      token: response.data.token,
    };
  },

  async loginMember(username: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest<{ user: User; token: string }>({
      method: 'POST',
      url: '/auth/member/login',
      data: { username, password },
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return {
      success: true,
      user: response.data.user,
      token: response.data.token,
    };
  },

  async requestMemberPasswordReset(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await apiRequest<{ message: string }>({
      method: 'POST',
      url: '/auth/member/forgot-password/request',
      data: { email },
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return {
      success: true,
      message: response.data.message,
    };
  },

  async verifyMemberPasswordResetCode(
    email: string,
    code: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await apiRequest<{ message: string }>({
      method: 'POST',
      url: '/auth/member/forgot-password/verify',
      data: { email, code },
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return {
      success: true,
      message: response.data.message,
    };
  },

  async confirmMemberPasswordReset(
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await apiRequest<{ message: string }>({
      method: 'POST',
      url: '/auth/member/forgot-password/confirm',
      data: { email, code, newPassword },
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return {
      success: true,
      message: response.data.message,
    };
  },

  async lookupMemberByIdentifier(identifier: string): Promise<{ success: boolean; data?: TeamMember; error?: string }> {
    const response = await apiRequest<TeamMember>({
      method: 'GET',
      url: '/members/lookup',
      params: { identifier },
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    return {
      success: true,
      data: response.data,
    };
  },

  async logout(): Promise<void> {
    // Optionally call backend logout endpoint to invalidate token
    try {
      await apiRequest<void>({
        method: 'POST',
        url: '/auth/logout',
      });
    } catch {
      // Ignore errors on logout
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  getStoredUser(): User | null {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  },

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  storeAuth(user: User, token: string): void {
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('auth_token', token);
  },

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  },

  isAdmin(): boolean {
    const user = this.getStoredUser();
    return user?.role === 'admin';
  },

  isMember(): boolean {
    const user = this.getStoredUser();
    return user?.role === 'member';
  },

  // Validate token with backend
  async validateToken(): Promise<boolean> {
    const token = this.getStoredToken();
    if (!token) return false;

    const response = await apiRequest<{ valid: boolean }>({
      method: 'GET',
      url: '/auth/validate',
    });

    return response.success && response.data.valid;
  },

  // Refresh the current user data from backend
  async refreshUser(): Promise<User | null> {
    const response = await apiRequest<User>({
      method: 'GET',
      url: '/auth/me',
    });

    if (response.success) {
      localStorage.setItem('auth_user', JSON.stringify(response.data));
      return response.data;
    }

    return null;
  },
};
