import { useEffect, useState } from 'react'
import { Eye, Check, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/admin/AdminLayout'
import Spinner from '../../components/common/Spinner'
import { StatusBadge } from '../../components/ui'
import { adminGetOrders, adminGetOrder, verifyPayment, updateOrderStatus } from '../../api/orders.api'
import { formatPrice, formatDateTime } from '../../utils/formatters'

const STATUS_OPTS = [
  { value: '',                 label: 'Todos' },
  { value: 'PENDING_PAYMENT',  label: 'Pdte. pago' },
  { value: 'PAYMENT_VERIFIED', label: 'Verificado' },
  { value: 'PROCESSING',       label: 'Preparando' },
  { value: 'SHIPPED',          label: 'Enviado' },
  { value: 'DELIVERED',        label: 'Entregado' },
  { value: 'CANCELLED',        label: 'Cancelado' },
]

const NEXT_STATUS = { PAYMENT_VERIFIED: 'PROCESSING', PROCESSING: 'SHIPPED', SHIPPED: 'DELIVERED' }

export default function AdminOrdersPage() {
  const [orders,        setOrders]        = useState([])
  const [loading,       setLoading]       = useState(true)
  const [filter,        setFilter]        = useState('')
  const [promoFilter,   setPromoFilter]   = useState('')
  const [selected,      setSelected]      = useState(null)
  const [detail,        setDetail]        = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [acting,        setActing]        = useState(false)

  const loadOrders = (status = filter, promo = promoFilter) => {
    setLoading(true)
    adminGetOrders(status, promo).then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { loadOrders() }, [filter, promoFilter])

  const openDetail = async (order) => {
    setSelected(order); setLoadingDetail(true)
    try { const r = await adminGetOrder(order.id); setDetail(r.data) }
    catch { setDetail(null) } finally { setLoadingDetail(false) }
  }

  const handleVerify = async () => {
    setActing(true)
    try { await verifyPayment(detail.id); toast.success('Pago verificado'); const r = await adminGetOrder(detail.id); setDetail(r.data); loadOrders() }
    catch { toast.error('Error al verificar') } finally { setActing(false) }
  }

  const handleAdvance = async () => {
    const next = NEXT_STATUS[detail.status]; if (!next) return
    setActing(true)
    try { await updateOrderStatus(detail.id, next); const r = await adminGetOrder(detail.id); setDetail(r.data); loadOrders() }
    catch { toast.error('Error') } finally { setActing(false) }
  }

  const handleCancel = async () => {
    if (!confirm('¿Cancelar este pedido?')) return
    setActing(true)
    try { await updateOrderStatus(detail.id, 'CANCELLED'); const r = await adminGetOrder(detail.id); setDetail(r.data); loadOrders() }
    catch { toast.error('Error') } finally { setActing(false) }
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 300, color: '#111', marginBottom: 6 }}>Pedidos</h1>
            <p style={{ fontSize: 13, color: '#9CA3AF' }}>{orders.length} pedido{orders.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => loadOrders()} style={{ color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
            onMouseEnter={e => e.currentTarget.style.color = '#111'}
            onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}>
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Filtros */}
        <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {STATUS_OPTS.map(o => (
              <button key={o.value} onClick={() => { setFilter(o.value); setPromoFilter('') }}
                style={{
                  padding: '8px 16px',
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  background: filter === o.value && !promoFilter ? '#111' : 'none',
                  color: filter === o.value && !promoFilter ? '#fff' : '#6B7280',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!(filter === o.value && !promoFilter)) e.currentTarget.style.color = '#111' }}
                onMouseLeave={e => { if (!(filter === o.value && !promoFilter)) e.currentTarget.style.color = '#6B7280' }}>
                {o.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9CA3AF', flexShrink: 0 }}>Código promo</label>
            <input
              type="text"
              placeholder="ej. VERANO10"
              value={promoFilter}
              onChange={e => { setPromoFilter(e.target.value); setFilter('') }}
              style={{ borderBottom: '1px solid #E5E7EB', borderTop: 'none', borderLeft: 'none', borderRight: 'none', background: 'transparent', fontSize: 12, color: '#111', outline: 'none', padding: '4px 0', width: 160 }}
              onFocus={e => e.currentTarget.style.borderBottomColor = '#111'}
              onBlur={e => e.currentTarget.style.borderBottomColor = '#E5E7EB'}
            />
            {promoFilter && (
              <button onClick={() => setPromoFilter('')} style={{ fontSize: 11, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = '#111'}
                onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}>
                ✕ limpiar
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          {/* Lista */}
          <div style={{ flex: 1, background: '#fff', border: '1px solid #E5E7EB' }}>
            {loading ? (
              <div className="flex justify-center h-40 items-center"><Spinner /></div>
            ) : orders.length === 0 ? (
              <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', padding: '48px 0' }}>Sin pedidos</p>
            ) : (
              <div>
                {orders.map(order => (
                  <button key={order.id} onClick={() => openDetail(order)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '18px 28px',
                      background: selected?.id === order.id ? '#F9FAFB' : '#fff',
                      border: 'none',
                      borderBottom: '1px solid #E5E7EB',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (selected?.id !== order.id) e.currentTarget.style.background = '#F9FAFB' }}
                    onMouseLeave={e => { if (selected?.id !== order.id) e.currentTarget.style.background = '#fff' }}>
                    <div>
                      <p style={{ fontSize: 15, color: '#111', marginBottom: 5 }}>{order.orderNumber}</p>
                      <p style={{ fontSize: 12, color: '#9CA3AF' }}>{order.customerName} · {formatDateTime(order.createdAt)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                      {order.promoCode && (
                        <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#B8912A', border: '1px solid #B8912A', padding: '2px 8px' }}>
                          {order.promoCode}
                        </span>
                      )}
                      <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 17, fontWeight: 300, color: '#111' }}>
                        {formatPrice(order.total)}
                      </span>
                      <StatusBadge status={order.status} />
                      <Eye size={13} color="#D1D5DB" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalle */}
          {selected && (
            <div style={{ width: 320, flexShrink: 0, background: '#fff', border: '1px solid #E5E7EB', alignSelf: 'flex-start', position: 'sticky', top: 16, maxHeight: 'calc(100vh - 8rem)', overflowY: 'auto' }}>
              {loadingDetail ? <div className="flex justify-center p-8"><Spinner /></div> : detail ? (
                <div>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 15, color: '#111' }}>{detail.orderNumber}</p>
                    <StatusBadge status={detail.status} />
                  </div>

                  <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB' }}>
                    {[['Cliente', detail.customerName], ['Email', detail.customerEmail], ['Dir.', `${detail.shippingAddress}, ${detail.shippingCity}`]].map(([k, v]) => (
                      <div key={k} style={{ fontSize: 13, marginBottom: 8 }}>
                        <span style={{ color: '#9CA3AF' }}>{k}: </span>
                        <span style={{ color: '#111' }}>{v}</span>
                      </div>
                    ))}
                    {detail.notes && (
                      <div style={{ fontSize: 13 }}>
                        <span style={{ color: '#9CA3AF' }}>Notas: </span>
                        <span style={{ color: '#111', fontStyle: 'italic' }}>{detail.notes}</span>
                      </div>
                    )}
                    {detail.promoCode && (
                      <div style={{ fontSize: 13, marginTop: 8 }}>
                        <span style={{ color: '#9CA3AF' }}>Promo: </span>
                        <span style={{ color: '#B8912A', letterSpacing: '0.08em' }}>{detail.promoCode}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB' }}>
                    {detail.items?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                        <span style={{ color: '#6B7280' }}>{item.productName} T.{item.size} ×{item.quantity}</span>
                        <span style={{ color: '#111' }}>{formatPrice(item.subtotal)}</span>
                      </div>
                    ))}
                    {detail.discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#16A34A', marginBottom: 4 }}>
                        <span>Descuento {detail.promoCode ? `(${detail.promoCode})` : ''}</span>
                        <span>−{formatPrice(detail.discount)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"Cormorant Garamond", serif', fontSize: 16, fontWeight: 300, color: '#111', paddingTop: 12, borderTop: '1px solid #E5E7EB', marginTop: 4 }}>
                      <span>Total</span><span>{formatPrice(detail.total)}</span>
                    </div>
                  </div>

                  {/* Comprobante */}
                  <div style={{ margin: '16px 24px', padding: 14, border: `1px solid ${detail.paymentProof ? 'rgba(22,163,74,0.2)' : '#E5E7EB'}`, background: detail.paymentProof ? '#F0FDF4' : '#F9FAFB' }}>
                    <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500, marginBottom: 8, color: detail.paymentProof ? '#16A34A' : '#9CA3AF' }}>
                      {detail.paymentProof ? 'Comprobante recibido' : 'Sin comprobante'}
                    </p>
                    {detail.paymentProof && (
                      <>
                        <a href={detail.paymentProof.imageUrl} target="_blank" rel="noreferrer">
                          <img src={detail.paymentProof.imageUrl} alt="Comprobante"
                            style={{ width: '100%', objectFit: 'cover', maxHeight: 160, border: '1px solid #E5E7EB', marginBottom: 8, cursor: 'pointer', opacity: 1, transition: 'opacity 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
                            onMouseLeave={e => e.currentTarget.style.opacity = 1} />
                        </a>
                        <p style={{ fontSize: 11, color: '#9CA3AF' }}>{formatDateTime(detail.paymentProof.uploadedAt)}</p>
                      </>
                    )}
                  </div>

                  {/* Acciones */}
                  <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {detail.status === 'PENDING_PAYMENT' && (
                      <button onClick={handleVerify} disabled={acting}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '12px 0', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', background: '#111', color: '#fff', border: 'none', cursor: acting ? 'not-allowed' : 'pointer', opacity: acting ? 0.6 : 1, transition: 'opacity 0.15s' }}
                        onMouseEnter={e => { if (!acting) e.currentTarget.style.opacity = '0.8' }}
                        onMouseLeave={e => { if (!acting) e.currentTarget.style.opacity = '1' }}>
                        <Check size={13} /> {acting ? 'Verificando...' : 'Verificar pago'}
                      </button>
                    )}
                    {NEXT_STATUS[detail.status] && (
                      <button onClick={handleAdvance} disabled={acting}
                        style={{ width: '100%', padding: '12px 0', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', background: '#fff', color: '#111', border: '1px solid #111', cursor: acting ? 'not-allowed' : 'pointer', opacity: acting ? 0.6 : 1, transition: 'all 0.15s' }}
                        onMouseEnter={e => { if (!acting) { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fff' } }}
                        onMouseLeave={e => { if (!acting) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#111' } }}>
                        {acting ? 'Actualizando...' : `→ ${STATUS_OPTS.find(o => o.value === NEXT_STATUS[detail.status])?.label}`}
                      </button>
                    )}
                    {detail.status !== 'CANCELLED' && detail.status !== 'DELIVERED' && (
                      <button onClick={handleCancel} disabled={acting}
                        style={{ width: '100%', padding: '12px 0', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', background: '#fff', color: '#DC2626', border: '1px solid #FECACA', cursor: acting ? 'not-allowed' : 'pointer', opacity: acting ? 0.6 : 1, transition: 'all 0.15s' }}
                        onMouseEnter={e => { if (!acting) { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.color = '#fff' } }}
                        onMouseLeave={e => { if (!acting) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#DC2626' } }}>
                        Cancelar pedido
                      </button>
                    )}
                  </div>
                </div>
              ) : <p style={{ padding: 24, fontSize: 13, color: '#6B7280' }}>Error al cargar</p>}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
