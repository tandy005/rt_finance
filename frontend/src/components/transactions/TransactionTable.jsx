import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
} from '@tanstack/react-table'
import { useMemo } from 'react'
import { Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

const formatCurrency = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val ?? 0)

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

const TransactionTable = ({
  data = [],
  total = 0,
  page = 1,
  perPage = 10,
  loading,
  isAdmin,
  onEdit,
  onDelete,
  onPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / perPage))

  const columns = useMemo(
    () => [
      {
        id: 'date',
        header: 'Tanggal',
        accessorKey: 'date',
        cell: (info) => (
          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            {formatDate(info.getValue())}
          </span>
        ),
      },
      {
        id: 'description',
        header: 'Keterangan',
        accessorKey: 'description',
        cell: (info) => (
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 line-clamp-1">
              {info.getValue()}
            </p>
            {info.row.original.reference_no && (
              <p className="text-xs text-slate-400 mt-0.5">Ref: {info.row.original.reference_no}</p>
            )}
          </div>
        ),
      },
      {
        id: 'category',
        header: 'Kategori',
        accessorKey: 'category',
        cell: (info) => (
          <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
            {info.getValue()?.name ?? '—'}
          </span>
        ),
      },
      {
        id: 'type',
        header: 'Tipe',
        accessorKey: 'type',
        cell: (info) =>
          info.getValue() === 'income' ? (
            <span className="badge-income">↑ Masuk</span>
          ) : (
            <span className="badge-expense">↓ Keluar</span>
          ),
      },
      {
        id: 'method',
        header: 'Metode',
        accessorKey: 'method',
        cell: (info) =>
          info.getValue() === 'cash' ? (
            <span className="badge-cash">Cash</span>
          ) : (
            <span className="badge-transfer">Transfer</span>
          ),
      },
      {
        id: 'amount',
        header: 'Jumlah',
        accessorKey: 'amount',
        cell: (info) => {
          const type = info.row.original.type
          return (
            <span
              className={`text-sm font-semibold ${
                type === 'income'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-500 dark:text-red-400'
              }`}
            >
              {type === 'expense' ? '−' : '+'} {formatCurrency(info.getValue())}
            </span>
          )
        },
      },
      ...(isAdmin
        ? [
            {
              id: 'actions',
              header: '',
              cell: (info) => (
                <div className="flex items-center gap-1 justify-end">
                  <button
                    id={`edit-tx-${info.row.original.id}`}
                    onClick={() => onEdit?.(info.row.original)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    id={`delete-tx-${info.row.original.id}`}
                    onClick={() => onDelete?.(info.row.original)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ),
            },
          ]
        : []),
    ],
    [isAdmin, onEdit, onDelete]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        {Array.from({ length: perPage }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 px-4">
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="h-3 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <svg className="w-14 h-14 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm font-medium">Tidak ada transaksi ditemukan</p>
        <p className="text-xs mt-1">Coba ubah filter atau tambah transaksi baru</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="py-2.5 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 whitespace-nowrap"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-3 px-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Menampilkan {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} dari{' '}
          <span className="font-medium">{total}</span> transaksi
        </p>
        <div className="flex items-center gap-1">
          <PagBtn icon={<ChevronsLeft size={14} />} onClick={() => onPageChange(1)} disabled={page === 1} id="page-first" />
          <PagBtn icon={<ChevronLeft size={14} />}  onClick={() => onPageChange(page - 1)} disabled={page === 1} id="page-prev" />
          <span className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
            {page} / {totalPages}
          </span>
          <PagBtn icon={<ChevronRight size={14} />} onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} id="page-next" />
          <PagBtn icon={<ChevronsRight size={14} />} onClick={() => onPageChange(totalPages)} disabled={page >= totalPages} id="page-last" />
        </div>
      </div>
    </div>
  )
}

const PagBtn = ({ icon, onClick, disabled, id }) => (
  <button
    id={id}
    onClick={onClick}
    disabled={disabled}
    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
  >
    {icon}
  </button>
)

export default TransactionTable
