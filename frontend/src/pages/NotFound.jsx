import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

const NotFound = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
    <div className="text-center">
      <p className="text-8xl font-black text-rt-primary/20 dark:text-rt-primary/20 mb-4">404</p>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Halaman Tidak Ditemukan</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">Halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rt-primary text-white text-sm font-medium hover:bg-rt-dark transition-colors"
      >
        <Home size={16} />
        Kembali ke Dashboard
      </Link>
    </div>
  </div>
)

export default NotFound
