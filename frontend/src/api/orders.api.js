import api from './axios'

export const createOrder       = data    => api.post('/orders', data)
export const getOrders         = ()      => api.get('/orders')
export const getOrder          = id      => api.get(`/orders/${id}`)
export const uploadPaymentProof = (id, file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post(`/orders/${id}/payment-proof`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
}

// Admin
export const adminGetOrders   = (status, promoCode) => {
  const params = {}
  if (status) params.status = status
  if (promoCode) params.promoCode = promoCode
  return api.get('/admin/orders', { params })
}
export const adminGetOrder    = id        => api.get(`/admin/orders/${id}`)
export const verifyPayment    = id        => api.put(`/admin/orders/${id}/verify-payment`)
export const updateOrderStatus = (id, status) =>
  api.put(`/admin/orders/${id}/status`, null, { params: { status } })
