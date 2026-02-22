import { create } from 'zustand';

type AuthView = 'login' | 'signup' | 'forgot-password' | 'verification-sent';

interface AuthModalStore {
  isOpen: boolean;
  view: AuthView;
  onOpen: (view?: AuthView) => void;
  onClose: () => void;
  setView: (view: AuthView) => void;
}

export const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false,
  view: 'login',
  onOpen: (view = 'login') => set({ isOpen: true, view }),
  onClose: () => set({ isOpen: false }),
  setView: (view) => set({ view }),
}));
