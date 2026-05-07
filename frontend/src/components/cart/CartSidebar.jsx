import { useState } from 'react'
import { X, Trash2, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCartStore } from '../../store/cartStore'
import { formatPrice } from '../../utils/formatters'
import Spinner from '../common/Spinner'

export default function CartSidebar() {
  const { cart, open, setOpen, updateItem, removeItem, loading, applyPromo, removePromo } = useCartStore()
  const [promoCode,     setPromoCode]     = useState('')
  const [applyingPromo, setApplyingPromo] = useState(false)

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

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }} onClick={() => setOpen(false)} />
      <div className="fixed right-0 top-0 h-full z-50 flex flex-col bg-white" style={{ width: '100%', maxWidth: 400 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 28px 24px', borderBottom: '1px solid #D0D8EE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#A8B4D0' }}>Carrito</p>
            {cart?.itemCount > 0 && (
              <span style={{ background: '#1E3260', color: '#fff', fontSize: 9, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cart.itemCount}
              </span>
            )}
          </div>
          <button onClick={() => setOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8B4D0', padding: 4, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#1E3260'}
            onMouseLeave={e => e.currentTarget.style.color = '#A8B4D0'}>
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '8px 0' }}>
          {loading ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : !cart || cart.items?.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: 40 }}>
              <ShoppingBag size={32} style={{ color: '#D0D8EE' }} />
              <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A8B4D0' }}>Tu carrito está vacío</p>
              <Link to="/catalogo" onClick={() => setOpen(false)}
                style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1E3260', textDecoration: 'none', borderBottom: '1px solid #111', paddingBottom: 2 }}>
                Ver productos
              </Link>
            </div>
          ) : (
            <div>
              {cart.items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 16, padding: '20px 28px', borderBottom: '1px solid #D0D8EE' }}>

                  {/* Imagen */}
                  <div style={{ width: 72, height: 72, background: '#F2F5FC', flexShrink: 0, overflow: 'hidden' }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#F2F5FC' }} />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: '#1E3260', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.productName}</p>
                    <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A8B4D0', marginBottom: 12 }}>
                      T.{item.size} · {item.color}
                    </p>

                    {/* Cantidad + eliminar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D0D8EE' }}>
                        <button onClick={() => updateItem(item.id, item.quantity - 1)}
                          style={{ width: 28, height: 28, background: 'none', border: 'none', cursor: 'pointer', color: '#6878A8', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#1E3260'}
                          onMouseLeave={e => e.currentTarget.style.color = '#6878A8'}>−</button>
                        <span style={{ width: 28, textAlign: 'center', fontSize: 12, color: '#1E3260', borderLeft: '1px solid #D0D8EE', borderRight: '1px solid #D0D8EE', lineHeight: '28px' }}>{item.quantity}</span>
                        <button onClick={() => updateItem(item.id, item.quantity + 1)}
                          style={{ width: 28, height: 28, background: 'none', border: 'none', cursor: 'pointer', color: '#6878A8', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#1E3260'}
                          onMouseLeave={e => e.currentTarget.style.color = '#6878A8'}>+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8B4D0', padding: 4, transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
                        onMouseLeave={e => e.currentTarget.style.color = '#A8B4D0'}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Precio */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 16, fontWeight: 300, color: '#1E3260' }}>{formatPrice(item.lineTotal)}</p>
                    <p style={{ fontSize: 10, color: '#A8B4D0', marginTop: 2 }}>{formatPrice(item.unitPrice)}/u</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items?.length > 0 && (
          <div style={{ borderTop: '1px solid #D0D8EE', padding: 28 }}>

            {/* Código de descuento */}
            <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #D0D8EE' }}>
              <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A8B4D0', marginBottom: 10 }}>
                Código de descuento
              </p>
              {cart.promoDescription ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: '#16A34A' }}>{cart.promoDescription}</span>
                    <button onClick={async () => { try { await removePromo() } catch { toast.error('Error al quitar el código') } }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A8B4D0', padding: 0, transition: 'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
                      onMouseLeave={e => e.currentTarget.style.color = '#A8B4D0'}>
                      quitar
                    </button>
                  </div>
                  <span style={{ fontSize: 12, color: '#16A34A' }}>−{formatPrice(cart.discount)}</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #D0D8EE' }}>
                  <input
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                    placeholder="Código"
                    style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 12, color: '#1E3260', padding: '8px 0', outline: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                  />
                  <button onClick={handleApplyPromo} disabled={applyingPromo || !promoCode}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6878A8', padding: '0 0 0 8px', transition: 'color 0.15s', opacity: (!promoCode || applyingPromo) ? 0.4 : 1 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#1E3260'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6878A8'}>
                    {applyingPromo ? '...' : 'Aplicar'}
                  </button>
                </div>
              )}
            </div>

            {/* Totales */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#6878A8' }}>Subtotal</span>
                <span style={{ fontSize: 11, color: '#6878A8' }}>{formatPrice(cart.subtotal)}</span>
              </div>
              {cart.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: '#16A34A' }}>Descuento</span>
                  <span style={{ fontSize: 11, color: '#16A34A' }}>−{formatPrice(cart.discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid #D0D8EE' }}>
                <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20, fontWeight: 300, color: '#1E3260' }}>Total</span>
                <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20, fontWeight: 300, color: '#1E3260' }}>{formatPrice(cart.total)}</span>
              </div>
            </div>

            {/* Botones */}
            <Link to="/checkout" onClick={() => setOpen(false)}
              style={{ display: 'block', width: '100%', background: '#1E3260', color: '#fff', textAlign: 'center', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', padding: '14px 0', textDecoration: 'none', marginBottom: 12, transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              Proceder al pago
            </Link>
            <button onClick={() => setOpen(false)}
              style={{ display: 'block', width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A8B4D0', padding: '8px 0', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#1E3260'}
              onMouseLeave={e => e.currentTarget.style.color = '#A8B4D0'}>
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </>
  )
}
