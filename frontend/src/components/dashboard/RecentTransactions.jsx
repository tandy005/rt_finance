import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const formatCurrency = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val ?? 0)

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const RecentTransactions = ({ data = [], loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-full" />
              <div className="h-2.5 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
        <svg className="w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">Belum ada transaksi</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {data.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          {/* Type indicator */}
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              tx.type === 'income'
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            }`}
          >
            {tx.type === 'income' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
              {tx.description}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {tx.category?.name ?? '—'} · {formatDate(tx.date)}
            </p>
          </div>

          {/* Amount */}
          <p
            className={`text-sm font-semibold flex-shrink-0 ${
              tx.type === 'income'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-500 dark:text-red-400'
            }`}
          >
            {tx.type === 'expense' ? '− ' : '+ '}
            {formatCurrency(tx.amount)}
          </p>
        </div>
      ))}

      <div className="pt-2">
        <Link
          to="/transactions"
          className="flex items-center justify-center gap-1.5 text-xs font-medium text-rt-primary dark:text-rt-gold hover:underline"
        >
          Lihat semua transaksi <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  )
}

export default RecentTransactions
