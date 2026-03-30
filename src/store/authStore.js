import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      // Action to log in
      setAuth: (accessToken, refreshToken, user) => set({ 
        accessToken, 
        refreshToken,
        user, 
        isAuthenticated: true 
      }),

      // Action to update only access token (after refresh)
      setAccessToken: (accessToken) => set({ accessToken }),
      
      // Action to log out
      logout: () => {
        set({ 
          accessToken: null, 
          refreshToken: null,
          user: null, 
          isAuthenticated: false 
        });
        if (typeof window !== 'undefined') {
            localStorage.clear();
            sessionStorage.clear();
        }
      },
    }),
    {
      name: 'corporate-gift-auth', // The key in localStorage
    }
  )
);