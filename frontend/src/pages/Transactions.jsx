import { useEffect, useState, useCallback } from 'react'
import { Plus, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../api/transactions'
import { getCategories } from '../api/categories'
import useAuthStore from '../store/authStore'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import TransactionTable from '../components/transactions/TransactionTable'
import TransactionFilters from '../components/transactions/TransactionFilters'
import TransactionForm from '../components/transactions/TransactionForm'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const PER_PAGE = 10

const Transactions = () => {
  const isAdmin = useAuthStore((s) => s.isAdmin())

  const [data, setData]         = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [categories, setCats]   = useState([])

  // Modal states
  const [formOpen, setFormOpen]     = useState(false)
  const [editData, setEditData]     = useState(null)
  const [saving, setSaving]         = useState(false)
  const [deleteTarget, setDelTarget] = useState(null)
  const [deleting, setDeleting]     = useState(false)

  // Filters
  const [filters, setFilters] = useState({
    search: '', type: '', category_id: '', method: '', start_date: '', end_date: '', page: 1,
  })

  // Fetch categories once
  useEffect(() => {
    getCategories()
      .then((res) => setCats(res.data ?? []))
      .catch(() => {})
  }, [])

  // Fetch transactions on filter change
  const fetchData = useCallback(() => {
    setLoading(true)
    const params = {
      ...filters,
      page: filters.page,
      per_page: PER_PAGE,
    }
    // Remove empty params
    Object.keys(params).forEach((k) => { if (!params[k]) delete params[k] })

    getTransactions(params)
      .then((res) => {
        // PaginatedResponse: { success, message, data: [...], pagination: { total, ... } }
        setData(res.data ?? [])
        setTotal(res.pagination?.total ?? 0)
      })
      .catch(() => {
        setData([])
        setTotal(0)
      })
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Create / Update ────────────────────
  const handleSubmit = async (values) => {
    setSaving(true)
    try {
      if (editData?.id) {
        await updateTransaction(editData.id, values)
        toast.success('Transaksi berhasil diperbarui')
      } else {
        await createTransaction(values)
        toast.success('Transaksi berhasil ditambahkan')
      }
      setFormOpen(false)
      setEditData(null)
      fetchData()
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Gagal menyimpan transaksi')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ─────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteTransaction(deleteTarget.id)
      toast.success('Transaksi berhasil dihapus')
      setDelTarget(null)
      fetchData()
    } catch {
      toast.error('Gagal menghapus transaksi')
    } finally {
      setDeleting(false)
    }
  }

  const openCreate = () => { setEditData(null); setFormOpen(true) }
  const openEdit   = (tx)  => { setEditData(tx); setFormOpen(true) }

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Transaksi</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {total} transaksi ditemukan
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button id="btn-add-transaction" onClick={openCreate} icon={<Plus size={15} />}>
              Tambah Transaksi
            </Button>
          )}
        </div>
      </div>

      {/* ── Content Card ── */}
      <div className="card p-5 space-y-4">
        {/* Filters */}
        <TransactionFilters
          filters={filters}
          onChange={setFilters}
          categories={categories}
        />

        {/* Table */}
        <TransactionTable
          data={data}
          total={total}
          page={filters.page}
          perPage={PER_PAGE}
          loading={loading}
          isAdmin={isAdmin}
          onEdit={openEdit}
          onDelete={setDelTarget}
          onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
        />
      </div>

      {/* ── Add / Edit Modal ── */}
      <Modal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditData(null) }}
        title={editData ? 'Edit Transaksi' : 'Tambah Transaksi'}
        size="md"
      >
        <TransactionForm
          defaultValues={editData}
          categories={categories}
          onSubmit={handleSubmit}
          loading={saving}
        />
      </Modal>

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDelTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Transaksi?"
        message={`Transaksi "${deleteTarget?.description}" akan dihapus secara permanen.`}
      />
    </div>
  )
}

export default Transactions
