export default function Spinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]
  return (
    <div className="flex justify-center items-center py-8">
      <div className={`${s} border-4 border-amber-200 border-t-amber-700 rounded-full animate-spin`} />
    </div>
  )
}
