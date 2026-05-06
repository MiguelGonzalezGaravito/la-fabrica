import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
      }, 80)
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])
  return null
}

import HomePage        from './pages/public/HomePage'
import CatalogPage     from './pages/public/CatalogPage'
import ProductPage     from './pages/public/ProductPage'
import LoginPage       from './pages/public/LoginPage'
import RegisterPage    from './pages/public/RegisterPage'

import CartPage        from './pages/customer/CartPage'
import CheckoutPage    from './pages/customer/CheckoutPage'
import OrdersPage      from './pages/customer/OrdersPage'
import OrderDetailPage from './pages/customer/OrderDetailPage'

import DashboardPage       from './pages/admin/DashboardPage'
import AdminProductsPage   from './pages/admin/AdminProductsPage'
import AdminOrdersPage     from './pages/admin/AdminOrdersPage'
import AdminCustomersPage  from './pages/admin/AdminCustomersPage'
import AdminPromotionsPage from './pages/admin/AdminPromotionsPage'

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  try {
    const raw = localStorage.getItem('user')
    const user = (raw && raw !== 'undefined' && raw !== 'null') ? JSON.parse(raw) : null
    if (user?.role !== 'ADMIN') return <Navigate to="/" replace />
  } catch {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/"             element={<HomePage />} />
        <Route path="/catalogo"     element={<CatalogPage />} />
        <Route path="/producto/:id" element={<ProductPage />} />
        <Route path="/login"        element={<LoginPage />} />
        <Route path="/registro"     element={<RegisterPage />} />

        <Route path="/carrito"      element={<PrivateRoute><CartPage /></PrivateRoute>} />
        <Route path="/checkout"     element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
        <Route path="/pedidos"      element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
        <Route path="/pedidos/:id"  element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />

        <Route path="/admin/dashboard"   element={<AdminRoute><DashboardPage /></AdminRoute>} />
        <Route path="/admin/productos"   element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
        <Route path="/admin/pedidos"     element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
        <Route path="/admin/clientes"    element={<AdminRoute><AdminCustomersPage /></AdminRoute>} />
        <Route path="/admin/promociones" element={<AdminRoute><AdminPromotionsPage /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
