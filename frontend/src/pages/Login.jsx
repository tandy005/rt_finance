import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Building2, Lock, Mail, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login } from '../api/auth'
import useAuthStore from '../store/authStore'
import Button from '../components/ui/Button'

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      const res = await login(data)
      const { token, user } = res.data.data
      setAuth(token, user)
      toast.success(`Selamat datang, ${user.name}! 👋`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login gagal, coba lagi'
      toast.error(msg)
    }
  }

  return (
    <div className="bg-rt-primary border border-rt-dark rounded-3xl p-8 shadow-2xl">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl mb-4 overflow-hidden border-2 border-white/20">
          <img src="/logo.png" alt="Logo RT" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-bold text-white">RT Finance Hub</h1>
        <p className="text-sm text-rt-goldlight mt-1">Manajemen Keuangan RT Transparan</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-rt-goldlight mb-1.5">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rt-light/60" />
            <input
              {...register('email')}
              type="email"
              placeholder="admin@rtfinance.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-rt-light/60 text-sm focus:outline-none focus:ring-2 focus:ring-rt-gold/60 focus:border-transparent transition-all"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-rt-goldlight mb-1.5">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rt-light/60" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-rt-light/60 text-sm focus:outline-none focus:ring-2 focus:ring-rt-gold/60 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rt-light/60 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          loading={isSubmitting}
          className="w-full py-3 mt-2 bg-rt-gold hover:bg-rt-goldlight text-rt-deep font-semibold rounded-xl shadow-lg shadow-rt-deep/40 transition-all"
          icon={<LogIn size={16} />}
        >
          {isSubmitting ? 'Sedang Masuk...' : 'Masuk'}
        </Button>
      </form>

      {/* Demo credentials */}
      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
        <p className="text-xs text-center text-slate-400 mb-2 font-medium">Demo Credentials</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
          <div>
            <p className="text-rt-gold font-semibold">Admin</p>
            <p>admin@rtfinance.com</p>
            <p>admin123</p>
          </div>
          <div>
            <p className="text-emerald-300 font-semibold">Viewer</p>
            <p>warga@rtfinance.com</p>
            <p>warga123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
