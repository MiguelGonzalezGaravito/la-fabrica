import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { User, Building2 } from 'lucide-react'
import { register as registerApi } from '../../api/auth.api'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { Button } from '../../components/ui'

const schema = z.object({
  firstName:    z.string().min(2, 'Mínimo 2 caracteres'),
  lastName:     z.string().min(2, 'Mínimo 2 caracteres'),
  email:        z.string().email('Email inválido'),
  phone:        z.string().optional(),
  password:     z.string().min(6, 'Mínimo 6 caracteres'),
  businessType: z.enum(['RETAIL', 'WHOLESALE']),
})

const TYPES = [
  { value: 'RETAIL',    label: 'Cliente individual', desc: 'Compra para uso personal',          icon: User },
  { value: 'WHOLESALE', label: 'Distribuidora',       desc: 'Precios especiales por volumen',    icon: Building2, recommended: true },
]

const fieldCls = 'w-full border-b border-line bg-transparent text-[13px] text-ink py-2.5 focus:outline-none focus:border-ink transition-colors placeholder:text-fog/50'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const { fetchCart } = useCartStore()
  const navigate = useNavigate()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { businessType: 'RETAIL' },
  })

  const businessType = watch('businessType')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await registerApi(data)
      setAuth(res.data, res.data.token)
      await fetchCart()
      toast.success('¡Cuenta creada!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-surface">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <span className="font-display text-3xl font-light text-ink tracking-wide">La Fábrica</span>
            <p className="text-[9px] tracking-[3px] uppercase text-fog mt-1">Mayorista · Colombia</p>
          </Link>
        </div>

        <div className="bg-white border border-line p-8">
          <h2 className="font-display text-2xl font-light text-ink mb-8">Crear cuenta</h2>

          {/* Selector tipo */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {TYPES.map(opt => {
              const Icon = opt.icon
              const active = businessType === opt.value
              return (
                <button key={opt.value} type="button"
                  onClick={() => setValue('businessType', opt.value, { shouldValidate: true })}
                  className={`border p-4 text-left transition-all ${active ? 'border-ink' : 'border-line hover:border-stone'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <Icon size={14} className={active ? 'text-ink' : 'text-fog'} />
                    {opt.recommended && (
                      <span className="text-[8px] tracking-[1px] uppercase bg-ink text-white px-1.5 py-0.5">
                        Recomendado
                      </span>
                    )}
                  </div>
                  <p className={`text-[12px] font-medium leading-tight ${active ? 'text-ink' : 'text-stone'}`}>{opt.label}</p>
                  <p className="text-[10px] text-fog mt-0.5">{opt.desc}</p>
                </button>
              )
            })}
          </div>

          <input type="hidden" {...register('businessType')} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] tracking-[2px] uppercase text-fog block mb-1.5">Nombre</label>
                <input {...register('firstName')} placeholder="Ana" className={`${fieldCls} ${errors.firstName ? 'border-danger' : ''}`} />
                {errors.firstName && <p className="text-[11px] text-danger mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="text-[10px] tracking-[2px] uppercase text-fog block mb-1.5">Apellido</label>
                <input {...register('lastName')} placeholder="Martínez" className={`${fieldCls} ${errors.lastName ? 'border-danger' : ''}`} />
                {errors.lastName && <p className="text-[11px] text-danger mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-[10px] tracking-[2px] uppercase text-fog block mb-1.5">Email</label>
              <input {...register('email')} type="email" placeholder="tu@email.com" className={`${fieldCls} ${errors.email ? 'border-danger' : ''}`} />
              {errors.email && <p className="text-[11px] text-danger mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-[10px] tracking-[2px] uppercase text-fog block mb-1.5">Teléfono (opcional)</label>
              <input {...register('phone')} placeholder="300 000 0000" className={fieldCls} />
            </div>

            <div>
              <label className="text-[10px] tracking-[2px] uppercase text-fog block mb-1.5">Contraseña</label>
              <input {...register('password')} type="password" placeholder="Mínimo 6 caracteres" className={`${fieldCls} ${errors.password ? 'border-danger' : ''}`} />
              {errors.password && <p className="text-[11px] text-danger mt-1">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>

          <p className="text-center text-[12px] text-stone mt-7">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-ink underline underline-offset-2 hover:opacity-60 transition-opacity">
              Ingresar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
