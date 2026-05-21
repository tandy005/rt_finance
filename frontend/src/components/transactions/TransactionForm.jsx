import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../ui/Button'

const schema = z.object({
  date:        z.string().min(1, 'Tanggal wajib diisi'),
  description: z.string().min(3, 'Deskripsi minimal 3 karakter'),
  type:        z.enum(['income', 'expense'], { required_error: 'Tipe wajib dipilih' }),
  category_id: z.coerce.number({ invalid_type_error: 'Kategori wajib dipilih' }).positive('Kategori wajib dipilih'),
  amount:      z.coerce.number({ invalid_type_error: 'Jumlah wajib diisi' }).positive('Jumlah harus lebih dari 0'),
  method:      z.enum(['cash', 'transfer'], { required_error: 'Metode wajib dipilih' }),
  reference_no: z.string().optional(),
})

const TransactionForm = ({ defaultValues, categories = [], onSubmit, loading }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      date: new Date().toISOString().slice(0, 10),
      type: 'expense',
      method: 'cash',
    },
  })

  // Sync external defaultValues (edit mode)
  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        date: defaultValues.date ? defaultValues.date.slice(0, 10) : '',
        category_id: defaultValues.category?.id ?? defaultValues.category_id ?? '',
      })
    }
  }, [defaultValues, reset])

  const Field = ({ label, id, error, children }) => (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )

  return (
    <form id="transaction-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Date */}
      <Field label="Tanggal *" id="tx-date" error={errors.date?.message}>
        <input id="tx-date" type="date" {...register('date')} className="input-base" />
      </Field>

      {/* Description */}
      <Field label="Keterangan *" id="tx-description" error={errors.description?.message}>
        <input
          id="tx-description"
          type="text"
          placeholder="Contoh: Pembayaran IPL Blok A"
          {...register('description')}
          className="input-base"
        />
      </Field>

      {/* Type + Method */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipe *" id="tx-type" error={errors.type?.message}>
          <select id="tx-type" {...register('type')} className="input-base">
            <option value="">Pilih tipe...</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
        </Field>

        <Field label="Metode *" id="tx-method" error={errors.method?.message}>
          <select id="tx-method" {...register('method')} className="input-base">
            <option value="">Pilih metode...</option>
            <option value="cash">Cash</option>
            <option value="transfer">Transfer</option>
          </select>
        </Field>
      </div>

      {/* Category */}
      <Field label="Kategori *" id="tx-category" error={errors.category_id?.message}>
        <select id="tx-category" {...register('category_id')} className="input-base">
          <option value="">Pilih kategori...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>

      {/* Amount */}
      <Field label="Jumlah (Rp) *" id="tx-amount" error={errors.amount?.message}>
        <input
          id="tx-amount"
          type="number"
          min="0"
          step="1000"
          placeholder="0"
          {...register('amount')}
          className="input-base"
        />
      </Field>

      {/* Reference no */}
      <Field label="No. Referensi (opsional)" id="tx-ref" error={errors.reference_no?.message}>
        <input
          id="tx-ref"
          type="text"
          placeholder="Nomor bukti / nota"
          {...register('reference_no')}
          className="input-base"
        />
      </Field>

      <div className="pt-1">
        <Button type="submit" loading={loading} className="w-full" size="lg">
          {defaultValues?.id ? 'Simpan Perubahan' : 'Tambah Transaksi'}
        </Button>
      </div>
    </form>
  )
}

export default TransactionForm
