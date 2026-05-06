import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, QrCode, Upload, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import PublicLayout from '../../components/common/PublicLayout'
import Spinner from '../../components/common/Spinner'
import { StatusBadge, Button } from '../../components/ui'
import { getOrder, uploadPaymentProof } from '../../api/orders.api'
import { formatPrice, formatDate, formatDateTime } from '../../utils/formatters'

const STATUS_STEPS = ['PENDING_PAYMENT', 'PAYMENT_VERIFIED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
const STATUS_SHORT  = { PENDING_PAYMENT: 'Pago', PAYMENT_VERIFIED: 'Verificado', PROCESSING: 'Preparando', SHIPPED: 'Enviado', DELIVERED: 'Entregado' }

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order,     setOrder]     = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [proofFile, setProofFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const reload = () => {
    setLoading(true)
    getOrder(id).then(r => setOrder(r.data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { reload() }, [id])

  const onUpload = async () => {
    if (!proofFile) { toast.error('Selecciona el comprobante'); return }
    setUploading(true)
    try {
      await uploadPaymentProof(order.id, proofFile)
      toast.success('Comprobante enviado.')
      setProofFile(null); reload()
    } catch { toast.error('Error al subir el comprobante') }
    finally { setUploading(false) }
  }

  if (loading) return <PublicLayout><div className="flex justify-center py-20"><Spinner /></div></PublicLayout>
  if (!order)  return <PublicLayout><div className="text-center py-24 text-stone">Pedido no encontrado</div></PublicLayout>

  const currentStep = STATUS_STEPS.indexOf(order.status)
  const canUpload   = order.status === 'PENDING_PAYMENT' && !order.paymentProof

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-6 py-12">

        <Link to="/pedidos" className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-stone hover:text-ink mb-8 transition-colors">
          <ArrowLeft size={12} /> Mis pedidos
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-light text-ink">{order.orderNumber}</h1>
          <StatusBadge status={order.status} />
        </div>

        {/* Timeline */}
        {order.status !== 'CANCELLED' && (
          <div className="border border-line p-5 mb-5">
            <div className="flex items-center relative">
              <div className="absolute left-3 right-3 top-3.5 h-px bg-line" />
              {STATUS_STEPS.map((s, i) => (
                <div key={s} className="relative flex flex-col items-center gap-1.5 flex-1">
                  <div className={`w-7 h-7 border flex items-center justify-center z-10 transition-colors text-[10px] ${
                    i < currentStep  ? 'border-ink bg-ink text-white'
                      : i === currentStep ? 'border-ink text-ink bg-white'
                      : 'border-line text-fog bg-white'
                  }`}>
                    {i < currentStep ? <Check size={11} /> : i + 1}
                  </div>
                  <span className="text-[9px] text-stone text-center hidden sm:block tracking-wide">
                    {STATUS_SHORT[s]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Productos */}
        <div className="border border-line mb-4">
          <div className="px-5 py-3 border-b border-line">
            <p className="text-[10px] tracking-[2px] uppercase text-fog">Productos</p>
          </div>
          <div className="p-5 space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-[13px]">
                <div>
                  <span className="text-ink">{item.productName}</span>
                  <span className="text-fog ml-2">T.{item.size} · {item.color} ×{item.quantity}</span>
                </div>
                <span className="text-ink">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-line space-y-1.5">
            <div className="flex justify-between text-[12px] text-stone">
              <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-[12px] text-success">
                <span>Descuento</span><span>−{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-display text-[16px] font-light text-ink pt-2 border-t border-line">
              <span>Total</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Envío */}
        <div className="border border-line mb-4 p-5">
          <p className="text-[10px] tracking-[2px] uppercase text-fog mb-3">Datos de envío</p>
          <p className="text-[13px] text-ink">{order.shippingAddress}</p>
          <p className="text-[13px] text-ink">{order.shippingCity}</p>
          {order.notes && <p className="text-[12px] text-stone mt-2 italic">"{order.notes}"</p>}
          <p className="text-[10px] text-fog mt-3">{formatDateTime(order.createdAt)}</p>
        </div>

        {/* Instrucciones pago */}
        {order.status === 'PENDING_PAYMENT' && order.paymentInfo && (
          <div className="border border-line mb-4">
            <div className="px-5 py-3 border-b border-line flex items-center gap-2">
              <QrCode size={13} className="text-stone" />
              <p className="text-[10px] tracking-[2px] uppercase text-fog">Instrucciones de pago</p>
            </div>
            <div className="p-5">
              <div className="text-center py-4 border border-line mb-5">
                <p className="font-display text-4xl font-light text-ink">{formatPrice(order.total)}</p>
                <p className="text-[10px] uppercase tracking-[1.5px] text-fog mt-1">Valor exacto</p>
              </div>
              <div className="space-y-0">
                {[['Banco', order.paymentInfo.banco], ['Titular', order.paymentInfo.titular], ['Llave', order.paymentInfo.bancolombiLlave]].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2.5 border-b border-line text-[13px]">
                    <span className="text-stone">{k}</span><span className="text-ink font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Comprobante */}
        {order.paymentProof ? (
          <div className="border border-line p-5">
            <div className="flex items-center gap-2 mb-2">
              <Check size={13} className="text-success" />
              <p className="text-[11px] text-ink">Comprobante enviado</p>
            </div>
            <p className="text-[11px] text-fog">{formatDateTime(order.paymentProof.uploadedAt)}</p>
            {order.paymentProof.imageUrl && (
              <a href={order.paymentProof.imageUrl} target="_blank" rel="noreferrer"
                className="inline-block mt-3 text-[10px] tracking-widest uppercase text-stone underline underline-offset-2 hover:text-ink">
                Ver comprobante
              </a>
            )}
          </div>
        ) : canUpload ? (
          <div className="border border-line p-5">
            <p className="text-[10px] tracking-[2px] uppercase text-fog mb-4">Subir comprobante</p>
            <div onClick={() => fileRef.current?.click()}
              className="border border-dashed border-line p-8 text-center cursor-pointer hover:border-ink transition-colors">
              {proofFile ? (
                <div><Check size={24} className="mx-auto mb-2 text-success" /><p className="text-[12px] text-ink">{proofFile.name}</p></div>
              ) : (
                <div><Upload size={24} className="mx-auto mb-2 text-fog/40" /><p className="text-[12px] text-stone">Toca para subir el screenshot</p></div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setProofFile(e.target.files[0])} />
            </div>
            <Button onClick={onUpload} disabled={uploading || !proofFile} className="w-full mt-4">
              {uploading ? 'Subiendo...' : 'Confirmar pago'}
            </Button>
          </div>
        ) : null}
      </div>
    </PublicLayout>
  )
}
