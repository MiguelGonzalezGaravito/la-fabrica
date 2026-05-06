import { create } from 'zustand'

export const useAuthModalStore = create(set => ({
  isOpen: false,
  view: 'login',
  openLogin:    () => set({ isOpen: true, view: 'login' }),
  openRegister: () => set({ isOpen: true, view: 'register' }),
  close:        () => set({ isOpen: false }),
}))