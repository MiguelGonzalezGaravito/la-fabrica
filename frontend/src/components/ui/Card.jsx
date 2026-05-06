export default function Card({ title, subtitle, action, children, className = '' }) {
  return (
    <div className={`bg-white border border-line ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div>
            {title && <p className="text-[11px] tracking-[2px] uppercase text-stone">{title}</p>}
            {subtitle && <p className="text-[11px] text-fog mt-0.5">{subtitle}</p>}
          </div>
          {action && (
            <button onClick={action.onClick}
              className="text-[10px] tracking-[1.5px] uppercase text-stone hover:text-ink transition-colors">
              {action.label}
            </button>
          )}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}
