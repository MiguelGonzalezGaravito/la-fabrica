export const formatPrice = (value) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value)

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })

export const formatDateTime = (date) =>
  new Date(date).toLocaleString('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

export const statusColors = {
  PENDING_PAYMENT:  'bg-yellow-100 text-yellow-800',
  PAYMENT_VERIFIED: 'bg-orange-100 text-orange-800',
  PROCESSING:       'bg-blue-100 text-blue-800',
  SHIPPED:          'bg-purple-100 text-purple-800',
  DELIVERED:        'bg-green-100 text-green-800',
  CANCELLED:        'bg-red-100 text-red-800'
}
