import api from './axios'

export const getProducts       = params => api.get('/products', { params })
export const getAdminProducts  = params => api.get('/admin/products', { params })
export const getFeatured       = ()     => api.get('/products/featured')
export const getProduct        = id     => api.get(`/products/${id}`)

export const createProduct = (formData) =>
  api.post('/admin/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

export const updateProduct = (id, formData) =>
  api.put(`/admin/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })

export const deleteProduct    = id              => api.delete(`/admin/products/${id}`)
export const deleteImage      = (pid, iid)      => api.delete(`/admin/products/${pid}/images/${iid}`)
export const updateStock      = (variantId, stock) =>
  api.put(`/admin/products/variants/${variantId}/stock`, null, { params: { stock } })
