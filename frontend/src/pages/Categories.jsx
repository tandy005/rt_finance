import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Tag, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories'
import useAuthStore from '../store/authStore'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const schema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(50, 'Nama maksimal 50 karakter'),
})

// ── Category Form ─────────────────────────────────────────────
const CategoryForm = ({ defaultValues, onSubmit, loading }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { name: '' },
  })

  useEffect(() => {
    reset(defaultValues ?? { name: '' })
  }, [defaultValues, reset])

  return (
    <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="cat-name" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
          Nama Kategori *
        </label>
        <input
          id="cat-name"
          type="text"
          placeholder="Contoh: IPL Warga, Kebersihan..."
          {...register('name')}
          className="input-base"
          autoFocus
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <Button type="submit" loading={loading} className="w-full" size="lg">
        {defaultValues?.id ? 'Simpan Perubahan' : 'Tambah Kategori'}
      </Button>
    </form>
  )
}

// ── Color palette for category cards ──────────────────────────
const PALETTE = [
  { bg: 'bg-blue-50 dark:bg-blue-900/20',    icon: 'text-blue-500',    border: 'border-blue-100 dark:border-blue-800' },
  { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-500', border: 'border-emerald-100 dark:border-emerald-800' },
  { bg: 'bg-violet-50 dark:bg-violet-900/20',  icon: 'text-violet-500',  border: 'border-violet-100 dark:border-violet-800' },
  { bg: 'bg-amber-50 dark:bg-amber-900/20',    icon: 'text-amber-500',   border: 'border-amber-100 dark:border-amber-800' },
  { bg: 'bg-rose-50 dark:bg-rose-900/20',      icon: 'text-rose-500',    border: 'border-rose-100 dark:border-rose-800' },
  { bg: 'bg-cyan-50 dark:bg-cyan-900/20',      icon: 'text-cyan-500',    border: 'border-cyan-100 dark:border-cyan-800' },
  { bg: 'bg-indigo-50 dark:bg-indigo-900/20',  icon: 'text-indigo-500',  border: 'border-indigo-100 dark:border-indigo-800' },
  { bg: 'bg-orange-50 dark:bg-orange-900/20',  icon: 'text-orange-500',  border: 'border-orange-100 dark:border-orange-800' },
]

// ── Main Page ──────────────────────────────────────────────────
const Categories = () => {
  const isAdmin = useAuthStore((s) => s.isAdmin())

  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [formOpen, setFormOpen]     = useState(false)
  const [editData, setEditData]     = useState(null)
  const [saving, setSaving]         = useState(false)
  const [deleteTarget, setDelTarget] = useState(null)
  const [deleting, setDeleting]     = useState(false)

  const fetchAll = useCallback(() => {
    setLoading(true)
    getCategories()
      .then((res) => setCategories(res.data ?? []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleSubmit = async (values) => {
    setSaving(true)
    try {
      if (editData?.id) {
        await updateCategory(editData.id, values)
        toast.success('Kategori berhasil diperbarui')
      } else {
        await createCategory(values)
        toast.success('Kategori berhasil ditambahkan')
      }
      setFormOpen(false)
      setEditData(null)
      fetchAll()
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Gagal menyimpan kategori')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteCategory(deleteTarget.id)
      toast.success('Kategori berhasil dihapus')
      setDelTarget(null)
      fetchAll()
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Gagal menghapus kategori')
    } finally {
      setDeleting(false)
    }
  }

  const openCreate = () => { setEditData(null); setFormOpen(true) }
  const openEdit   = (cat) => { setEditData(cat); setFormOpen(true) }

  // Filter by search
  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Kategori</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {categories.length} kategori terdaftar
          </p>
        </div>
        {isAdmin && (
          <Button id="btn-add-category" onClick={openCreate} icon={<Plus size={15} />}>
            Tambah Kategori
          </Button>
        )}
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          id="cat-search"
          type="text"
          placeholder="Cari kategori..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base pl-9"
        />
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-700 mb-3" />
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-full" />
              <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-full mt-2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 flex flex-col items-center justify-center text-slate-400">
          <Tag size={40} className="mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {search ? `Tidak ada kategori untuk "${search}"` : 'Belum ada kategori'}
          </p>
          {isAdmin && !search && (
            <button
              onClick={openCreate}
              className="mt-3 text-xs text-blue-500 hover:underline"
            >
              + Tambah kategori pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((cat, idx) => {
            const colors = PALETTE[idx % PALETTE.length]
            return (
              <div
                key={cat.id}
                className={`card p-5 border ${colors.border} hover:shadow-md transition-all duration-200 group`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-2xl ${colors.bg} flex items-center justify-center`}>
                    <Tag size={20} className={colors.icon} />
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        id={`edit-cat-${cat.id}`}
                        onClick={() => openEdit(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        id={`delete-cat-${cat.id}`}
                        onClick={() => setDelTarget(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                  {cat.name}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  ID #{cat.id}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <Modal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditData(null) }}
        title={editData ? 'Edit Kategori' : 'Tambah Kategori'}
        size="sm"
      >
        <CategoryForm
          defaultValues={editData}
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
        title="Hapus Kategori?"
        message={`Kategori "${deleteTarget?.name}" akan dihapus. Transaksi yang menggunakan kategori ini mungkin terpengaruh.`}
      />
    </div>
  )
}

export default Categories
