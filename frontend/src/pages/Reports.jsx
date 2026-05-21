import { useState, useEffect, useCallback } from 'react'
import { FileDown, FileSpreadsheet, FileText, BarChart2, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getMonthlyReport, exportExcel, exportPDF } from '../api/reports'
import Button from '../components/ui/Button'
import { MONTH_NAMES_ID, formatCurrency, formatDate } from '../utils/formatters'

// ── Period Selector ────────────────────────────────────────────
const PeriodSelector = ({ month, year, onMonthChange, onYearChange }) => {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i)

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Periode:</label>
      <select
        id="report-month"
        value={month}
        onChange={(e) => onMonthChange(Number(e.target.value))}
        className="input-base w-auto text-sm py-1.5"
      >
        {MONTH_NAMES_ID.map((name, i) => (
          <option key={i + 1} value={i + 1}>{name}</option>
        ))}
      </select>
      <select
        id="report-year"
        value={year}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className="input-base w-auto text-sm py-1.5"
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  )
}

// ── Summary Card ───────────────────────────────────────────────
const SummaryCard = ({ icon: Icon, label, value, color }) => {
  const colorMap = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    red:     'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    blue:    'bg-rt-goldlight/20 dark:bg-rt-deep/20 text-rt-primary dark:text-rt-gold',
  }
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">{value}</p>
      </div>
    </div>
  )
}

// ── Report Table ───────────────────────────────────────────────
const ReportTable = ({ transactions = [] }) => {
  if (!transactions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <BarChart2 size={40} className="mb-3 opacity-30" />
        <p className="text-sm font-medium">Tidak ada transaksi di periode ini</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            {['No', 'Tanggal', 'Jenis', 'Kategori', 'Keterangan', 'Metode', 'No. Ref', 'Jumlah'].map((h) => (
              <th key={h} className="py-2.5 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, idx) => (
            <tr
              key={tx.id}
              className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <td className="py-3 px-3 text-slate-400 text-xs">{idx + 1}</td>
              <td className="py-3 px-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {formatDate(tx.date)}
              </td>
              <td className="py-3 px-3">
                {tx.type === 'income'
                  ? <span className="badge-income">↑ Masuk</span>
                  : <span className="badge-expense">↓ Keluar</span>}
              </td>
              <td className="py-3 px-3">
                <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
                  {tx.category?.name ?? '—'}
                </span>
              </td>
              <td className="py-3 px-3 text-slate-700 dark:text-slate-200 max-w-[200px] truncate">{tx.description}</td>
              <td className="py-3 px-3">
                {tx.method === 'cash'
                  ? <span className="badge-cash">Cash</span>
                  : <span className="badge-transfer">Transfer</span>}
              </td>
              <td className="py-3 px-3 text-xs text-slate-400">{tx.reference_no || '—'}</td>
              <td className={`py-3 px-3 text-sm font-semibold whitespace-nowrap ${
                tx.type === 'income'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-500 dark:text-red-400'
              }`}>
                {tx.type === 'expense' ? '−' : '+'} {formatCurrency(tx.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────
const Reports = () => {
  const now = new Date()
  const [month, setMonth]   = useState(now.getMonth() + 1)
  const [year, setYear]     = useState(now.getFullYear())
  const [report, setReport] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [exporting, setExporting]   = useState('')  // 'excel' | 'pdf' | ''

  const fetchReport = useCallback(() => {
    setLoading(true)
    getMonthlyReport(month, year)
      .then((res) => setReport(res.data ?? res))
      .catch(() => setReport(null))
      .finally(() => setLoading(false))
  }, [month, year])

  useEffect(() => { fetchReport() }, [fetchReport])

  const handleExportExcel = async () => {
    setExporting('excel')
    try {
      await exportExcel(month, year)
      toast.success('File Excel berhasil diunduh')
    } catch {
      toast.error('Gagal mengunduh Excel')
    } finally {
      setExporting('')
    }
  }

  const handleExportPDF = async () => {
    setExporting('pdf')
    try {
      await exportPDF(month, year)
      toast.success('Laporan PDF dibuka di tab baru')
    } catch {
      toast.error('Gagal membuka PDF')
    } finally {
      setExporting('')
    }
  }

  const periodLabel = `${MONTH_NAMES_ID[month - 1]} ${year}`
  const hasData = report?.transactions?.length > 0

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Laporan</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Laporan keuangan bulanan RT
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PeriodSelector
            month={month}
            year={year}
            onMonthChange={setMonth}
            onYearChange={setYear}
          />
          <button
            id="report-refresh"
            onClick={fetchReport}
            disabled={loading}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 flex items-center gap-4 animate-pulse">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            icon={TrendingUp}
            label="Total Pemasukan"
            value={formatCurrency(report?.total_income)}
            color="emerald"
          />
          <SummaryCard
            icon={TrendingDown}
            label="Total Pengeluaran"
            value={formatCurrency(report?.total_expense)}
            color="red"
          />
          <SummaryCard
            icon={BarChart2}
            label="Saldo Bulan Ini"
            value={formatCurrency(report?.balance)}
            color="blue"
          />
        </div>
      )}

      {/* ── Table Card ── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Daftar Transaksi — {periodLabel}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {report?.transactions?.length ?? 0} transaksi
            </p>
          </div>

          {/* Export buttons */}
          <div className="flex gap-2">
            <Button
              id="btn-export-excel"
              variant="secondary"
              size="sm"
              onClick={handleExportExcel}
              loading={exporting === 'excel'}
              disabled={!hasData || !!exporting}
              icon={<FileSpreadsheet size={14} />}
            >
              Excel
            </Button>
            <Button
              id="btn-export-pdf"
              variant="secondary"
              size="sm"
              onClick={handleExportPDF}
              loading={exporting === 'pdf'}
              disabled={!hasData || !!exporting}
              icon={<FileText size={14} />}
            >
              PDF / Print
            </Button>
          </div>
        </div>

        {/* No data notice */}
        {!loading && !hasData && (
          <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm">
            <AlertCircle size={15} />
            <span>Tidak ada transaksi pada periode <strong>{periodLabel}</strong>. Tombol export tidak tersedia.</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 px-2">
                <div className="h-3 w-8 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="h-3 flex-1 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <ReportTable transactions={report?.transactions ?? []} />
        )}
      </div>
    </div>
  )
}

export default Reports
