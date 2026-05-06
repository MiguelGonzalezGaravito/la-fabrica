import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Bell, X, Tag } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/admin/AdminLayout'
import Spinner from '../../components/common/Spinner'
import {
  getAdminPromotions, createPromotion, updatePromotion,
  deletePromotion, notifyPromotion
} from '../../api/admin.api'
import { formatDate } from '../../utils/formatters'

const schema = z.object({
  title:          z.string().min(2, 'Título requerido'),
  description:    z.string().optional(),
  code:           z.string().min(2, 'Código requerido').toUpperCase(),
  discountType:   z.enum(['PERCENTAGE', 'FIXED']),
  discountValue:  z.coerce.number().min(1, 'Valor requerido'),
  minOrderAmount: z.coerce.number().optional(),
  applicableTo:   z.string().optional(),
  startDate:      z.string().min(1, 'Fecha inicio requerida'),
  endDate:        z.string().min(1, 'Fecha fin requerida'),
  active:         z.boolean().optional(),
})

const iField = {
  width: '100%', borderBottom: '1px solid #E5E7EB', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
  background: 'transparent', fontSize: 14, color: '#111', padding: '12px 0', outline: 'none',
}
const iLabel = {
  fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9CA3AF',
  display: 'block', marginBottom: 8,
}

