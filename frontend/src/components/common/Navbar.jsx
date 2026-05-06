import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, User, Menu, X, Bell, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { useAuthModalStore } from '../../store/authModalStore'
import { getUnreadCount } from '../../api/notifications.api'

export default function Navbar() {
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled,     setScrolled]     = useState(false)
  const [unread,       setUnread]       = useState(0)
  const { user, logout } = useAuthStore()
  const { cart, setOpen } = useCartStore()
  const { openLogin, openRegister } = useAuthModalStore()
  const navigate = useNavigate()
  const itemCount = cart?.itemCount || 0

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      getUnreadCount().then(r => setUnread(r.data.count || 0)).catch(() => {})
    }
  }, [user])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => { logout(); setUserMenuOpen(false); navigate('/') }

  return (
    <div className="sticky top-0 z-50">

      {/* Main header */}
      <header className={`bg-white transition-shadow ${scrolled ? 'shadow-[0_1px_0_#D0D8EE]' : 'border-b border-line'}`}>
        <div className="page-container h-16 flex items-center justify-between" style={{ maxWidth: 1200, marginLeft: 'auto', marginRight: 'auto' }}>

          {/* Left nav */}
          <nav className="hidden md:flex items-center gap-8 flex-1">
            <NavLink to="/catalogo"
              className={({ isActive }) => `text-[13px] tracking-widest uppercase transition-colors ${isActive ? 'text-ink' : 'text-stone hover:text-ink'}`}>
              Colección
            </NavLink>
            <NavLink to="/#mayoristas"
              className={() => `text-[13px] tracking-widest uppercase transition-colors text-stone hover:text-ink`}>
              Mayoristas
            </NavLink>
          </nav>

          {/* Logo — centered */}
          <Link to="/" className="flex flex-col items-center leading-none shrink-0">
            <span className="font-display text-4xl font-light text-ink tracking-widest">La Fábrica</span>
            <span className="text-[8px] tracking-[4px] uppercase text-fog mt-1">Calzado · Colombia</span>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-5 flex-1 justify-end">
            {!user && (
              <div className="hidden md:flex items-center gap-3">
                <button onClick={openLogin}
                  className="text-[11px] tracking-[2px] uppercase text-stone hover:text-ink transition-colors">
                  Iniciar sesión
                </button>
                <span style={{ color: '#D0D8EE', fontSize: 14 }}>|</span>
                <button onClick={openRegister}
                  className="text-[11px] tracking-[2px] uppercase px-4 py-2 bg-ink text-white hover:opacity-80 transition-opacity">
                  Crear cuenta
                </button>
              </div>
            )}

            {user && user.role !== 'ADMIN' && unread > 0 && (
              <Link to="/pedidos" className="relative text-stone hover:text-ink transition-colors">
                <Bell size={17} />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-danger text-white text-[8px] flex items-center justify-center rounded-full">
                  {unread > 9 ? '9+' : unread}
                </span>
              </Link>
            )}

            {user && user.role !== 'ADMIN' && (
              <button onClick={() => setOpen(true)} className="relative text-stone hover:text-ink transition-colors">
                <ShoppingBag size={18} />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-ink text-white text-[8px] flex items-center justify-center rounded-full">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            )}

            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 text-stone hover:text-ink transition-colors">
                  <User size={17} />
                  <span className="hidden md:block text-[13px] tracking-widest uppercase text-stone">{user.firstName}</span>
                  <ChevronDown size={11} className="text-fog" />
                </button>
                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 12px)',
                    width: 220, background: '#fff', border: '1px solid #D0D8EE',
                    zIndex: 50,
                  }}>
                    {/* Header con nombre */}
                    <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #D0D8EE' }}>
                      <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A8B4D0', marginBottom: 6 }}>
                        {user.role === 'ADMIN' ? 'Administrador' : 'Mi cuenta'}
                      </p>
                      <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontWeight: 300, color: '#1E3260', lineHeight: 1 }}>
                        {user.firstName} {user.lastName}
                      </p>
                    </div>

                    {/* Links */}
                    <div style={{ padding: '8px 0' }}>
                      {user.role === 'ADMIN' ? (
                        <Link to="/admin/dashboard" onClick={() => setUserMenuOpen(false)}
                          style={{ display: 'block', padding: '12px 20px', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6878A8', textDecoration: 'none', transition: 'color 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#1E3260'}
                          onMouseLeave={e => e.currentTarget.style.color = '#6878A8'}>
                          Panel Admin
                        </Link>
                      ) : (
                        <Link to="/pedidos" onClick={() => setUserMenuOpen(false)}
                          style={{ display: 'block', padding: '12px 20px', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6878A8', textDecoration: 'none', transition: 'color 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#1E3260'}
                          onMouseLeave={e => e.currentTarget.style.color = '#6878A8'}>
                          Mis pedidos
                        </Link>
                      )}
                      <Link to="/carrito" onClick={() => setUserMenuOpen(false)}
                        style={{ display: 'block', padding: '12px 20px', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6878A8', textDecoration: 'none', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#1E3260'}
                        onMouseLeave={e => e.currentTarget.style.color = '#6878A8'}>
                        Mi carrito
                      </Link>
                    </div>

                    {/* Cerrar sesión */}
                    <div style={{ borderTop: '1px solid #D0D8EE', padding: 16 }}>
                      <button onClick={handleLogout}
                        style={{ width: '100%', padding: '10px', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', background: '#1E3260', color: '#fff', border: 'none', cursor: 'pointer', transition: 'opacity 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={openLogin} className="md:hidden text-stone hover:text-ink transition-colors">
                <User size={17} />
              </button>
            )}

            <button className="md:hidden text-stone hover:text-ink" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-line px-6 py-6 space-y-5">
            <Link to="/catalogo" onClick={() => setMenuOpen(false)} className="block text-[11px] tracking-widest uppercase text-stone hover:text-ink">Colección</Link>
            <Link to="/#mayoristas" onClick={() => setMenuOpen(false)} className="block text-[11px] tracking-widest uppercase text-stone hover:text-ink">Mayoristas</Link>
            {!user && (
              <>
                <button onClick={() => { openLogin(); setMenuOpen(false) }} className="block text-[11px] tracking-widest uppercase text-stone hover:text-ink">Iniciar sesión</button>
                <button onClick={() => { openRegister(); setMenuOpen(false) }} className="block text-[11px] tracking-widest uppercase text-stone hover:text-ink">Crear cuenta</button>
              </>
            )}
          </div>
        )}
      </header>
    </div>
  )
}
