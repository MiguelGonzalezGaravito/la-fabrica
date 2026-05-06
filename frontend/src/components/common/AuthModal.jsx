import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useAuthModalStore } from '../../store/authModalStore'
import { useAuthStore } from '../../store/authStore'
import { login, register } from '../../api/auth.api'

const loginSchema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const registerSchema = z.object({
  firstName:    z.string().min(2, 'Requerido'),
  lastName:     z.string().min(2, 'Requerido'),
  email:        z.string().email('Email inválido'),
  phone:        z.string().min(7, 'Teléfono inválido'),
  city:         z.string().min(2, 'Requerido'),
  password:     z.string().min(6, 'Mínimo 6 caracteres'),
  businessType: z.enum(['RETAIL', 'WHOLESALE']),
})

const iField = {
  width: '100%',
  borderBottom: '1px solid #D0D8EE',
  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
  background: 'transparent',
  fontSize: 14,
  color: '#1E3260',
  padding: '12px 0',
  outline: 'none',
}

const iLabel = {
  fontSize: 10,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: '#A8B4D0',
  display: 'block',
  marginBottom: 8,
}

function Field({ label, error, children }) {
  return (
    <div>
      <label style={iLabel}>{label}</label>
      {children}
      {error && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 5 }}>{error}</p>}
    </div>
  )
}

function LoginForm({ onSuccess }) {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const { register: reg, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data) => {
    try {
      const res = await login(data)
      setAuth(res.data, res.data.token)
      toast.success(`Bienvenida, ${res.data.firstName}`)
      onSuccess()
      if (res.data.role === 'ADMIN') navigate('/admin/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenciales incorrectas')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Field label="Correo electrónico" error={errors.email?.message}>
        <input {...reg('email')} type="email" placeholder="hola@ejemplo.com"
          style={{ ...iField, borderBottomColor: errors.email ? '#DC2626' : '#D0D8EE' }} />
      </Field>
      <Field label="Contraseña" error={errors.password?.message}>
        <input {...reg('password')} type="password" placeholder="••••••••"
          style={{ ...iField, borderBottomColor: errors.password ? '#DC2626' : '#D0D8EE' }} />
      </Field>
      <button type="submit" disabled={isSubmitting}
        style={{ width: '100%', background: '#1E3260', color: '#fff', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', padding: '14px 0', marginTop: 8, opacity: isSubmitting ? 0.6 : 1, transition: 'opacity 0.15s' }}
        onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.opacity = '0.8' }}
        onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.opacity = isSubmitting ? '0.6' : '1' }}>
        {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
      </button>
    </form>
  )
}

