import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingCart, Package, Users, Tag,
  LogOut, Menu, X, Bell, ChevronRight
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const sections = [
  {
    label: 'Principal',
    items: [
      { to: '/admin/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/admin/pedidos',     icon: ShoppingCart,    label: 'Pedidos' },
      { to: '/admin/productos',   icon: Package,         label: 'Productos' },
      { to: '/admin/clientes',    icon: Users,           label: 'Clientes' },
    ]
  },
  {
    label: 'Gestión',
    items: [
      { to: '/admin/promociones', icon: Tag, label: 'Promociones' },
    ]
  },
]

const pageTitles = {
  '/admin/dashboard':   'Dashboard',
  '/admin/pedidos':     'Pedidos',
  '/admin/productos':   'Productos',
  '/admin/clientes':    'Clientes',
  '/admin/promociones': 'Promociones',
}

function SidebarContent({ onClose }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="flex flex-col h-full bg-ink">
      {/* Header */}
      <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-display text-2xl font-light text-white tracking-widest">La Fábrica</span>
            <p style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>Panel Admin</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors lg:hidden">
              <X size={17} />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '24px 12px', overflowY: 'auto' }}>
        {sections.map(section => (
          <div key={section.label} style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', padding: '0 12px', marginBottom: 10 }}>
              {section.label}
            </p>
            <div>
              {section.items.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 transition-all duration-150 ${
                      isActive ? 'text-white bg-white/10' : 'text-white/45 hover:text-white/80'
                    }`
                  }
                  style={{ padding: '11px 12px', fontSize: 13, letterSpacing: '0.02em', marginBottom: 2 }}
                >
                  <Icon size={15} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', marginBottom: 4 }}>
          <div style={{ width: 30, height: 30, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500, flexShrink: 0 }}>
            {user?.firstName?.[0]}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.firstName} {user?.lastName}
            </p>
          </div>
        </div>
        <button onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 13 }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const pageTitle = pageTitles[location.pathname] || 'Admin'

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col shrink-0" style={{ width: 240, minHeight: '100vh', position: 'sticky', top: 0 }}>
        <SidebarContent />
      </aside>

      {/* Sidebar mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full flex flex-col" style={{ width: 240, zIndex: 51 }}>
            <SidebarContent onClose={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-line sticky top-0 z-40 flex items-center justify-between"
          style={{ height: 64, padding: '0 32px' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setOpen(true)} className="lg:hidden text-stone hover:text-ink">
              <Menu size={19} />
            </button>
            <div>
              <p style={{ fontSize: 16, fontWeight: 500, color: '#111' }}>{pageTitle}</p>
              <p style={{ fontSize: 11, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                Admin <ChevronRight size={10} /> {pageTitle}
              </p>
            </div>
          </div>
          <button className="relative text-stone hover:text-ink transition-colors">
            <Bell size={18} />
          </button>
        </header>

        <main style={{ flex: 1, overflow: 'auto', padding: '36px 36px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