export default function AdminPromotionsPage() {
  const [promos,    setPromos]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(false)
  const [editing,   setEditing]   = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [notifying, setNotifying] = useState(null)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { discountType: 'PERCENTAGE', active: true }
  })
  const discountType = watch('discountType')

  const load = () => {
    setLoading(true)
    getAdminPromotions().then(r => setPromos(r.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); reset({ discountType: 'PERCENTAGE', active: true }); setModal(true) }

  const openEdit = (p) => {
    setEditing(p)
    reset({
      title: p.title, description: p.description || '', code: p.code,
      discountType: p.discountType, discountValue: p.discountValue,
      minOrderAmount: p.minOrderAmount || '', applicableTo: p.applicableTo || '',
      startDate: p.startDate?.substring(0, 10), endDate: p.endDate?.substring(0, 10),
      active: p.active,
    })
    setModal(true)
  }

  const onSubmit = async (data) => {
    const payload = { ...data, minOrderAmount: data.minOrderAmount || null, applicableTo: data.applicableTo || null, active: data.active ?? true }
    setSaving(true)
    try {
      editing ? await updatePromotion(editing.id, payload) : await createPromotion(payload)
      toast.success(editing ? 'Promoción actualizada' : 'Promoción creada')
      setModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error al guardar') }
    finally { setSaving(false) }
  }

  const handleDelete = async (p) => {
    if (!confirm(`¿Eliminar promoción "${p.title}"?`)) return
    try { await deletePromotion(p.id); toast.success('Promoción eliminada'); load() }
    catch { toast.error('Error al eliminar') }
  }

  const handleNotify = async (p) => {
    setNotifying(p.id)
    try { await notifyPromotion(p.id); toast.success('Notificaciones enviadas') }
    catch { toast.error('Error al notificar') }
    finally { setNotifying(null) }
  }

  const isActive = (p) => {
    const now = new Date()
    return p.active && new Date(p.startDate) <= now && new Date(p.endDate) >= now
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 300, color: '#111', marginBottom: 6 }}>Promociones</h1>
            <p style={{ fontSize: 13, color: '#9CA3AF' }}>{promos.length} promoción{promos.length !== 1 ? 'es' : ''}</p>
          </div>
          <button onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#111', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '12px 20px', transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <Plus size={13} /> Nueva
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}><Spinner /></div>
        ) : promos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Tag size={32} style={{ color: '#E5E7EB', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 12, color: '#9CA3AF' }}>Sin promociones aún</p>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  {['Promoción', 'Descuento', 'Vigencia', 'Estado', ''].map((h, i) => (
                    <th key={i} style={{ padding: '14px 24px', textAlign: 'left', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {promos.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #E5E7EB', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}>

                    {/* Promoción */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, color: '#111' }}>{p.title}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', border: '1px solid #E5E7EB', color: '#6B7280', padding: '2px 8px' }}>
                          {p.code}
                        </span>
                      </div>
                      {p.description && <p style={{ fontSize: 12, color: '#9CA3AF' }}>{p.description}</p>}
                      {p.applicableTo && (
                        <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                          {p.applicableTo === 'WHOLESALE' ? 'Solo mayoristas' : 'Solo minoristas'}
                        </p>
                      )}
                    </td>

                    {/* Descuento */}
                    <td style={{ padding: '16px 24px' }}>
                      <p style={{ fontSize: 14, color: '#111' }}>
                        {p.discountType === 'PERCENTAGE' ? `${p.discountValue}%` : `$${Number(p.discountValue).toLocaleString()}`}
                      </p>
                      {p.minOrderAmount && (
                        <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Mín. ${Number(p.minOrderAmount).toLocaleString()}</p>
                      )}
                    </td>

                    {/* Vigencia */}
                    <td style={{ padding: '16px 24px', fontSize: 12, color: '#6B7280' }}>
                      {formatDate(p.startDate)}<br />
                      <span style={{ color: '#9CA3AF' }}>→ {formatDate(p.endDate)}</span>
                    </td>

                    {/* Estado */}
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 10px',
                        border: `1px solid ${isActive(p) ? '#BBF7D0' : '#E5E7EB'}`,
                        color: isActive(p) ? '#16A34A' : '#9CA3AF',
                      }}>
                        {isActive(p) ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => handleNotify(p)} disabled={notifying === p.id}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', border: '1px solid #E5E7EB', background: 'none', cursor: 'pointer', padding: '5px 10px', transition: 'all 0.15s', opacity: notifying === p.id ? 0.4 : 1 }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.color = '#111' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280' }}>
                          <Bell size={11} />
                          {notifying === p.id ? 'Enviando...' : 'Notificar'}
                        </button>
                        <button onClick={() => openEdit(p)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', transition: 'color 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#111'}
                          onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}>
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(p)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', transition: 'color 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
                          onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }}>
          <div onClick={() => setModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', background: '#fff', width: '100%', maxWidth: 580, marginTop: 8, marginBottom: 8 }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 40px', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <div>
                <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, fontWeight: 300, color: '#111' }}>
                  {editing ? 'Editar promoción' : 'Nueva promoción'}
                </h2>
                {editing && <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>Editando: {editing.title}</p>}
              </div>
              <button onClick={() => setModal(false)}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 4, transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#111'}
                onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '36px 40px 40px' }}>

              {/* Título */}
              <div style={{ marginBottom: 28 }}>
                <label style={iLabel}>Título *</label>
                <input {...register('title')} style={{ ...iField, borderBottomColor: errors.title ? '#DC2626' : '#E5E7EB' }} />
                {errors.title && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 6 }}>{errors.title.message}</p>}
              </div>

              {/* Descripción */}
              <div style={{ marginBottom: 28 }}>
                <label style={iLabel}>Descripción</label>
                <textarea {...register('description')} rows={2} style={{ ...iField, resize: 'none', lineHeight: 1.6 }} />
              </div>

              {/* Código + Tipo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
                <div>
                  <label style={iLabel}>Código *</label>
                  <input {...register('code')} style={{ ...iField, textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: 'monospace', borderBottomColor: errors.code ? '#DC2626' : '#E5E7EB' }} />
                  {errors.code && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 6 }}>{errors.code.message}</p>}
                </div>
                <div>
                  <label style={iLabel}>Tipo</label>
                  <select {...register('discountType')} style={{ ...iField, cursor: 'pointer' }}>
                    <option value="PERCENTAGE">Porcentaje (%)</option>
                    <option value="FIXED">Valor fijo ($)</option>
                  </select>
                </div>
              </div>

              {/* Descuento + Pedido mínimo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
                <div>
                  <label style={iLabel}>{discountType === 'PERCENTAGE' ? 'Descuento (%) *' : 'Descuento ($) *'}</label>
                  <input {...register('discountValue')} type="number" min="1"
                    style={{ ...iField, borderBottomColor: errors.discountValue ? '#DC2626' : '#E5E7EB' }} />
                  {errors.discountValue && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 6 }}>{errors.discountValue.message}</p>}
                </div>
                <div>
                  <label style={iLabel}>Pedido mínimo ($)</label>
                  <input {...register('minOrderAmount')} type="number" min="0" placeholder="Sin mínimo" style={iField} />
                </div>
              </div>

              {/* Aplicable a */}
              <div style={{ marginBottom: 28 }}>
                <label style={iLabel}>Aplicable a</label>
                <select {...register('applicableTo')} style={{ ...iField, cursor: 'pointer' }}>
                  <option value="">Todos los clientes</option>
                  <option value="WHOLESALE">Solo mayoristas</option>
                  <option value="RETAIL">Solo minoristas</option>
                </select>
              </div>

              {/* Fechas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
                <div>
                  <label style={iLabel}>Fecha inicio *</label>
                  <input {...register('startDate')} type="date"
                    style={{ ...iField, borderBottomColor: errors.startDate ? '#DC2626' : '#E5E7EB' }} />
                  {errors.startDate && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 6 }}>{errors.startDate.message}</p>}
                </div>
                <div>
                  <label style={iLabel}>Fecha fin *</label>
                  <input {...register('endDate')} type="date"
                    style={{ ...iField, borderBottomColor: errors.endDate ? '#DC2626' : '#E5E7EB' }} />
                  {errors.endDate && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 6 }}>{errors.endDate.message}</p>}
                </div>
              </div>

              {/* Activa */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input {...register('active')} type="checkbox" style={{ width: 16, height: 16, accentColor: '#111', cursor: 'pointer' }} />
                  <span style={{ fontSize: 13, color: '#111' }}>Promoción activa</span>
                </label>
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', gap: 12, borderTop: '1px solid #E5E7EB', paddingTop: 28 }}>
                <button type="button" onClick={() => setModal(false)}
                  style={{ flex: 1, padding: '14px 0', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', background: '#fff', color: '#111', border: '1px solid #111', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#111' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  style={{ flex: 1, padding: '14px 0', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', background: '#111', color: '#fff', border: '1px solid #111', cursor: 'pointer', opacity: saving ? 0.6 : 1, transition: 'opacity 0.15s' }}>
                  {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear promoción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
