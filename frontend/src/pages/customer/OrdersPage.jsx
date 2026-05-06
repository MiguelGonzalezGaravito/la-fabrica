import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ArrowRight } from 'lucide-react'
import PublicLayout from '../../components/common/PublicLayout'
import Spinner from '../../components/common/Spinner'
import { getOrders } from '../../api/orders.api'
import { formatPrice, formatDate } from '../../utils/formatters'

const STATUS = {
  PENDING_PAYMENT:  { label: 'Pendiente de pago', dot: '#F59E0B' },
  PAYMENT_VERIFIED: { label: 'Pago verificado',   dot: '#16A34A' },
  PROCESSING:       { label: 'En preparación',    dot: '#2563EB' },
  SHIPPED:          { label: 'Enviado',            dot: '#7C3AED' },
  DELIVERED:        { label: 'Entregado',          dot: '#6878A8' },
  CANCELLED:        { label: 'Cancelado',          dot: '#DC2626' },
}

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrders().then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <PublicLayout>

      {/* Header */}
      <div style={{ borderBottom: '1px solid #D0D8EE', padding: '48px 0 40px' }}>
        <div className="page-container">
          <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#A8B4D0', marginBottom: 12 }}>
            Mi cuenta
          </p>
          <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, color: '#1E3260' }}>
            Mis pedidos
          </h1>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: 48, paddingBottom: 80, maxWidth: 760 }}>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <Spinner />
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', borderTop: '1px solid #D0D8EE' }}>
            <Package size={32} style={{ color: '#D0D8EE', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 13, color: '#6878A8', marginBottom: 24 }}>Aún no tienes pedidos</p>
            <Link to="/catalogo"
              style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1E3260', textDecoration: 'none', borderBottom: '1px solid #1E3260', paddingBottom: 2 }}>
              Ver productos
            </Link>
          </div>
        ) : (
          <div style={{ borderTop: '1px solid #D0D8EE' }}>
            {orders.map(order => {
              const st = STATUS[order.status] || { label: order.status, dot: '#A8B4D0' }
              return (
                <Link key={order.id} to={`/pedidos/${order.id}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 0', borderBottom: '1px solid #D0D8EE', textDecoration: 'none', transition: 'background 0.15s', gap: 16 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F2F5FC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                  {/* Info izquierda */}
                  <div style={{ flex: 1, minWidth: 0, paddingLeft: 4 }}>
                    <p style={{ fontSize: 13, color: '#1E3260', marginBottom: 4, fontWeight: 500 }}>
                      {order.orderNumber}
                    </p>
                    <p style={{ fontSize: 11, color: '#A8B4D0', marginBottom: order.items?.length > 0 ? 10 : 0 }}>
                      {formatDate(order.createdAt)}
                    </p>
                    {order.items?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {order.items.slice(0, 2).map((item, i) => (
                          <span key={i} style={{ fontSize: 9, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#A8B4D0', border: '1px solid #D0D8EE', padding: '2px 6px' }}>
                            {item.productName} T.{item.size}
                          </span>
                        ))}
                        {order.items.length > 2 && (
                          <span style={{ fontSize: 9, color: '#A8B4D0' }}>+{order.items.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Info derecha */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0, paddingRight: 4 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 18, fontWeight: 300, color: '#1E3260', marginBottom: 4 }}>
                        {formatPrice(order.total)}
                      </p>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6878A8' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, flexShrink: 0 }} />
                        {st.label}
                      </span>
                    </div>
                    <ArrowRight size={13} style={{ color: '#D0D8EE' }} />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  )
}