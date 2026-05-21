import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react'

const formatCurrency = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val ?? 0)

const StatCard = ({ title, value, icon: Icon, color, trend, trendLabel, loading }) => {
  const colorMap = {
    blue:    { bg: 'bg-blue-50 dark:bg-blue-900/20',    icon: 'text-blue-600 dark:text-blue-400',    border: 'border-blue-100 dark:border-blue-800' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-800' },
    red:     { bg: 'bg-red-50 dark:bg-red-900/20',      icon: 'text-red-600 dark:text-red-400',      border: 'border-red-100 dark:border-red-800' },
    amber:   { bg: 'bg-amber-50 dark:bg-amber-900/20',  icon: 'text-amber-600 dark:text-amber-400',  border: 'border-amber-100 dark:border-amber-800' },
    violet:  { bg: 'bg-violet-50 dark:bg-violet-900/20',icon: 'text-violet-600 dark:text-violet-400',border: 'border-violet-100 dark:border-violet-800' },
  }
  const c = colorMap[color] ?? colorMap.blue

  if (loading) {
    return (
      <div className="card p-5 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="h-7 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg mt-3" />
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded-full mt-2" />
          </div>
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="card p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-white leading-tight truncate">
            {formatCurrency(value)}
          </p>
          {trendLabel && (
            <div className="mt-1.5 flex items-center gap-1">
              {trend === 'up' && <ArrowUpRight size={13} className="text-emerald-500" />}
              {trend === 'down' && <ArrowDownRight size={13} className="text-red-500" />}
              {trend === 'neutral' && <TrendingUp size={13} className="text-slate-400" />}
              <span className="text-xs text-slate-500 dark:text-slate-400">{trendLabel}</span>
            </div>
          )}
        </div>
        <div className={`flex-shrink-0 w-12 h-12 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon size={22} className={c.icon} />
        </div>
      </div>
    </div>
  )
}

export default StatCard
