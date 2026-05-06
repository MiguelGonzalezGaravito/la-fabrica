import api from './axios'

export const getCart     = ()               => api.get('/cart')
export const addItem     = data             => api.post('/cart/items', data)
export const updateItem  = (id, quantity)   => api.put(`/cart/items/${id}`, null, { params: { quantity } })
export const removeItem  = id              => api.delete(`/cart/items/${id}`)
export const clearCart   = ()               => api.delete('/cart')
export const applyPromo  = code            => api.post('/cart/apply-promo', null, { params: { code } })
export const removePromo = ()              => api.delete('/cart/promo')
