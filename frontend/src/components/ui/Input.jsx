const fieldCls = 'w-full border-b border-line bg-transparent text-ink text-[13px] py-2.5 focus:outline-none focus:border-ink transition-colors placeholder:text-fog'
const labelCls = 'text-[10px] tracking-[2px] uppercase text-fog block mb-1.5'

export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col">
      {label && <label className={labelCls}>{label}</label>}
      <input
        className={`${fieldCls} ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] text-danger mt-1">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col">
      {label && <label className={labelCls}>{label}</label>}
      <textarea
        className={`${fieldCls} resize-none ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] text-danger mt-1">{error}</p>}
    </div>
  )
}

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className="flex flex-col">
      {label && <label className={labelCls}>{label}</label>}
      <select
        className={`${fieldCls} cursor-pointer ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-[11px] text-danger mt-1">{error}</p>}
    </div>
  )
}