function RegisterForm({ onSuccess }) {
  const { setAuth } = useAuthStore()
  const { register: reg, handleSubmit, formState: { errors, isSubmitting }, setValue, watch, setError } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { businessType: 'RETAIL' },
  })
  const businessType = watch('businessType')

  const onSubmit = async (data) => {
    try {
      const res = await register(data)
      setAuth(res.data, res.data.token)
      toast.success(`Cuenta creada. Bienvenida, ${res.data.firstName}`)
      onSuccess()
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) {
        // Errores de validación campo por campo desde Spring
        const e = data.errors
        if (e.email)        setError('email',     { message: e.email })
        if (e.password)     setError('password',  { message: e.password })
        if (e.firstName)    setError('firstName', { message: e.firstName })
        if (e.lastName)     setError('lastName',  { message: e.lastName })
        if (e.businessType) toast.error(e.businessType)
      } else {
        const msg = data?.message || 'Error al crear la cuenta'
        if (msg.toLowerCase().includes('email')) {
          setError('email', { message: 'Este correo ya tiene una cuenta registrada' })
        } else {
          toast.error(msg)
        }
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Nombre" error={errors.firstName?.message}>
          <input {...reg('firstName')} placeholder="Ana"
            style={{ ...iField, borderBottomColor: errors.firstName ? '#DC2626' : '#D0D8EE' }} />
        </Field>
        <Field label="Apellido" error={errors.lastName?.message}>
          <input {...reg('lastName')} placeholder="García"
            style={{ ...iField, borderBottomColor: errors.lastName ? '#DC2626' : '#D0D8EE' }} />
        </Field>
      </div>
      <Field label="Correo electrónico" error={errors.email?.message}>
        <input {...reg('email')} type="email" placeholder="hola@ejemplo.com"
          style={{ ...iField, borderBottomColor: errors.email ? '#DC2626' : '#D0D8EE' }} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Teléfono" error={errors.phone?.message}>
          <input {...reg('phone')} placeholder="300 123 4567"
            style={{ ...iField, borderBottomColor: errors.phone ? '#DC2626' : '#D0D8EE' }} />
        </Field>
        <Field label="Ciudad" error={errors.city?.message}>
          <input {...reg('city')} placeholder="Bucaramanga"
            style={{ ...iField, borderBottomColor: errors.city ? '#DC2626' : '#D0D8EE' }} />
        </Field>
      </div>
      <Field label="Contraseña" error={errors.password?.message}>
        <input {...reg('password')} type="password" placeholder="••••••••"
          style={{ ...iField, borderBottomColor: errors.password ? '#DC2626' : '#D0D8EE' }} />
      </Field>

      {/* Tipo de cuenta — botones explícitos con setValue */}
      <div>
        <label style={iLabel}>Tipo de cuenta</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[['RETAIL', 'Cliente final'], ['WHOLESALE', 'Mayorista']].map(([val, label]) => {
            const active = businessType === val
            return (
              <button key={val} type="button"
                onClick={() => setValue('businessType', val, { shouldValidate: true })}
                style={{
                  padding: '10px 14px',
                  border: `1px solid ${active ? '#1E3260' : '#D0D8EE'}`,
                  background: active ? '#1E3260' : 'transparent',
                  color: active ? '#fff' : '#6878A8',
                  fontSize: 12, textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                {label}
              </button>
            )
          })}
        </div>
        {errors.businessType && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 6 }}>{errors.businessType.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}
        style={{ width: '100%', background: '#1E3260', color: '#fff', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', padding: '14px 0', marginTop: 4, opacity: isSubmitting ? 0.6 : 1, transition: 'opacity 0.15s' }}
        onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.opacity = '0.8' }}
        onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.opacity = isSubmitting ? '0.6' : '1' }}>
        {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>
  )
}

export default function AuthModal() {
  const { isOpen, view, openLogin, openRegister, close } = useAuthModalStore()
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div onClick={close} style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(30,50,96,0.25)', backdropFilter: 'blur(4px)',
      }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 51,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}>
        <div style={{
          background: '#fff', width: '100%', maxWidth: 480,
          maxHeight: '90vh', overflowY: 'auto',
          padding: '40px 40px 48px',
          position: 'relative',
        }}>

          {/* Cerrar */}
          <button onClick={close} style={{
            position: 'absolute', top: 20, right: 20,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#A8B4D0', padding: 4, transition: 'color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#1E3260'}
            onMouseLeave={e => e.currentTarget.style.color = '#A8B4D0'}>
            <X size={16} />
          </button>

          {/* Eyebrow */}
          <p style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#D85880', marginBottom: 10 }}>
            La Fábrica
          </p>

          {/* Título */}
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, fontWeight: 300, color: '#1E3260', marginBottom: 32 }}>
            {view === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </h2>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #D0D8EE', marginBottom: 32 }}>
            {[['login', 'Iniciar sesión'], ['register', 'Crear cuenta']].map(([v, label]) => (
              <button key={v}
                onClick={() => v === 'login' ? openLogin() : openRegister()}
                style={{
                  flex: 1, padding: '10px 0', background: 'none', border: 'none',
                  borderBottom: view === v ? '2px solid #1E3260' : '2px solid transparent',
                  fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: view === v ? '#1E3260' : '#A8B4D0',
                  cursor: 'pointer', marginBottom: -1, transition: 'all 0.15s',
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Formulario */}
          {view === 'login'
            ? <LoginForm onSuccess={close} />
            : <RegisterForm onSuccess={close} />
          }

          {/* Footer texto */}
          <p style={{ fontSize: 11, color: '#A8B4D0', textAlign: 'center', marginTop: 24 }}>
            {view === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button onClick={() => view === 'login' ? openRegister() : openLogin()}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#D85880', textDecoration: 'underline', padding: 0 }}>
              {view === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </>
  )
}