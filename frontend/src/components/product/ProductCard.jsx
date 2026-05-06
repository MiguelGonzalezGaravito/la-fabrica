import { Link } from 'react-router-dom'
import { formatPrice } from '../../utils/formatters'
import { useAuthStore } from '../../store/authStore'

export default function ProductCard({ product }) {
  const { user } = useAuthStore()
  const isWholesale = user?.businessType === 'WHOLESALE'

  return (
    <Link to={`/producto/${product.id}`} className="group flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden bg-cream aspect-[3/4] mb-4">
        {product.primaryImageUrl ? (
          <img
            src={product.primaryImageUrl}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-surface" />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-500" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {!product.hasStock && (
            <span className="text-[9px] tracking-[1.5px] uppercase bg-stone text-white px-2.5 py-1">Agotado</span>
          )}
          {product.featured && product.hasStock && (
            <span className="text-[9px] tracking-[1.5px] uppercase bg-white text-ink px-2.5 py-1">Destacado</span>
          )}
          {isWholesale && product.wholesalePrice && product.hasStock && (
            <span className="text-[9px] tracking-[1.5px] uppercase bg-gold text-white px-2.5 py-1">Mayorista</span>
          )}
        </div>

        {/* Quick view — aparece en hover */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <div className="bg-white/95 text-center py-3">
            <span className="text-[10px] tracking-[2px] uppercase text-ink">Ver producto</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 px-0.5">
        {product.category && (
          <p className="text-[9px] tracking-[2px] uppercase text-fog">{product.category}</p>
        )}
        <h3 className="font-display text-[17px] font-light text-ink leading-tight line-clamp-2 group-hover:opacity-70 transition-opacity">
          {product.name}
        </h3>
        <div className="mt-1.5">
          {isWholesale && product.wholesalePrice ? (
            <div className="flex items-baseline gap-2">
              <span className="text-[11px] text-fog line-through">{formatPrice(product.basePrice)}</span>
              <span className="font-display text-[18px] font-light text-gold">{formatPrice(product.wholesalePrice)}</span>
            </div>
          ) : (
            <span className="font-display text-[18px] font-light text-ink">{formatPrice(product.basePrice)}</span>
          )}
        </div>
        {isWholesale && product.wholesaleMinQty && (
          <p className="text-[9px] tracking-[1px] uppercase text-fog">Mín. {product.wholesaleMinQty} pares</p>
        )}
      </div>
    </Link>
  )
}
