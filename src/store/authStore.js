import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      // Action to log in
      setAuth: (token, user) => set({ 
        token, 
        user, 
        isAuthenticated: true 
      }),
      
      // Action to log out
      logout: () => set({ 
        token: null, 
        user: null, 
        isAuthenticated: false 
      }),
    }),
    {
      name: 'corporate-gift-auth', // The key in localStorage
    }
  )
);