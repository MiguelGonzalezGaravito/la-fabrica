import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, X, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import PublicLayout from '../../components/common/PublicLayout'
import Spinner from '../../components/common/Spinner'
import { useCartStore } from '../../store/cartStore'
import { formatPrice } from '../../utils/formatters'

const iLabel = {
  fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
  color: '#A8B4D0', display: 'block', marginBottom: 8,
}

export default function CartPage() {
  const { cart, loading, fetchCart, updateItem, removeItem, applyPromo, removePromo } = useCartStore()
  const [promoCode,     setPromoCode]     = useState('')
  const [applyingPromo, setApplyingPromo] = useState(false)

  useEffect(() => { fetchCart() }, [])

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return
    setApplyingPromo(true)
    try {
      await applyPromo(promoCode.trim())
      toast.success('Código aplicado')
      setPromoCode('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Código inválido')
    } finally { setApplyingPromo(false) }
  }

  if (loading && !cart) return <PublicLayout><div className="flex justify-center py-20"><Spinner /></div></PublicLayout>

  const empty = !cart || cart.items?.length === 0

  return (
    <PublicLayout>

      {/* Header */}
      <div style={{ borderBottom: '1px solid #D0D8EE', padding: '48px 0 40px' }}>
        <div className="page-container">
          <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#A8B4D0', marginBottom: 12 }}>
            Tienda
          </p>
          <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, color: '#1E3260' }}>
            Mi carrito
          </h1>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: 48, paddingBottom: 80 }}>

        {empty ? (
          <div style={{ textAlign: 'center', padding: '80px 0', borderTop: '1px solid #D0D8EE' }}>
            <ShoppingBag size={32} style={{ color: '#D0D8EE', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 13, color: '#6878A8', marginBottom: 24 }}>Tu carrito está vacío</p>
            <Link to="/catalogo"
              style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1E3260', textDecoration: 'none', borderBottom: '1px solid #1E3260', paddingBottom: 2 }}>
              Ver productos
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 40 }} className="lg:grid-cols-3-custom">

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40, alignItems: 'start' }}
              className="grid-cols-stack">

              {/* ── Lista de items ── */}
              <div>
                <p style={iLabel}>
                  {cart.itemCount} {cart.itemCount === 1 ? 'artículo' : 'artículos'}
                </p>
                <div style={{ borderTop: '1px solid #D0D8EE' }}>
                  {cart.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: 20, padding: '24px 0', borderBottom: '1px solid #D0D8EE' }}>

                      {/* Imagen */}
                      <div style={{ width: 88, height: 88, background: '#F2F5FC', flexShrink: 0, overflow: 'hidden' }}>
                        {item.imageUrl
                          ? <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          : <div style={{ width: '100%', height: '100%', background: '#F2F5FC' }} />
                        }
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                          <p style={{ fontSize: 14, color: '#1E3260', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.productName}
                          </p>
                          <button onClick={() => removeItem(item.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8B4D0', flexShrink: 0, padding: 2, transition: 'color 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
                            onMouseLeave={e => e.currentTarget.style.color = '#A8B4D0'}>
                            <X size={13} />
                          </button>
                        </div>
                        <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A8B4D0', marginBottom: 14 }}>
                          Talla {item.size} · {item.color}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          {/* Cantidad */}
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D0D8EE' }}>
                            <button onClick={() => updateItem(item.id, item.quantity - 1)}
                              style={{ width: 30, height: 30, background: 'none', border: 'none', cursor: 'pointer', color: '#6878A8', fontSize: 16, transition: 'color 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#1E3260'}
                              onMouseLeave={e => e.currentTarget.style.color = '#6878A8'}>−</button>
                            <span style={{ width: 30, textAlign: 'center', fontSize: 13, color: '#1E3260', borderLeft: '1px solid #D0D8EE', borderRight: '1px solid #D0D8EE', lineHeight: '30px' }}>
                              {item.quantity}
                            </span>
                            <button onClick={() => updateItem(item.id, item.quantity + 1)}
                              style={{ width: 30, height: 30, background: 'none', border: 'none', cursor: 'pointer', color: '#6878A8', fontSize: 16, transition: 'color 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#1E3260'}
                              onMouseLeave={e => e.currentTarget.style.color = '#6878A8'}>+</button>
                          </div>
                          {/* Precio */}
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 17, fontWeight: 300, color: '#1E3260' }}>
                              {formatPrice(item.lineTotal)}
                            </p>
                            <p style={{ fontSize: 10, color: '#A8B4D0' }}>{formatPrice(item.unitPrice)}/u</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Link to="/catalogo"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 24, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A8B4D0', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#1E3260'}
                  onMouseLeave={e => e.currentTarget.style.color = '#A8B4D0'}>
                  <ArrowRight size={11} style={{ transform: 'rotate(180deg)' }} /> Seguir comprando
                </Link>
              </div>

              {/* ── Resumen ── */}
              <div style={{ position: 'sticky', top: 24 }}>

                {/* Código promo */}
                <div style={{ marginBottom: 32, paddingBottom: 28, borderBottom: '1px solid #D0D8EE' }}>
                  <p style={iLabel}>Código de descuento</p>
                  {cart.promoDescription ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#16A34A' }}>{cart.promoDescription}</span>
                        <button onClick={async () => { try { await removePromo() } catch { toast.error('Error al quitar el código') } }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A8B4D0', padding: 0, transition: 'color 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
                          onMouseLeave={e => e.currentTarget.style.color = '#A8B4D0'}>
                          quitar
                        </button>
                      </div>
                      <span style={{ color: '#16A34A' }}>−{formatPrice(cart.discount)}</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #D0D8EE' }}>
                      <input
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                        placeholder="Código"
                        style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, color: '#1E3260', padding: '10px 0', outline: 'none', letterSpacing: '0.12em', textTransform: 'uppercase' }}
                      />
                      <button onClick={handleApplyPromo} disabled={applyingPromo || !promoCode}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6878A8', padding: '0 0 0 12px', transition: 'color 0.15s', opacity: (!promoCode || applyingPromo) ? 0.4 : 1 }}
                        onMouseEnter={e => e.currentTarget.style.color = '#1E3260'}
                        onMouseLeave={e => e.currentTarget.style.color = '#6878A8'}>
                        {applyingPromo ? '...' : 'Aplicar'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Totales */}
                <p style={iLabel}>Resumen</p>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, color: '#6878A8' }}>Subtotal ({cart.itemCount} artículos)</span>
                    <span style={{ fontSize: 13, color: '#6878A8' }}>{formatPrice(cart.subtotal)}</span>
                  </div>
                  {cart.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, color: '#16A34A' }}>Descuento</span>
                      <span style={{ fontSize: 13, color: '#16A34A' }}>−{formatPrice(cart.discount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid #D0D8EE' }}>
                    <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontWeight: 300, color: '#1E3260' }}>Total</span>
                    <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontWeight: 300, color: '#1E3260' }}>{formatPrice(cart.total)}</span>
                  </div>
                </div>

                <Link to="/checkout"
                  style={{ display: 'block', width: '100%', background: '#1E3260', color: '#fff', textAlign: 'center', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', padding: '15px 0', textDecoration: 'none', marginBottom: 12, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  Proceder al pago
                </Link>
              </div>

            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .grid-cols-stack { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PublicLayout>
  )
}