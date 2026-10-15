import { create } from 'zustand';

interface AdminStore {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  darkMode: boolean;
  navigatingTo: string | null;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
  setNavigatingTo: (href: string | null) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  darkMode: false,
  navigatingTo: null,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleMobileSidebar: () => set((state) => ({ sidebarMobileOpen: !state.sidebarMobileOpen })),
  closeMobileSidebar: () => set({ sidebarMobileOpen: false }),
  setNavigatingTo: (href) => set({ navigatingTo: href }),
  toggleDarkMode: () =>
    set((state) => {
      const newDark = !state.darkMode;
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('dark', newDark);
        localStorage.setItem('darkMode', JSON.stringify(newDark));
      }
      return { darkMode: newDark };
    }),
  setDarkMode: (dark) => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', dark);
      localStorage.setItem('darkMode', JSON.stringify(dark));
    }
    set({ darkMode: dark });
  },
}));

// Toast notifications store
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  undoAction?: () => void;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    const duration = toast.duration || 5000;
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
