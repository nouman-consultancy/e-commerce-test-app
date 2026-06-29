import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: Omit<User, 'createdAt' | 'updatedAt'> | null;
  setUser: (user: AuthState['user']) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
