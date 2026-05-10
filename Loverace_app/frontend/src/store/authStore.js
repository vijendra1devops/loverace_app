import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isDummy, DEMO_USER } from '../services/dummyData';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: isDummy() ? DEMO_USER : null,
      token: isDummy() ? DEMO_USER.token : null,
      isAuthenticated: isDummy(),

      setAuth(user, token) {
        localStorage.setItem('lr_token', token);
        set({ user, token, isAuthenticated: true });
      },

      logout() {
        localStorage.removeItem('lr_token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser(patch) {
        set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user }));
      },
    }),
    {
      name: 'lr_auth',
      partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }),
    },
  ),
);
