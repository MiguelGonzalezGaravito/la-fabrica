import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Truck, Clock, Shield, Users } from 'lucide-react'
import PublicLayout from '../../components/common/PublicLayout'
import ProductCard from '../../components/product/ProductCard'
import Spinner from '../../components/common/Spinner'
import { getFeatured } from '../../api/products.api'
import { useAuthModalStore } from '../../store/authModalStore'

const SLIDES = [
  { img: '/images/hero-6.png',  bg: 'from-[#4a3f35] to-[#8a7a6a]', eyebrow: 'Nueva Colección',     title: 'Hecha a mano,\npensada para ti',   pos: 'center bottom' },
  { img: '/images/hero-7.png',  bg: 'from-[#3a4a3a] to-[#7a8a6a]', eyebrow: 'Espíritu Colombiano', title: 'Diseñadas en\nBucaramanga',         pos: 'center center' },
  { img: '/images/hero-8.png',  bg: 'from-[#5a4a2a] to-[#b09060]', eyebrow: 'Temporada 2025',      title: 'Dorado que\nillumina cada paso',   pos: 'center center' },
  { img: '/images/hero-9.png',  bg: 'from-[#1a3040] to-[#4a7080]', eyebrow: 'Colección Brisa',     title: 'Para momentos\nque duran',          pos: 'center center' },
  { img: '/images/hero-10.png', bg: 'from-[#2a2520] to-[#5a5045]', eyebrow: 'Desde Bucaramanga',   title: 'Elegancia para\ncada ciudad',        pos: 'center center' },
]

const CATS = [
  { label: 'Espadrilles', sub: 'Artesanales',       img: '/images/hero-1.png', accent: '#F5C0CE', href: '/catalogo?category=Espadrilles' },
  { label: 'Sandalias',   sub: 'Para cada ocasión', img: '/images/hero-3.png', accent: '#B8CCEE', href: '/catalogo?category=Sandalias' },
  { label: 'Plataformas', sub: 'Con altura',         img: '/images/hero-2.png', accent: '#D4C0E8', href: '/catalogo?category=Plataformas' },
]

