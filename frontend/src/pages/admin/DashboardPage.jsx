import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Users, DollarSign, TrendingUp, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import AdminLayout from '../../components/admin/AdminLayout'
import Spinner from '../../components/common/Spinner'
import { StatusBadge } from '../../components/ui'
import { getDashboard } from '../../api/admin.api'
import { adminGetOrders } from '../../api/orders.api'
import { formatPrice, formatDateTime } from '../../utils/formatters'

function Stat({ icon: Icon, label, value }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ width: 44, height: 44, background: '#F9FAFB', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color="#6B7280" />
      </div>
      <div>
        <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 6 }}>{label}</p>
        <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, fontWeight: 300, color: '#111', lineHeight: 1 }}>{value}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats,   setStats]   = useState(null)
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDashboard(), adminGetOrders()])
      .then(([s, o]) => { setStats(s.data); setOrders(o.data.slice(0, 8)) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <AdminLayout><div className="flex justify-center h-64 items-center"><Spinner /></div></AdminLayout>

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Título */}
        <div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 300, color: '#111', marginBottom: 6 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF' }}>Resumen del negocio</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <Stat icon={ShoppingCart} label="Pedidos hoy"    value={stats?.todayOrders ?? 0} />
          <Stat icon={TrendingUp}   label="Pedidos semana" value={stats?.weekOrders ?? 0} />
          <Stat icon={DollarSign}   label="Ingresos hoy"   value={formatPrice(stats?.todayRevenue ?? 0)} />
          <Stat icon={Users}        label="Clientes"        value={stats?.totalCustomers ?? 0} />
        </div>

        {/* Gráfica + resumen */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }} className="lg:grid-cols-3-custom">
          <div style={{ display: 'grid', gap: 16 }} className="grid lg:grid-cols-3">

            {/* Gráfica */}
            <div style={{ gridColumn: 'span 2', background: '#fff', border: '1px solid #E5E7EB', padding: '28px 28px 24px' }}>
              <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 24 }}>
                Ingresos últimos 7 días
              </p>
              {stats?.revenueByDay?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.revenueByDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                    <Tooltip formatter={v => [formatPrice(v), 'Ingresos']}
                      contentStyle={{ fontSize: 12, border: '1px solid #E5E7EB', background: '#fff', borderRadius: 0 }} />
                    <Bar dataKey="revenue" fill="#111111" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, fontSize: 13, color: '#9CA3AF' }}>
                  Sin datos aún
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#fff', border: '1px solid #E5E7EB', padding: '28px 24px', flex: 1 }}>
                <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 20 }}>
                  Estado del mes
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    ['Pedidos mes',        stats?.monthOrders ?? 0],
                    ['Ingresos mes',       formatPrice(stats?.monthRevenue ?? 0)],
                    ['Pdte. verificación', stats?.pendingPaymentOrders ?? 0],
                    ['Mayoristas',         stats?.wholesaleCustomers ?? 0],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6B7280' }}>{l}</span>
                      <span style={{ color: '#111', fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ border: '1px solid #E5E7EB', padding: '24px', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Clock size={14} color="#6B7280" />
                  <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6B7280' }}>Por verificar</p>
                </div>
                <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 48, fontWeight: 300, color: '#111', lineHeight: 1, marginBottom: 12 }}>
                  {stats?.pendingPaymentOrders ?? 0}
                </p>
                <Link to="/admin/pedidos" style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6B7280', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#111'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}>
                  Ver pedidos →
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Últimos pedidos */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid #E5E7EB' }}>
            <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9CA3AF' }}>Últimos pedidos</p>
            <Link to="/admin/pedidos" style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6B7280', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#111'}
              onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}>
              Ver todos →
            </Link>
          </div>
          <div>
            {orders.length === 0 ? (
              <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', padding: '40px 0' }}>Sin pedidos aún</p>
            ) : orders.map(order => (
              <Link key={order.id} to="/admin/pedidos"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid #E5E7EB', textDecoration: 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                <div>
                  <p style={{ fontSize: 14, color: '#111', marginBottom: 4 }}>{order.orderNumber}</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF' }}>{order.customerName} · {formatDateTime(order.createdAt)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 16, fontWeight: 300, color: '#111' }}>
                    {formatPrice(order.total)}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}
