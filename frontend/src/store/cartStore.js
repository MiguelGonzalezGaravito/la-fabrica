import { create } from 'zustand'
import toast from 'react-hot-toast'
import * as cartApi from '../api/cart.api'

export const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,
  open: false,

  setOpen: (open) => set({ open }),

  fetchCart: async () => {
    try {
      set({ loading: true })
      const res = await cartApi.getCart()
      set({ cart: res.data })
    } catch {
      // no autenticado
    } finally {
      set({ loading: false })
    }
  },

  addItem: async (variantId, quantity = 1) => {
    const res = await cartApi.addItem({ variantId, quantity })
    set({ cart: res.data, open: true })
    return res.data
  },

  updateItem: async (itemId, quantity) => {
    try {
      const res = await cartApi.updateItem(itemId, quantity)
      set({ cart: res.data })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar el carrito')
    }
  },

  removeItem: async (itemId) => {
    try {
      const res = await cartApi.removeItem(itemId)
      set({ cart: res.data })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar el producto')
    }
  },

  clearCart: async () => {
    await cartApi.clearCart()
    set({ cart: null })
  },

  applyPromo: async (code) => {
    const res = await cartApi.applyPromo(code)
    set({ cart: res.data })
    return res.data
  },

  removePromo: async () => {
    const res = await cartApi.removePromo()
    set({ cart: res.data })
  },

  itemCount: () => get().cart?.itemCount || 0
}))
