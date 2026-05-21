import axios from 'axios'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 30000,
  headers: { 
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420'
  },
})

// ── Request Interceptor — Inject JWT token ─────────────────
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor — Handle 401 ─────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      toast.error('Sesi berakhir, silakan login kembali')
    } else if (error.response?.status === 403) {
      toast.error('Anda tidak memiliki akses ke fitur ini')
    } else if (error.response?.status >= 500) {
      toast.error('Terjadi kesalahan server, coba beberapa saat lagi')
    }
    return Promise.reject(error)
  }
)

export default api
