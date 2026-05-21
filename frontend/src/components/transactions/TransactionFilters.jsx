import { Search, Filter, X, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const TransactionFilters = ({ filters, onChange, categories = [] }) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const set = (key, val) => onChange({ ...filters, [key]: val, page: 1 })

  const activeCount = [
    filters.type,
    filters.category_id,
    filters.method,
    filters.start_date,
    filters.end_date,
  ].filter(Boolean).length

  const clearAll = () =>
    onChange({ search: '', type: '', category_id: '', method: '', start_date: '', end_date: '', page: 1 })

  return (
    <div className="space-y-3">
      {/* Search + toggle */}
      <div className="flex gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="tx-search"
            type="text"
            placeholder="Cari transaksi..."
            value={filters.search ?? ''}
            onChange={(e) => set('search', e.target.value)}
            className="input-base pl-9"
          />
        </div>

        {/* Advanced filter toggle */}
        <button
          id="tx-filter-toggle"
          onClick={() => setShowAdvanced((v) => !v)}
          className={`
            flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all
            ${showAdvanced || activeCount > 0
              ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }
          `}
        >
          <Filter size={14} />
          Filter
          {activeCount > 0 && (
            <span className="w-4 h-4 text-xs flex items-center justify-center bg-blue-600 text-white rounded-full">
              {activeCount}
            </span>
          )}
          <ChevronDown size={13} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {activeCount > 0 && (
          <button
            id="tx-filter-clear"
            onClick={clearAll}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Hapus semua filter"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 animate-in">
          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tipe</label>
            <select
              id="tx-filter-type"
              value={filters.type ?? ''}
              onChange={(e) => set('type', e.target.value)}
              className="input-base text-sm"
            >
              <option value="">Semua</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Kategori</label>
            <select
              id="tx-filter-category"
              value={filters.category_id ?? ''}
              onChange={(e) => set('category_id', e.target.value)}
              className="input-base text-sm"
            >
              <option value="">Semua</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Method */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Metode</label>
            <select
              id="tx-filter-method"
              value={filters.method ?? ''}
              onChange={(e) => set('method', e.target.value)}
              className="input-base text-sm"
            >
              <option value="">Semua</option>
              <option value="cash">Cash</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          {/* Start date */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Dari Tanggal</label>
            <input
              id="tx-filter-start"
              type="date"
              value={filters.start_date ?? ''}
              onChange={(e) => set('start_date', e.target.value)}
              className="input-base text-sm"
            />
          </div>

          {/* End date */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Sampai Tanggal</label>
            <input
              id="tx-filter-end"
              type="date"
              value={filters.end_date ?? ''}
              onChange={(e) => set('end_date', e.target.value)}
              className="input-base text-sm"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionFilters
