import { useEffect, useState } from 'react'
import { Users, Search, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/admin/AdminLayout'
import Spinner from '../../components/common/Spinner'
import { getAdminCustomers, updateCustomerType } from '../../api/admin.api'
import { formatDate } from '../../utils/formatters'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')

  const load = () => {
    setLoading(true)
    getAdminCustomers().then(r => setCustomers(r.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleToggleType = async (customer) => {
    const newType = customer.businessType === 'WHOLESALE' ? 'RETAIL' : 'WHOLESALE'
    try {
      await updateCustomerType(customer.id, newType)
      toast.success(`${customer.firstName} ahora es ${newType === 'WHOLESALE' ? 'mayorista' : 'minorista'}`)
      load()
    } catch { toast.error('Error al actualizar') }
  }

  const filtered = customers.filter(c =>
    !search || [c.firstName, c.lastName, c.email, c.phone].join(' ').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 300, color: '#111', marginBottom: 6 }}>Clientes</h1>
            <p style={{ fontSize: 13, color: '#9CA3AF' }}>{customers.length} cliente{customers.length !== 1 ? 's' : ''} · {customers.filter(c => c.businessType === 'WHOLESALE').length} mayoristas</p>
          </div>
          <button onClick={load} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 8 }}
            onMouseEnter={e => e.currentTarget.style.color = '#111'}
            onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}>
            <RefreshCw size={16} />
          </button>
        </div>

        <div style={{ position: 'relative', maxWidth: 360 }}>
          <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email..."
            style={{ width: '100%', borderBottom: '1px solid #E5E7EB', background: 'transparent', paddingLeft: 24, paddingRight: 16, paddingTop: 10, paddingBottom: 10, fontSize: 13, color: '#111', outline: 'none', transition: 'border-color 0.15s' }}
            onFocus={e => e.currentTarget.style.borderBottomColor = '#111'}
            onBlur={e => e.currentTarget.style.borderBottomColor = '#E5E7EB'}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <Users size={36} color="#E5E7EB" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, color: '#6B7280' }}>{search ? 'Sin resultados' : 'Sin clientes aún'}</p>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  {['Cliente', 'Teléfono', 'Registrado', 'Tipo', 'Acción'].map((h, i) => (
                    <th key={i} style={{ padding: '14px 24px', textAlign: 'left', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 400 }}
                      className={i === 1 ? 'hidden md:table-cell' : i === 2 ? 'hidden lg:table-cell' : ''}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #E5E7EB', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                    <td style={{ padding: '16px 24px' }}>
                      <p style={{ fontSize: 14, color: '#111', marginBottom: 4 }}>{c.firstName} {c.lastName}</p>
                      <p style={{ fontSize: 12, color: '#9CA3AF' }}>{c.email}</p>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: 13, color: '#6B7280' }} className="hidden md:table-cell">{c.phone || '—'}</td>
                    <td style={{ padding: '16px 24px', fontSize: 13, color: '#6B7280' }} className="hidden lg:table-cell">{formatDate(c.createdAt)}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em',
                        padding: '4px 10px',
                        border: `1px solid ${c.businessType === 'WHOLESALE' ? 'rgba(184,145,42,0.4)' : '#E5E7EB'}`,
                        color: c.businessType === 'WHOLESALE' ? '#B8912A' : '#6B7280',
                      }}>
                        {c.businessType === 'WHOLESALE' ? 'Mayorista' : 'Minorista'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <button
                        onClick={() => handleToggleType(c)}
                        style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#111'}
                        onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
                      >
                        {c.businessType === 'WHOLESALE' ? '→ Minorista' : '→ Mayorista'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
