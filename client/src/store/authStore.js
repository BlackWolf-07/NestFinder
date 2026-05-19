import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getMe } from '../api/auth';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem('token') || null,
      isAuthenticated: !!localStorage.getItem('token'),
      loading: !!localStorage.getItem('token'),

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true, loading: false });
        localStorage.setItem('token', token);
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
      },

      checkSession: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ user: null, token: null, isAuthenticated: false, loading: false });
          return;
        }

        set({ loading: true });
        try {
          const response = await getMe();
          // The API now returns { success: true, user: ... }
          const userData = response.success ? response.user : response;
          set({ user: userData, token, isAuthenticated: true, loading: false });
        } catch (error) {
          console.error('Session validation failed:', error);
          set({ user: null, token: null, isAuthenticated: false, loading: false });
          localStorage.removeItem('token');
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
