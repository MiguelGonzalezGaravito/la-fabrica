const config = {
  PENDING_PAYMENT:  { label: 'Pendiente de pago', dot: '#F59E0B' },
  PAYMENT_VERIFIED: { label: 'Pago verificado',   dot: '#16A34A' },
  PROCESSING:       { label: 'En preparación',    dot: '#2563EB' },
  SHIPPED:          { label: 'Enviado',            dot: '#7C3AED' },
  DELIVERED:        { label: 'Entregado',          dot: '#111111' },
  CANCELLED:        { label: 'Cancelado',          dot: '#DC2626' },
}

export default function StatusBadge({ status, className = '' }) {
  const c = config[status] || { label: status, dot: '#9CA3AF' }
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] tracking-[1px] uppercase text-stone ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.dot }} />
      {c.label}
    </span>
  )
}
