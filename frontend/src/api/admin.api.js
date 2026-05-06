import api from './axios'

export const getDashboard       = ()           => api.get('/admin/dashboard')
export const getAdminCustomers  = (params)     => api.get('/admin/customers', { params })
export const updateCustomerType = (id, type)   => api.put(`/admin/customers/${id}/business-type`, null, { params: { businessType: type } })
export const getAdminPromotions = ()           => api.get('/admin/promotions')
export const createPromotion    = (data)       => api.post('/admin/promotions', data)
export const updatePromotion    = (id, data)   => api.put(`/admin/promotions/${id}`, data)
export const deletePromotion    = (id)         => api.delete(`/admin/promotions/${id}`)
export const notifyPromotion    = (id)         => api.post(`/admin/promotions/${id}/notify`)
export const getAdminProducts   = (params)     => api.get('/admin/products', { params })
export const toggleProductStatus = (id)       => api.put(`/admin/products/${id}/toggle-status`)
