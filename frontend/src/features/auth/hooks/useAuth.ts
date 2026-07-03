import { create } from 'zustand';
import api from '../../../services/api';

interface User {
  id: number;
  username: string;
  full_name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,

  login: async (username: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('access_token', res.data.access_token);
      set({ user: res.data.user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    set({ user: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data });
    } catch {
      localStorage.removeItem('access_token');
    }
  },
}));