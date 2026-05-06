export default function SectionEyebrow({ children, className = '' }) {
  return (
    <p className={`text-[10px] tracking-[3px] uppercase text-stone ${className}`}>
      {children}
    </p>
  )
}
