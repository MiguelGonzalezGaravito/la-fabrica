const variants = {
  new:       'bg-ink text-white',
  sale:      'bg-gold text-white',
  hot:       'bg-danger text-white',
  soldout:   'bg-line text-stone',
  wholesale: 'bg-success text-white',
}

export default function Badge({ variant = 'new', children, className = '' }) {
  return (
    <span className={`inline-block text-[9px] tracking-[1.5px] uppercase font-medium px-2 py-[3px] ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
