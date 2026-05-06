import { create } from 'zustand'

function parseUser() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw || raw === 'undefined' || raw === 'null') return null
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

export const useAuthStore = create(set => ({
  user:  parseUser(),
  token: localStorage.getItem('token') || null,

  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    set({ user, token })
  },

  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  isAuthenticated: () => !!localStorage.getItem('token'),
  isAdmin:      () => parseUser()?.role === 'ADMIN',
  isWholesale:  () => parseUser()?.businessType === 'WHOLESALE',
}))
