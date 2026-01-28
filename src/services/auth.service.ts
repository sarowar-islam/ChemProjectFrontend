import { apiRequest } from '@/lib/api';
import { AuthResponse, User } from './types';

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
