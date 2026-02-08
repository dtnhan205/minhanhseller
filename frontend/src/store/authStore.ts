// @ts-ignore - zustand types will be available after npm install
import { create } from 'zustand';
// @ts-ignore
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authApi } from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

type SetState<T> = (partial: T | Partial<T> | ((state: T) => T | Partial<T>)) => void;

export const useAuthStore = create<AuthState>()(
  persist(
    (set: SetState<AuthState>) => ({
      user: null,
      token: null,
      setAuth: (user: User, token: string) => {
        localStorage.setItem('token', token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
        set({ user: null, token: null });
      },
      updateUser: (user: User) => set({ user }),
      refreshUser: async () => {
        try {
          const updatedUser = await authApi.me();
          set({ user: updatedUser });
        } catch (err) {
          // console.error('Failed to refresh user:', err);
          // Don't throw error, just log it
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state: AuthState) => ({ user: state.user, token: state.token }),
    }
  )
);

