import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingBag, ArrowLeft, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import PublicLayout from '../../components/common/PublicLayout'
import Spinner from '../../components/common/Spinner'
import { getProduct } from '../../api/products.api'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { formatPrice } from '../../utils/formatters'

export default function ProductPage() {
  const { id } = useParams()
  const [product,         setProduct]         = useState(null)
  const [loading,         setLoading]         = useState(true)
  const [selectedImg,     setSelectedImg]     = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity,        setQuantity]        = useState(1)
  const [adding,          setAdding]          = useState(false)
  const { user } = useAuthStore()
  const { addItem } = useCartStore()
  const isWholesale = user?.businessType === 'WHOLESALE'

  useEffect(() => {
    getProduct(id)
      .then(r => { setProduct(r.data); if (r.data.variants?.length) setSelectedVariant(r.data.variants[0]) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!user) { toast.error('Inicia sesión para comprar'); return }
    if (!selectedVariant) { toast.error('Selecciona una variante'); return }
    if (selectedVariant.stock < quantity) { toast.error('Stock insuficiente'); return }
    setAdding(true)
    try {
      await addItem(selectedVariant.id, quantity)
      toast.success('Agregado al carrito')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al agregar')
    } finally { setAdding(false) }
  }

  const unitPrice = () => {
    if (!product) return 0
    if (isWholesale && product.wholesalePrice && quantity >= (product.wholesaleMinQty || 0))
      return product.wholesalePrice
    return product.basePrice
  }

  const sizes  = [...new Set((product?.variants || []).map(v => v.size))]
  const colors = [...new Set((product?.variants || []).map(v => v.color))]
  const images = product?.images || []

  if (loading) return <PublicLayout><div style={{ display: 'flex', justifyContent: 'center', padding: '96px 0' }}><Spinner /></div></PublicLayout>
  if (!product) return <PublicLayout><div style={{ textAlign: 'center', padding: '96px 0', color: '#6878A8', fontSize: 14 }}>Producto no encontrado</div></PublicLayout>

  return (
    <PublicLayout>
      <div className="page-container" style={{ paddingTop: 32, paddingBottom: 80 }}>

        {/* Breadcrumb */}
        <Link to="/catalogo"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A8B4D0', textDecoration: 'none', marginBottom: 40, transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#1E3260'}
          onMouseLeave={e => e.currentTarget.style.color = '#A8B4D0'}>
          <ArrowLeft size={11} /> Colección
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}
          className="grid-cols-stack">

          {/* ── Galería ── */}
          <div style={{ display: 'flex', gap: 12 }}>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 60, flexShrink: 0 }}>
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setSelectedImg(i)}
                    style={{
                      aspectRatio: '1', overflow: 'hidden', background: '#F2F5FC', border: `1px solid ${i === selectedImg ? '#1E3260' : '#D0D8EE'}`,
                      cursor: 'pointer', padding: 0, opacity: i === selectedImg ? 1 : 0.55, transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (i !== selectedImg) e.currentTarget.style.opacity = '0.85' }}
                    onMouseLeave={e => { if (i !== selectedImg) e.currentTarget.style.opacity = '0.55' }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Imagen principal */}
            <div style={{ position: 'relative', flex: 1, background: '#F2F5FC', aspectRatio: '3/4', overflow: 'hidden' }}>
              {images[selectedImg]
                ? <img src={images[selectedImg].url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <div style={{ width: '100%', height: '100%', background: '#F2F5FC' }} />
              }

              {/* Flechas */}
              {images.length > 1 && (
                <>
                  <button onClick={() => setSelectedImg(i => (i - 1 + images.length) % images.length)}
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.85)'}>
                    <ChevronLeft size={14} color="#1E3260" />
                  </button>
                  <button onClick={() => setSelectedImg(i => (i + 1) % images.length)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.85)'}>
                    <ChevronRight size={14} color="#1E3260" />
                  </button>
                </>
              )}

              {/* Badge mayorista */}
              {isWholesale && product.wholesalePrice && (
                <div style={{ position: 'absolute', top: 16, left: 16, background: '#D85880', color: '#fff', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '4px 10px' }}>
                  Precio mayorista
                </div>
              )}
            </div>
          </div>

          {/* ── Info ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Categoría eyebrow */}
            {product.category && (
              <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#A8B4D0' }}>
                {product.category}
              </p>
            )}

            {/* Nombre */}
            <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, color: '#1E3260', lineHeight: 1.1 }}>
              {product.name}
            </h1>

            {/* Precio */}
            <div style={{ padding: '20px 0', borderTop: '1px solid #D0D8EE', borderBottom: '1px solid #D0D8EE' }}>
              {isWholesale && product.wholesalePrice ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 12, color: '#A8B4D0', textDecoration: 'line-through' }}>{formatPrice(product.basePrice)}</span>
                  <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 300, color: '#1E3260' }}>{formatPrice(product.wholesalePrice)}</span>
                  <span style={{ fontSize: 11, color: '#6878A8', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <Check size={11} color="#16A34A" /> Precio mayorista · mín. {product.wholesaleMinQty} pares
                  </span>
                </div>
              ) : (
                <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 300, color: '#1E3260' }}>
                  {formatPrice(product.basePrice)}
                </span>
              )}
            </div>

            {/* Descripción */}
            {product.description && (
              <p style={{ fontSize: 13, color: '#6878A8', lineHeight: 1.7 }}>{product.description}</p>
            )}

            {/* Tallas */}
            {sizes.length > 0 && (
              <div>
                <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A8B4D0', marginBottom: 12 }}>Talla</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {sizes.map(size => {
                    const variant = product.variants.find(v => v.size === size)
                    const available = variant && variant.stock > 0
                    const active = selectedVariant?.size === size
                    return (
                      <button key={size} onClick={() => available && setSelectedVariant(variant)} disabled={!available}
                        style={{
                          width: 48, height: 48, border: `1px solid ${active ? '#1E3260' : available ? '#D0D8EE' : '#EEF2FA'}`,
                          background: active ? '#1E3260' : 'transparent',
                          color: active ? '#fff' : available ? '#1E3260' : '#C4CDE0',
                          fontSize: 12, cursor: available ? 'pointer' : 'not-allowed',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { if (available && !active) e.currentTarget.style.borderColor = '#1E3260' }}
                        onMouseLeave={e => { if (available && !active) e.currentTarget.style.borderColor = '#D0D8EE' }}>
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Colores */}
            {colors.length > 0 && (
              <div>
                <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A8B4D0', marginBottom: 12 }}>
                  Color&nbsp;·&nbsp;
                  <span style={{ textTransform: 'none', letterSpacing: 0, fontSize: 13, color: '#1E3260' }}>
                    {selectedVariant?.color}
                  </span>
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {colors.map(color => {
                    const active = selectedVariant?.color === color
                    return (
                      <button key={color}
                        onClick={() => setSelectedVariant(product.variants.find(v => v.color === color) || selectedVariant)}
                        style={{
                          padding: '8px 16px', border: `1px solid ${active ? '#1E3260' : '#D0D8EE'}`,
                          background: active ? '#1E3260' : 'transparent',
                          color: active ? '#fff' : '#6878A8', fontSize: 12,
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = '#1E3260' }}
                        onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = '#D0D8EE' }}>
                        {color}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Cantidad */}
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A8B4D0', marginBottom: 12 }}>Cantidad</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D0D8EE' }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ width: 40, height: 40, background: 'none', border: 'none', cursor: 'pointer', color: '#6878A8', fontSize: 18, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#1E3260'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6878A8'}>−</button>
                  <span style={{ width: 40, textAlign: 'center', fontSize: 14, color: '#1E3260', borderLeft: '1px solid #D0D8EE', borderRight: '1px solid #D0D8EE', lineHeight: '40px' }}>
                    {quantity}
                  </span>
                  <button onClick={() => setQuantity(q => Math.min(selectedVariant?.stock || 99, q + 1))}
                    style={{ width: 40, height: 40, background: 'none', border: 'none', cursor: 'pointer', color: '#6878A8', fontSize: 18, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#1E3260'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6878A8'}>+</button>
                </div>
                {selectedVariant && (
                  <span style={{ fontSize: 11, color: '#A8B4D0' }}>{selectedVariant.stock} disponibles</span>
                )}
              </div>
            </div>

            {/* Total mayorista */}
            {isWholesale && product.wholesalePrice && (
              <div style={{ background: '#F2F5FC', border: '1px solid #D0D8EE', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#6878A8' }}>Total estimado</span>
                <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontWeight: 300, color: '#1E3260' }}>
                  {formatPrice(Number(unitPrice()) * quantity)}
                </span>
              </div>
            )}

            {/* Botón agregar */}
            <button onClick={handleAddToCart}
              disabled={adding || !selectedVariant || selectedVariant?.stock === 0}
              style={{
                width: '100%', background: '#1E3260', color: '#fff', border: 'none',
                cursor: (adding || !selectedVariant || selectedVariant?.stock === 0) ? 'not-allowed' : 'pointer',
                fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', padding: '16px 0',
                opacity: (adding || !selectedVariant || selectedVariant?.stock === 0) ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { if (!adding && selectedVariant && selectedVariant.stock > 0) e.currentTarget.style.opacity = '0.8' }}
              onMouseLeave={e => { if (!adding && selectedVariant && selectedVariant.stock > 0) e.currentTarget.style.opacity = '1' }}>
              <ShoppingBag size={15} />
              {!user ? 'Inicia sesión para comprar'
                : selectedVariant?.stock === 0 ? 'Agotado'
                : adding ? 'Agregando...'
                : 'Agregar al carrito'}
            </button>

            {/* Trust signals */}
            <div style={{ paddingTop: 16, borderTop: '1px solid #D0D8EE', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Envío a todo Colombia', 'Despacho en 48 horas', 'Pago seguro por QR Bancolombia'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6878A8' }}>
                  <Check size={11} color="#A8B4D0" /> {t}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .grid-cols-stack { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PublicLayout>
  )
}
