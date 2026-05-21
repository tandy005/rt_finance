import { useEffect, useState } from 'react'
import { Wallet, TrendingUp, TrendingDown, Hash, Calendar } from 'lucide-react'
import { getDashboardSummary } from '../api/dashboard'
import StatCard from '../components/dashboard/StatCard'
import IncomeExpenseChart from '../components/dashboard/IncomeExpenseChart'
import CategoryPieChart from '../components/dashboard/CategoryPieChart'
import RecentTransactions from '../components/dashboard/RecentTransactions'

// Helper: convert month number to abbreviated name (id-ID)
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

const Dashboard = () => {
  const [summary, setSummary]     = useState(null)
  const [loading, setLoading]     = useState(true)

  const currentYear = new Date().getFullYear()

  useEffect(() => {
    getDashboardSummary()
      .then((res) => {
        // API: { success, message, data: { DashboardSummary } }
        setSummary(res.data ?? res)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Transform monthly_stats [{month, year, income, expense}] → chart format
  const chartData = (summary?.monthly_stats ?? []).map((row) => ({
    month: `${MONTH_NAMES[(row.month ?? 1) - 1]} ${row.year ?? ''}`.trim(),
    income:  row.income  ?? 0,
    expense: row.expense ?? 0,
  }))

  // Transform category_stats [{category_id, category_name, total}] → pie format
  const categoryData = (summary?.category_stats ?? []).map((c) => ({
    name:  c.category_name,
    value: c.total,
  }))

  // Recent transactions
  const recentTx = summary?.recent_transactions ?? []

  // Total transaction count (approx from recent or from summary if available)
  const txCount = summary?.transaction_count ?? null

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Ringkasan keuangan RT —{' '}
            {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
          <Calendar size={14} />
          <span>Tahun {currentYear}</span>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Saldo Saat Ini"
          value={summary?.current_balance}
          icon={Wallet}
          color="blue"
          trendLabel="Total kas berjalan"
          trend="neutral"
          loading={loading}
        />
        <StatCard
          title="Total Pemasukan"
          value={summary?.total_income}
          icon={TrendingUp}
          color="emerald"
          trendLabel="Semua periode"
          trend="up"
          loading={loading}
        />
        <StatCard
          title="Total Pengeluaran"
          value={summary?.total_expense}
          icon={TrendingDown}
          color="red"
          trendLabel="Semua periode"
          trend="down"
          loading={loading}
        />
        <StatCard
          title="Bulan Ini — Masuk"
          value={summary?.monthly_income}
          icon={Hash}
          color="violet"
          trendLabel={`Pengeluaran: Rp ${new Intl.NumberFormat('id-ID').format(summary?.monthly_expense ?? 0)}`}
          trend="neutral"
          loading={loading}
        />
      </div>

      {/* ── Charts Row ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart — spans 2 cols */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Pemasukan vs Pengeluaran
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">6 bulan terakhir</p>
            </div>
          </div>
          <IncomeExpenseChart data={chartData} loading={loading} />
        </div>

        {/* Pie chart */}
        <div className="card p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Distribusi Pengeluaran
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Top 5 kategori</p>
          </div>
          <CategoryPieChart data={categoryData} loading={loading} />
        </div>
      </div>

      {/* ── Recent Transactions ─────────────────── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Transaksi Terbaru
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">5 transaksi terakhir</p>
          </div>
        </div>
        <RecentTransactions data={recentTx} loading={loading} />
      </div>
    </div>
  )
}

export default Dashboard
