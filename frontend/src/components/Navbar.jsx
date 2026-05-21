import { useLocation } from 'react-router-dom'
import { Menu, Sun, Moon, Bell } from 'lucide-react'
import useUIStore from '../store/uiStore'
import useAuthStore from '../store/authStore'

const pageTitles = {
  '/dashboard': { title: 'Dashboard', sub: 'Ringkasan keuangan RT' },
  '/': { title: 'Dashboard', sub: 'Ringkasan keuangan RT' },
  '/transactions': { title: 'Manajemen Transaksi', sub: 'Kelola pemasukan dan pengeluaran' },
  '/categories': { title: 'Manajemen Kategori', sub: 'Kelola kategori transaksi' },
  '/reports': { title: 'Laporan Keuangan', sub: 'Rekap dan export laporan' },
}

const Navbar = () => {
  const location = useLocation()
  const { darkMode, toggleDarkMode, toggleSidebar } = useUIStore()
  const user = useAuthStore((s) => s.user)

  const page = pageTitles[location.pathname] || { title: 'RT Finance Hub', sub: '' }

  return (
    <header className="flex-shrink-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 gap-4">
      {/* Sidebar toggle (mobile) */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden"
      >
        <Menu size={18} />
      </button>

      {/* Page title */}
      <div className="flex-1">
        <h1 className="text-base font-semibold text-slate-800 dark:text-white leading-tight">{page.title}</h1>
        {page.sub && <p className="text-xs text-slate-500 dark:text-slate-400">{page.sub}</p>}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User avatar */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
