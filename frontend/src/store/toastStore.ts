import { create } from 'zustand';
import type { Toast } from '@/components/ui/Toast';

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, message, type, duration };
    set((state) => ({ toasts: [...state.toasts, toast] }));
  },
  removeToast: (id) => {
    // console.log('🗑️ Removing toast:', id);
    set((state) => {
      const filtered = state.toasts.filter((t) => t.id !== id);
      // console.log('🗑️ Toasts after removal:', filtered.length);
      return { toasts: filtered };
    });
  },
  success: (message, duration) => {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, message, type: 'success', duration };
    set((state) => ({ toasts: [...state.toasts, toast] }));
  },
  error: (message, duration = 7000) => {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, message, type: 'error', duration };
    // console.log('🔴 Toast error called:', { id, message, duration });
    set((state) => {
      const newToasts = [...state.toasts, toast];
      // console.log('🔴 Toast state updated, total toasts:', newToasts.length);
      return { toasts: newToasts };
    });
  },
  info: (message, duration) => {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, message, type: 'info', duration };
    set((state) => ({ toasts: [...state.toasts, toast] }));
  },
  warning: (message, duration) => {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, message, type: 'warning', duration };
    set((state) => ({ toasts: [...state.toasts, toast] }));
  },
}));

