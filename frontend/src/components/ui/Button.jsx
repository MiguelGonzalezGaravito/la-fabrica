const base = 'inline-flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed text-[11px] tracking-widest uppercase font-medium px-6 py-3'

const variants = {
  primary:   'bg-ink text-white hover:opacity-75',
  secondary: 'border border-ink text-ink bg-transparent hover:bg-ink hover:text-white',
  ghost:     'text-stone bg-transparent hover:text-ink px-0',
  danger:    'border border-danger/40 text-danger bg-transparent hover:bg-danger hover:text-white',
  gold:      'bg-gold text-white hover:opacity-80',
}

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
