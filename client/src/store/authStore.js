// src/store/authStore.js
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  isLoggedIn: false,
  user: null,

  login: (userData) => set({ isLoggedIn: true, user: userData }),
  logout: () => set({ isLoggedIn: false, user: null }),
}));