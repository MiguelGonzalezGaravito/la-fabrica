import { useEffect, useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Check, Upload, ArrowLeft } from 'lucide-react'
import PublicLayout from '../../components/common/PublicLayout'
import Spinner from '../../components/common/Spinner'
import { Button } from '../../components/ui'
import { useCartStore } from '../../store/cartStore'
import { createOrder, uploadPaymentProof } from '../../api/orders.api'
import { formatPrice } from '../../utils/formatters'

const schema = z.object({
  shippingAddress: z.string().min(5, 'Ingresa la dirección completa'),
  shippingCity:    z.string().min(2, 'Ingresa la ciudad'),
  notes:           z.string().optional(),
})

const iField = {
  width: '100%', borderBottom: '1px solid #D0D8EE', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
  background: 'transparent', fontSize: 14, color: '#1E3260', padding: '12px 0', outline: 'none',
}
const iLabel = {
  fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A8B4D0',
  display: 'block', marginBottom: 8,
}

const STEPS = ['Resumen', 'Envío', 'Pago']

export default function CheckoutPage() {
  const { cart, fetchCart } = useCartStore()
  const [step,       setStep]       = useState(1)
  const [order,      setOrder]      = useState(null)
  const [proofFile,  setProofFile]  = useState(null)
  const [uploading,  setUploading]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef()
  const navigate = useNavigate()

  useEffect(() => { if (!cart) fetchCart() }, [])

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onCreateOrder = async (data) => {
    setSubmitting(true)
    try {
      const res = await createOrder({ ...data, promoCode: cart?.promoCode || null })
      setOrder(res.data); setStep(3)
      await fetchCart()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear el pedido')
    } finally { setSubmitting(false) }
  }

  const onUploadProof = async () => {
    if (!proofFile) { toast.error('Selecciona el comprobante'); return }
    setUploading(true)
    try {
      await uploadPaymentProof(order.id, proofFile)
      toast.success('Comprobante subido. Verificaremos tu pago pronto.')
      navigate('/pedidos')
    } catch { toast.error('Error al subir el comprobante') }
    finally { setUploading(false) }
  }

  if (!cart && step === 1) return <PublicLayout><div className="flex justify-center py-20"><Spinner /></div></PublicLayout>
  if (cart?.items?.length === 0 && step === 1) return (
    <PublicLayout>
      <div className="text-center py-24">
        <p className="text-[13px] text-stone mb-5">Tu carrito está vacío</p>
        <Link to="/catalogo"><Button variant="secondary">Ver productos</Button></Link>
      </div>
    </PublicLayout>
  )

  return (
    <PublicLayout>

      {/* Header de sección */}
      <div style={{ borderBottom: '1px solid #D0D8EE', background: '#fff', padding: '48px 0 40px' }}>
        <div className="page-container">
          <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#A8B4D0', marginBottom: 12 }}>
            Checkout
          </p>
          <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, color: '#1E3260', marginBottom: 28 }}>
            Finalizar pedido
          </h1>

          {/* Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 500, flexShrink: 0, transition: 'all 0.2s',
                  border: `1px solid ${step > i + 1 ? '#1E3260' : step === i + 1 ? '#1E3260' : '#D0D8EE'}`,
                  background: step > i + 1 ? '#1E3260' : 'transparent',
                  color: step > i + 1 ? '#fff' : step === i + 1 ? '#1E3260' : '#A8B4D0',
                }}>
                  {step > i + 1 ? <Check size={11} /> : i + 1}
                </div>
                <span style={{
                  fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', marginLeft: 8,
                  color: step === i + 1 ? '#1E3260' : '#A8B4D0',
                  display: window.innerWidth < 640 ? 'none' : 'block',
                }}>{s}</span>
                {i < 2 && <div style={{ flex: 1, height: 1, background: '#D0D8EE', margin: '0 16px' }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: 48, paddingBottom: 80, maxWidth: 680 }}>

        {/* Step 1 — Resumen */}
        {step === 1 && cart && (
          <div>
            <p style={iLabel}>Resumen del pedido</p>

            {/* Items */}
            <div style={{ borderTop: '1px solid #D0D8EE', marginBottom: 0 }}>
              {cart.items.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #D0D8EE' }}>
                  <div>
                    <span style={{ fontSize: 14, color: '#1E3260' }}>{item.productName}</span>
                    <span style={{ fontSize: 12, color: '#A8B4D0', marginLeft: 8 }}>T.{item.size} ×{item.quantity}</span>
                  </div>
                  <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 16, fontWeight: 300, color: '#1E3260' }}>{formatPrice(item.lineTotal)}</span>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div style={{ padding: '20px 0', borderBottom: '1px solid #D0D8EE', marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#6878A8' }}>Subtotal</span>
                <span style={{ fontSize: 12, color: '#6878A8' }}>{formatPrice(cart.subtotal)}</span>
              </div>
              {cart.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#16A34A' }}>Descuento</span>
                  <span style={{ fontSize: 12, color: '#16A34A' }}>−{formatPrice(cart.discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid #D0D8EE' }}>
                <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontWeight: 300, color: '#1E3260' }}>Total</span>
                <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontWeight: 300, color: '#1E3260' }}>{formatPrice(cart.total)}</span>
              </div>
            </div>

            <button onClick={() => setStep(2)}
              style={{ width: '100%', background: '#1E3260', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', padding: '15px 0', transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              Continuar
            </button>
          </div>
        )}

        {/* Step 2 — Envío */}
        {step === 2 && (
          <form onSubmit={handleSubmit(onCreateOrder)}>
            <p style={iLabel}>Datos de envío</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginBottom: 40 }}>
              <div>
                <label style={iLabel}>Dirección</label>
                <input {...register('shippingAddress')} placeholder="Calle 123 #45-67"
                  style={{ ...iField, borderBottomColor: errors.shippingAddress ? '#DC2626' : '#D0D8EE' }} />
                {errors.shippingAddress && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 6 }}>{errors.shippingAddress.message}</p>}
              </div>
              <div>
                <label style={iLabel}>Ciudad</label>
                <input {...register('shippingCity')} placeholder="Bogotá, Medellín..."
                  style={{ ...iField, borderBottomColor: errors.shippingCity ? '#DC2626' : '#D0D8EE' }} />
                {errors.shippingCity && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 6 }}>{errors.shippingCity.message}</p>}
              </div>
              <div>
                <label style={iLabel}>Notas <span style={{ textTransform: 'none', letterSpacing: 0, color: '#A8B4D0' }}>(opcional)</span></label>
                <textarea {...register('notes')} rows={2} placeholder="Indicaciones adicionales..."
                  style={{ ...iField, resize: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => setStep(1)}
                style={{ flex: 1, background: 'none', border: '1px solid #D0D8EE', cursor: 'pointer', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '14px 0', color: '#6878A8', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#1E3260'; e.currentTarget.style.color = '#1E3260' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#D0D8EE'; e.currentTarget.style.color = '#6878A8' }}>
                <ArrowLeft size={11} style={{ display: 'inline', marginRight: 6 }} /> Atrás
              </button>
              <button type="submit" disabled={submitting}
                style={{ flex: 2, background: '#1E3260', color: '#fff', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', padding: '14px 0', opacity: submitting ? 0.6 : 1, transition: 'opacity 0.15s' }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.opacity = '0.8' }}
                onMouseLeave={e => { if (!submitting) e.currentTarget.style.opacity = '1' }}>
                {submitting ? 'Creando pedido...' : 'Confirmar pedido'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3 — Pago */}
        {step === 3 && order && (
          <div>
            {/* Confirmación */}
            <div style={{ textAlign: 'center', padding: '32px 0 40px', borderBottom: '1px solid #D0D8EE', marginBottom: 40 }}>
              <div style={{ width: 44, height: 44, background: '#1E3260', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Check size={18} color="#fff" />
              </div>
              <h2 className="font-display" style={{ fontSize: 26, fontWeight: 300, color: '#1E3260', marginBottom: 6 }}>
                Pedido {order.orderNumber}
              </h2>
              <p style={{ fontSize: 13, color: '#6878A8' }}>Realiza el pago y sube el comprobante</p>
            </div>

            {/* Instrucciones de pago */}
            <div style={{ marginBottom: 40 }}>
              <p style={iLabel}>Instrucciones de pago</p>

              <div style={{ textAlign: 'center', padding: '24px 0', borderTop: '1px solid #D0D8EE', borderBottom: '1px solid #D0D8EE', marginBottom: 24 }}>
                {order.discount > 0 && (
                  <p style={{ fontSize: 12, color: '#A8B4D0', textDecoration: 'line-through', marginBottom: 4 }}>
                    {formatPrice(order.subtotal)}
                  </p>
                )}
                <span className="font-display" style={{ fontSize: 36, fontWeight: 300, color: '#1E3260' }}>{formatPrice(order.total)}</span>
                {order.discount > 0 && (
                  <p style={{ fontSize: 11, color: '#16A34A', marginTop: 4 }}>−{formatPrice(order.discount)} de descuento aplicado</p>
                )}
                <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A8B4D0', marginTop: 4 }}>Valor exacto</p>
              </div>

              {order.paymentInfo && (
                <div>
                  {[['Banco', order.paymentInfo.banco], ['Titular', order.paymentInfo.titular], ['Llave Bre-B', order.paymentInfo.bancolombiLlave]].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #D0D8EE' }}>
                      <span style={{ fontSize: 12, color: '#6878A8' }}>{k}</span>
                      <span style={{ fontSize: 14, color: '#1E3260', fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subir comprobante */}
            <div>
              <p style={iLabel}>Subir comprobante</p>
              <div onClick={() => fileRef.current?.click()}
                style={{ border: '1px dashed #D0D8EE', padding: '36px 24px', textAlign: 'center', cursor: 'pointer', marginBottom: 16, transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#1E3260'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#D0D8EE'}>
                {proofFile ? (
                  <div>
                    <Check size={22} style={{ margin: '0 auto 8px', color: '#16A34A' }} />
                    <p style={{ fontSize: 13, color: '#1E3260' }}>{proofFile.name}</p>
                  </div>
                ) : (
                  <div>
                    <Upload size={22} style={{ margin: '0 auto 8px', color: '#D0D8EE' }} />
                    <p style={{ fontSize: 13, color: '#6878A8' }}>Toca para subir el screenshot</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setProofFile(e.target.files[0])} />
              </div>

              <button onClick={onUploadProof} disabled={uploading || !proofFile}
                style={{ width: '100%', background: '#1E3260', color: '#fff', border: 'none', cursor: (uploading || !proofFile) ? 'not-allowed' : 'pointer', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', padding: '15px 0', opacity: (uploading || !proofFile) ? 0.4 : 1, marginBottom: 12, transition: 'opacity 0.15s' }}
                onMouseEnter={e => { if (!uploading && proofFile) e.currentTarget.style.opacity = '0.8' }}
                onMouseLeave={e => { if (!uploading && proofFile) e.currentTarget.style.opacity = '1' }}>
                {uploading ? 'Subiendo...' : 'Confirmar pago'}
              </button>

              <Link to="/pedidos"
                style={{ display: 'block', textAlign: 'center', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A8B4D0', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#1E3260'}
                onMouseLeave={e => e.currentTarget.style.color = '#A8B4D0'}>
                Subir después desde Mis pedidos
              </Link>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}