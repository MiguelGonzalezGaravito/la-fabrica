import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Upload, ImageOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/admin/AdminLayout'
import Spinner from '../../components/common/Spinner'
import { getAdminProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../../api/products.api'
import { toggleProductStatus } from '../../api/admin.api'
import { formatPrice } from '../../utils/formatters'

const schema = z.object({
  name: z.string().min(2, 'Requerido'), description: z.string().optional(),
  brand: z.string().optional(), category: z.string().optional(),
  basePrice: z.coerce.number().min(1, 'Requerido'),
  wholesalePrice: z.coerce.number().optional(), wholesaleMinQty: z.coerce.number().optional(),
  featured: z.boolean().optional(),
})

const CATEGORIES = ['Sandalias', 'Espadrilles', 'Plataformas', 'Flats', 'Botas', 'Tacones', 'Otro']

const iField = {
  width: '100%', borderBottom: '1px solid #E5E7EB', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
  background: 'transparent', fontSize: 14, color: '#111', padding: '12px 0', outline: 'none',
}
const iLabel = {
  fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9CA3AF',
  display: 'block', marginBottom: 8,
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [images,   setImages]   = useState([])
  const [variants, setVariants] = useState([{ size: '', color: '', stock: 0 }])

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const load = () => { setLoading(true); getAdminProducts({ size: 100 }).then(r => setProducts(r.data.content || r.data)).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); reset({ featured: false }); setImages([]); setVariants([{ size: '', color: '', stock: 0 }]); setModal(true) }
  const openEdit = async (p) => {
    setEditing(p); setModal(true); setImages([])
    reset({ name: p.name, description: p.description || '', brand: p.brand || '', category: p.category || '', basePrice: p.basePrice, wholesalePrice: p.wholesalePrice || '', wholesaleMinQty: p.wholesaleMinQty || '', featured: p.featured })
    setVariants([{ size: '', color: '', stock: 0 }])
    try {
      const res = await getProduct(p.id)
      const full = res.data
      reset({ name: full.name, description: full.description || '', brand: full.brand || '', category: full.category || '', basePrice: full.basePrice, wholesalePrice: full.wholesalePrice || '', wholesaleMinQty: full.wholesaleMinQty || '', featured: full.featured })
      setVariants(full.variants?.length ? full.variants.map(v => ({ size: v.size, color: v.color || '', stock: v.stock ?? 0 })) : [{ size: '', color: '', stock: 0 }])
    } catch { /* mantiene datos básicos si falla */ }
  }

  const onSubmit = async (data) => {
    const fd = new FormData()
    fd.append('product', new Blob([JSON.stringify({ ...data, wholesalePrice: data.wholesalePrice || null, wholesaleMinQty: data.wholesaleMinQty || null, featured: data.featured || false, variants: variants.filter(v => v.size).map(v => ({ ...v, color: v.color?.trim() || 'Único' })) })], { type: 'application/json' }))
    images.forEach(f => fd.append('images', f))
    setSaving(true)
    try {
      editing ? await updateProduct(editing.id, fd) : await createProduct(fd)
      toast.success(editing ? 'Producto actualizado' : 'Producto creado')
      setModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') } finally { setSaving(false) }
  }

  const handleDelete = async (p) => {
    if (!confirm(`¿Eliminar "${p.name}"?`)) return
    try { await deleteProduct(p.id); toast.success('Eliminado'); load() } catch { toast.error('Error') }
  }

  const handleToggle = async (p) => { try { await toggleProductStatus(p.id); load() } catch { toast.error('Error') } }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 300, color: '#111', marginBottom: 6 }}>Productos</h1>
            <p style={{ fontSize: 13, color: '#9CA3AF' }}>{products.length} producto{products.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#111', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '12px 20px', transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <Plus size={13} /> Nuevo
          </button>
        </div>

        {loading ? <div className="flex justify-center py-16"><Spinner /></div> : (
          <div style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  {['Producto', 'Categoría', 'Precio', 'Stock', 'Estado', ''].map((h, i) => (
                    <th key={i} style={{ padding: '14px 24px', textAlign: 'left', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 400 }}
                      className={i === 1 ? 'hidden md:table-cell' : i === 3 ? 'hidden sm:table-cell' : ''}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #E5E7EB', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        {p.images?.[0]?.url
                          ? <img src={p.images[0].url} alt="" style={{ width: 44, height: 44, objectFit: 'cover', flexShrink: 0 }} />
                          : <div style={{ width: 44, height: 44, background: '#F9FAFB', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ImageOff size={14} color="#D1D5DB" /></div>
                        }
                        <div>
                          <p style={{ fontSize: 14, color: '#111', marginBottom: 3 }}>{p.name}</p>
                          {p.featured && <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#B8912A' }}>Destacado</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: 13, color: '#6B7280' }} className="hidden md:table-cell">{p.category || '—'}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <p style={{ fontSize: 14, color: '#111' }}>{formatPrice(p.basePrice)}</p>
                      {p.wholesalePrice && <p style={{ fontSize: 12, color: '#B8912A', marginTop: 2 }}>{formatPrice(p.wholesalePrice)}</p>}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: 13, color: '#6B7280' }} className="hidden sm:table-cell">{p.totalStock ?? 0}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <button onClick={() => handleToggle(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, transition: 'opacity 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        onMouseLeave={e => e.currentTarget.style.opacity = 0.6}>
                        {p.active ? <ToggleRight size={22} color="#16A34A" /> : <ToggleLeft size={22} color="#9CA3AF" />}
                      </button>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => openEdit(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', transition: 'color 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#111'}
                          onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}><Pencil size={15} /></button>
                        <button onClick={() => handleDelete(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', transition: 'color 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
                          onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}><Trash2 size={15} /></button>
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
          <div style={{ position: 'relative', background: '#fff', width: '100%', maxWidth: 640, marginTop: 8, marginBottom: 8 }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 40px', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <div>
                <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, fontWeight: 300, color: '#111' }}>
                  {editing ? 'Editar producto' : 'Nuevo producto'}
                </h2>
                <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>
                  {editing ? `Editando: ${editing.name}` : 'Completa los datos del producto'}
                </p>
              </div>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 4 }}
                onMouseEnter={e => e.currentTarget.style.color = '#111'}
                onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '36px 40px 40px' }}>

              {/* Nombre */}
              <div style={{ marginBottom: 28 }}>
                <label style={iLabel}>Nombre *</label>
                <input {...register('name')} style={{ ...iField, borderBottomColor: errors.name ? '#DC2626' : '#E5E7EB' }} />
                {errors.name && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 6 }}>{errors.name.message}</p>}
              </div>

              {/* Categoría + Marca */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
                <div>
                  <label style={iLabel}>Categoría</label>
                  <select {...register('category')} style={{ ...iField, cursor: 'pointer' }}>
                    <option value="">Sin categoría</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={iLabel}>Marca</label>
                  <input {...register('brand')} style={iField} />
                </div>
              </div>

              {/* Precios */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
                <div>
                  <label style={iLabel}>Precio base *</label>
                  <input {...register('basePrice')} type="number" step="100"
                    style={{ ...iField, borderBottomColor: errors.basePrice ? '#DC2626' : '#E5E7EB' }} />
                  {errors.basePrice && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 6 }}>{errors.basePrice.message}</p>}
                </div>
                <div>
                  <label style={iLabel}>Precio mayorista</label>
                  <input {...register('wholesalePrice')} type="number" step="100" placeholder="Opcional" style={iField} />
                </div>
              </div>

              {/* Mín. mayorista + Destacado */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
                <div>
                  <label style={iLabel}>Mínimo mayorista (pares)</label>
                  <input {...register('wholesaleMinQty')} type="number" placeholder="Ej: 6" style={iField} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input {...register('featured')} type="checkbox" id="feat" style={{ width: 16, height: 16, accentColor: '#111', cursor: 'pointer' }} />
                    <span style={{ fontSize: 13, color: '#111' }}>Marcar como destacado</span>
                  </label>
                </div>
              </div>

              {/* Descripción */}
              <div style={{ marginBottom: 28 }}>
                <label style={iLabel}>Descripción</label>
                <textarea {...register('description')} rows={2}
                  style={{ ...iField, resize: 'none', lineHeight: 1.6 }} />
              </div>

              {/* Imágenes */}
              <div style={{ marginBottom: 28 }}>
                <label style={iLabel}>Imágenes</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', border: '1px dashed #E5E7EB', padding: '14px 16px', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#111'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}>
                  <Upload size={14} color="#9CA3AF" />
                  <span style={{ fontSize: 13, color: '#6B7280' }}>{images.length > 0 ? `${images.length} imagen(es) seleccionada(s)` : 'Seleccionar imágenes'}</span>
                  <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => setImages(Array.from(e.target.files))} />
                </label>
                {editing?.images?.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    {editing.images.map(img => <img key={img.id} src={img.url} alt="" style={{ width: 48, height: 48, objectFit: 'cover', border: '1px solid #E5E7EB' }} />)}
                    <p style={{ fontSize: 11, color: '#9CA3AF' }}>Subir nuevas las agrega a las existentes</p>
                  </div>
                )}
              </div>

              {/* Variantes */}
              <div style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <label style={iLabel}>Variantes</label>
                  <button type="button" onClick={() => setVariants(v => [...v, { size: '', color: '', stock: 0 }])}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#111'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}>
                    <Plus size={12} /> Agregar
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {variants.map((v, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
                      {[['size', 'Talla'], ['color', 'Color']].map(([f, ph]) => (
                        <div key={f} style={{ flex: 1 }}>
                          {i === 0 && <label style={iLabel}>{ph}</label>}
                          <input value={v[f]} placeholder={ph}
                            onChange={e => setVariants(vs => vs.map((r, idx) => idx === i ? { ...r, [f]: e.target.value } : r))}
                            style={iField} />
                        </div>
                      ))}
                      <div style={{ width: 80 }}>
                        {i === 0 && <label style={iLabel}>Stock</label>}
                        <input value={v.stock} type="number" min={0} placeholder="0"
                          onChange={e => setVariants(vs => vs.map((r, idx) => idx === i ? { ...r, stock: parseInt(e.target.value) || 0 } : r))}
                          style={iField} />
                      </div>
                      {variants.length > 1 && (
                        <button type="button" onClick={() => setVariants(v => v.filter((_, idx) => idx !== i))}
                          style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', paddingBottom: 10, flexShrink: 0 }}
                          onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
                          onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}>
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
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
                  {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
