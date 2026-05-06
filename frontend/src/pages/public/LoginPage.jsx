import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { login } from '../../api/auth.api'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'

const schema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

const iField = {
  width: '100%', borderBottom: '1px solid #D0D8EE',
  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
  background: 'transparent', fontSize: 14, color: '#1E3260',
  padding: '12px 0', outline: 'none',
}
const iLabel = {
  fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
  color: '#A8B4D0', display: 'block', marginBottom: 8,
}

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false)
  const { setAuth } = useAuthStore()
  const { fetchCart } = useCartStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    try {
      const res = await login(data)
      setAuth(res.data, res.data.token)
      if (res.data.role !== 'ADMIN') await fetchCart()
      toast.success(`Bienvenida, ${res.data.firstName}`)
      navigate(res.data.role === 'ADMIN' ? '/admin/dashboard' : '/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenciales incorrectas')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: '#F2F5FC' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2.5rem', fontWeight: 300, color: '#1E3260', letterSpacing: '0.05em' }}>
              La Fábrica
            </span>
            <p style={{ fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#A8B4D0', marginTop: 4 }}>
              Calzado · Colombia
            </p>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', padding: '40px 40px 48px' }}>

          <p style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#D85880', marginBottom: 10 }}>
            La Fábrica
          </p>
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, fontWeight: 300, color: '#1E3260', marginBottom: 32 }}>
            Iniciar sesión
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            <div>
              <label style={iLabel}>Correo electrónico</label>
              <input {...register('email')} type="email" placeholder="hola@ejemplo.com"
                style={{ ...iField, borderBottomColor: errors.email ? '#DC2626' : '#D0D8EE' }} />
              {errors.email && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 5 }}>{errors.email.message}</p>}
            </div>

            <div>
              <label style={iLabel}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input {...register('password')} type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  style={{ ...iField, borderBottomColor: errors.password ? '#DC2626' : '#D0D8EE', paddingRight: 28 }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#A8B4D0', padding: 4 }}>
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 5 }}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting}
              style={{ width: '100%', background: '#1E3260', color: '#fff', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', padding: '14px 0', marginTop: 8, opacity: isSubmitting ? 0.6 : 1, transition: 'opacity 0.15s' }}
              onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.opacity = '0.8' }}
              onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.opacity = '1' }}>
              {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p style={{ fontSize: 11, color: '#A8B4D0', textAlign: 'center', marginTop: 24 }}>
            ¿No tienes cuenta?{' '}
            <Link to="/registro" style={{ color: '#D85880', textDecoration: 'underline', fontSize: 11 }}>
              Regístrate
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}