/* ─── Hero Slider ─── */
function HeroSlider() {
  const [cur, setCur]   = useState(0)
  const [show, setShow] = useState(true)
  const { openRegister } = useAuthModalStore()

  const go = useCallback((idx) => {
    setShow(false)
    setTimeout(() => { setCur(idx); setShow(true) }, 220)
  }, [])

  const next = useCallback(() => go((cur + 1) % SLIDES.length), [cur, go])
  const prev = useCallback(() => go((cur - 1 + SLIDES.length) % SLIDES.length), [cur, go])

  useEffect(() => { const t = setInterval(next, 5500); return () => clearInterval(t) }, [next])

  const s = SLIDES[cur]

  return (
    <div className="relative overflow-hidden" style={{ height: 'clamp(420px, 70vh, 620px)' }}>

      {/* Imagen fija — no se mueve con el carrusel */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/images/hero-11.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'local',
      }} />

      {/* Velo oscuro para legibilidad */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(30,50,96,0.52)' }} />

      {/* Contenido — solo esto anima */}
      <div className="page-container relative flex flex-col justify-end"
        style={{ height: '100%', paddingBottom: 'clamp(2.5rem, 5vh, 4rem)', opacity: show ? 1 : 0, transition: 'opacity 0.4s ease', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <p className="text-[10px] tracking-[4px] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.eyebrow}</p>
        <h1 className="font-display font-light text-white leading-[0.95] whitespace-pre-line mb-7"
          style={{ fontSize: 'clamp(3.5rem, 8vw, 7rem)' }}>
          {s.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/catalogo">
            <button style={{ background: '#fff', color: '#1E3260', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '12px 28px', border: 'none', cursor: 'pointer', transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              Ver colección
            </button>
          </Link>
          <button onClick={openRegister}
            className="text-[11px] tracking-[2px] uppercase flex items-center gap-2 transition-colors"
            style={{ color: 'rgba(255,255,255,0.55)', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}>
            Quiero ser mayorista <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Flechas */}
      <button onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-white"
        style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'none', cursor: 'pointer', transition: 'border-color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}>
        <ArrowLeft size={14} />
      </button>
      <button onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-white"
        style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'none', cursor: 'pointer', transition: 'border-color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}>
        <ArrowRight size={14} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 right-8 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => go(i)}
            style={{ height: 1, width: i === cur ? 32 : 12, background: i === cur ? '#fff' : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
        ))}
      </div>
      <div className="absolute bottom-6 left-8 text-[10px] tracking-[2px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {String(cur + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
      </div>
    </div>
  )
}

/* ─── Separador de sección ─── */
function Divider() {
  return <div className="border-t border-line" />
}

/* ─── Página ─── */
export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [loading,  setLoading]  = useState(true)
  const { openRegister, openLogin } = useAuthModalStore()

  useEffect(() => {
    getFeatured().then(r => setFeatured(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <PublicLayout>

      {/* ── HERO ── */}
      <HeroSlider />

      {/* ── PERKS ── */}
      <div className="bg-white border-b border-line">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { icon: Truck,  label: 'Envío a toda Colombia' },
              { icon: Clock,  label: 'Despacho en 48h' },
              { icon: Shield, label: 'Pago seguro QR' },
              { icon: Users,  label: '+20 distribuidoras' },
            ].map(({ icon: Icon, label }, i) => (
              <div key={i} className={`flex items-center justify-center gap-2.5 py-5 ${i < 3 ? 'border-r border-line' : ''}`}>
                <Icon size={13} className="text-stone shrink-0" />
                <span className="text-[11px] tracking-[1px] uppercase text-stone">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORÍAS ── */}
      <section className="bg-surface" style={{ padding: '80px 0 96px' }}>
        <div className="page-container">

          {/* Encabezado */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#D85880', marginBottom: 12 }}>Explorar</p>
              <h2 className="font-display text-3xl md:text-4xl font-light text-ink">Nuestra colección</h2>
            </div>
            <Link to="/catalogo"
              className="hidden md:flex items-center gap-2 transition-colors"
              style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A8B4D0' }}
              onMouseEnter={e => e.currentTarget.style.color = '#1E3260'}
              onMouseLeave={e => e.currentTarget.style.color = '#A8B4D0'}>
              Ver todo <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 20 }}>
            {CATS.map(cat => (
              <Link key={cat.label} to={cat.href} className="group block relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                <div className="absolute inset-0" style={{ backgroundColor: cat.accent }} />
                <img src={cat.img} alt={cat.label}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0" style={{ padding: '1.75rem 1.75rem 2rem' }}>
                  <p className="text-[9px] tracking-[3px] uppercase text-white/60 mb-2">{cat.sub}</p>
                  <h3 className="font-display text-2xl md:text-3xl font-light text-white mb-3">{cat.label}</h3>
                  <div className="flex items-center gap-2 text-white/55 text-[10px] tracking-[2px] uppercase group-hover:text-white group-hover:gap-3 transition-all">
                    Ver colección <ArrowRight size={10} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── PRODUCTOS DESTACADOS ── */}
      <section style={{ backgroundColor: '#F2F5FC', padding: '80px 0 96px' }}>
        <div className="page-container">

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#D85880', marginBottom: 10 }}>Selección</p>
              <h2 className="font-display text-3xl md:text-4xl font-light text-ink">Productos destacados</h2>
            </div>
            <Link to="/catalogo"
              className="hidden md:flex items-center gap-2 transition-colors"
              style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A8B4D0' }}
              onMouseEnter={e => e.currentTarget.style.color = '#1E3260'}
              onMouseLeave={e => e.currentTarget.style.color = '#A8B4D0'}>
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner /></div>
          ) : featured.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-line">
              <p className="font-display text-3xl font-light text-fog/30 mb-2">Próximamente</p>
              <p className="text-[11px] tracking-[2px] uppercase text-fog/30">nuevos modelos</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" style={{ gap: '56px 28px' }}>
              {featured.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 56 }} className="md:hidden">
            <Link to="/catalogo"
              style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A8B4D0', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(196,173,175,0.4)', paddingBottom: 2 }}>
              Ver toda la colección <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── MAYORISTAS: split full-width ── */}
      <section id="mayoristas" style={{ display: 'flex', minHeight: 560 }}>

        {/* Imagen — exactamente 50% del viewport */}
        <div style={{ width: '50%', backgroundColor: '#B8CCEE', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <img
            src="/images/hero-4.png"
            alt="Mayoristas"
            style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }}
          />
        </div>

        {/* Texto — exactamente 50% del viewport, fondo crema */}
        <div style={{ width: '50%', backgroundColor: '#F2F5FC', display: 'flex', alignItems: 'center', flexShrink: 0, padding: '4rem 5rem' }}>
          <div style={{ maxWidth: 400 }}>
            <p className="text-[10px] tracking-[4px] uppercase text-stone mb-5">Para distribuidoras</p>
            <h2 className="font-display font-light text-ink mb-8" style={{ fontSize: 'clamp(1.8rem, 2.5vw, 2.5rem)', lineHeight: 1.6 }}>
              Vende moda,<br />genera ingresos
            </h2>
            <p className="text-stone leading-relaxed" style={{ fontSize: 17, marginBottom: 24 }}>
              Únete a nuestra red de socias mayoristas y empieza a vender calzado artesanal colombiano con precios exclusivos, catálogo completo y acompañamiento personalizado.
            </p>
            <div style={{ borderBottom: '1px solid #E5E7EB', marginBottom: 24 }} />
            <div className="flex flex-col sm:flex-row gap-6">
              <button onClick={openRegister}
                className="bg-ink text-white text-[11px] tracking-[2.5px] uppercase px-8 py-3.5 hover:opacity-80 transition-opacity">
                Quiero ser socia
              </button>
              <button onClick={openLogin}
                className="text-[11px] tracking-[1.5px] uppercase text-stone hover:text-ink transition-colors flex items-center gap-2 py-3.5">
                Ya tengo cuenta →
              </button>
            </div>
          </div>
        </div>

      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-ink" style={{ padding: '120px 0 128px' }}>
        <div className="page-container text-center">
          <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>Únete</p>
          <h2 className="font-display font-light text-white leading-tight" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', marginBottom: 28 }}>
            Más de 20 distribuidoras<br />en Colombia
          </h2>
          <p style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto', fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 48 }}>
            Accede a precios exclusivos, catálogo completo y atención personalizada para tu negocio.
          </p>
          <button onClick={openRegister}
            style={{ background: '#EEF2FA', color: '#1E3260', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', padding: '16px 48px', border: 'none', cursor: 'pointer', transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.85}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}>
            Solicitar acceso mayorista
          </button>
        </div>
      </section>

    </PublicLayout>
  )
}
