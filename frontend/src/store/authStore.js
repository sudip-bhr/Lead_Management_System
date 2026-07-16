import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null, // JWT lives in memory only — NOT localStorage (XSS protection)
  isAuthenticated: false,
  isInitialized: false, // true after silent-refresh attempt on boot
  login: (userData, token) => {
    set({ user: userData, token, isAuthenticated: true, isInitialized: true });
  },
  setToken: (token) => {
    set({ token, isAuthenticated: true, isInitialized: true });
  },
  setInitialized: () => {
    set({ isInitialized: true });
  },
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false, isInitialized: true });
  },
}));

