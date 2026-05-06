import { Link } from 'react-router-dom'

const GALLERY = [
  '/images/hero-1.png',
  '/images/hero-2.png',
  '/images/hero-3.png',
  '/images/hero-4.png',
  '/images/hero-5.png',
]

export default function Footer() {
  return (
    <footer className="mt-auto">

      {/* Instagram-style photo strip */}
      <div className="grid grid-cols-5 overflow-hidden">
        {GALLERY.map((src, i) => (
          <div key={i} className="aspect-square overflow-hidden bg-sand relative group">
            <img src={src} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            {i === 2 && (
              <div className="absolute inset-0 bg-ink/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[12px] tracking-[2px] uppercase text-white">@lafabrica</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main footer */}
      <div className="bg-ink text-white/50">
        <div className="page-container" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-14">

            {/* Marca */}
            <div className="col-span-2 md:col-span-1">
              <div className="mb-6">
                <span className="font-display text-2xl font-light text-white tracking-widest">La Fábrica</span>
                <p className="text-[10px] tracking-[3px] uppercase text-white/25 mt-1">Calzado · Colombia</p>
              </div>
              <p className="text-[14px] leading-relaxed text-white/45 mb-7">
                Calzado femenino artesanal.<br />Directo de fábrica · Medellín
              </p>
              <div className="border border-white/10 px-4 py-3 inline-block">
                <p className="text-[10px] tracking-[2px] uppercase text-white/25 mb-1.5">Pagos</p>
                <p className="text-[14px] text-white/60 font-light">Bancolombia · @lafabrica</p>
              </div>
            </div>

            {/* Mayoristas */}
            <div>
              <h4 className="text-[11px] tracking-[2.5px] uppercase text-white/35 mb-6">Mayoristas</h4>
              <ul className="space-y-4 text-[14px]">
                <li><Link to="/mayoristas" className="hover:text-white transition-colors">Cómo ser mayorista</Link></li>
                <li><Link to="/catalogo" className="hover:text-white transition-colors">Catálogo mayorista</Link></li>
                <li><Link to="/registro" className="hover:text-white transition-colors">Crear cuenta</Link></li>
              </ul>
            </div>

            {/* Catálogo */}
            <div>
              <h4 className="text-[11px] tracking-[2.5px] uppercase text-white/35 mb-6">Colección</h4>
              <ul className="space-y-4 text-[14px]">
                <li><Link to="/catalogo" className="hover:text-white transition-colors">Novedades</Link></li>
                <li><Link to="/catalogo?category=Sandalias" className="hover:text-white transition-colors">Sandalias</Link></li>
                <li><Link to="/catalogo?category=Espadrilles" className="hover:text-white transition-colors">Espadrilles</Link></li>
                <li><Link to="/catalogo?category=Plataformas" className="hover:text-white transition-colors">Plataformas</Link></li>
              </ul>
            </div>

            {/* Ayuda */}
            <div>
              <h4 className="text-[11px] tracking-[2.5px] uppercase text-white/35 mb-6">Ayuda</h4>
              <ul className="space-y-4 text-[14px]">
                <li><Link to="/pedidos" className="hover:text-white transition-colors">Mis pedidos</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
                <li><span className="cursor-default">Contáctanos</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[12px] tracking-wide text-white/25">
              © {new Date().getFullYear()} La Fábrica · Medellín, Colombia
            </p>
            <div className="flex items-center gap-2">
              {['Nequi', 'Bancolombia', 'QR'].map(p => (
                <span key={p} className="text-[11px] tracking-[0.5px] uppercase text-white/25 border border-white/10 px-3 py-1.5">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}