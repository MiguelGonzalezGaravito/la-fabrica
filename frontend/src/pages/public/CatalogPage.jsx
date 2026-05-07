import { useEffect, useState } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'
import PublicLayout from '../../components/common/PublicLayout'
import ProductCard from '../../components/product/ProductCard'
import Spinner from '../../components/common/Spinner'
import { getProducts } from '../../api/products.api'

const CATEGORIES = ['Sandalias', 'Espadrilles', 'Plataformas']

export default function CatalogPage() {
  const [products,    setProducts]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [page,        setPage]        = useState(0)
  const [totalPages,  setTotalPages]  = useState(0)
  const [totalItems,  setTotalItems]  = useState(0)
  const [filters,     setFilters]     = useState({ category: '', sortBy: 'createdAt', sortDir: 'desc' })

  useEffect(() => { loadProducts() }, [page, filters])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const res = await getProducts({ ...filters, page, size: 12, category: filters.category || undefined })
      setProducts(res.data.content)
      setTotalPages(res.data.totalPages)
      setTotalItems(res.data.totalElements ?? res.data.content?.length ?? 0)
    } catch { setProducts([]) }
    finally { setLoading(false) }
  }

  const handleFilter = (key, value) => { setFilters(p => ({ ...p, [key]: value })); setPage(0) }

  return (
    <PublicLayout>

      {/* Header */}
      <section className="bg-[#faf8f5] border-b border-line" style={{ padding: '64px 0 56px' }}>
        <div className="page-container">
          <p className="text-[10px] tracking-[3px] uppercase text-fog" style={{ marginBottom: 12 }}>Catálogo</p>
          <h1 className="font-display text-5xl md:text-6xl font-light text-ink" style={{ marginBottom: 10 }}>Colección</h1>
          <p className="text-[13px] text-stone">Calzado de dama · Precios mayoristas · Despacho nacional</p>
        </div>
      </section>

      <div className="page-container" style={{ paddingTop: 48, paddingBottom: 80 }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 48, paddingBottom: 24, borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9CA3AF', marginRight: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <SlidersHorizontal size={12} />Filtrar:
            </span>
            <button
              onClick={() => handleFilter('category', '')}
              style={{
                padding: '9px 18px', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase',
                background: !filters.category ? '#111' : 'none',
                color: !filters.category ? '#fff' : '#6B7280',
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (filters.category !== '') e.currentTarget.style.color = '#111' }}
              onMouseLeave={e => { if (filters.category !== '') e.currentTarget.style.color = '#6B7280' }}>
              Todo
            </button>
            {CATEGORIES.map(cat => (
              <button key={cat}
                onClick={() => handleFilter('category', filters.category === cat ? '' : cat)}
                style={{
                  padding: '9px 18px', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase',
                  background: filters.category === cat ? '#111' : 'none',
                  color: filters.category === cat ? '#fff' : '#6B7280',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (filters.category !== cat) e.currentTarget.style.color = '#111' }}
                onMouseLeave={e => { if (filters.category !== cat) e.currentTarget.style.color = '#6B7280' }}>
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {totalItems > 0 && (
              <span style={{ fontSize: 13, color: '#9CA3AF' }}>{totalItems} productos</span>
            )}
            <select
              value={`${filters.sortBy}-${filters.sortDir}`}
              onChange={e => {
                const [sortBy, sortDir] = e.target.value.split('-')
                setFilters(p => ({ ...p, sortBy, sortDir })); setPage(0)
              }}
              style={{ borderBottom: '1px solid #E5E7EB', borderTop: 'none', borderLeft: 'none', borderRight: 'none', background: 'transparent', fontSize: 13, color: '#6B7280', padding: '6px 4px', outline: 'none', cursor: 'pointer' }}>
              <option value="createdAt-desc">Más nuevos</option>
              <option value="basePrice-asc">Precio: menor a mayor</option>
              <option value="basePrice-desc">Precio: mayor a menor</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-24"><Spinner /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display text-3xl font-light text-fog/40 mb-4">Sin productos</p>
            <button onClick={() => { setFilters({ category: '', sortBy: 'createdAt', sortDir: 'desc' }); setPage(0) }}
              className="text-[10px] tracking-[1.5px] uppercase text-stone hover:text-ink underline underline-offset-4 transition-colors">
              Ver todo
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" style={{ gap: '40px 24px' }}>
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-8" style={{ marginTop: 72, paddingTop: 32, borderTop: '1px solid #E5E7EB' }}>
                <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                  className="text-[10px] tracking-widest uppercase text-stone hover:text-ink disabled:opacity-25 transition-colors">
                  ← Anterior
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} onClick={() => setPage(i)}
                      className={`w-7 h-7 text-[11px] transition-all ${
                        i === page ? 'bg-ink text-white' : 'text-stone hover:text-ink'
                      }`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                  className="text-[10px] tracking-widest uppercase text-stone hover:text-ink disabled:opacity-25 transition-colors">
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  )
}
