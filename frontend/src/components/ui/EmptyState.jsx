import { FileSearch } from 'lucide-react'

const EmptyState = ({
  icon: Icon = FileSearch,
  title = 'Tidak ada data',
  description = 'Belum ada data yang tersedia.',
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
      <Icon size={28} className="text-slate-400" />
    </div>
    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-4">{description}</p>
    {action && action}
  </div>
)

export default EmptyState
