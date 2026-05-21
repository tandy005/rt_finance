const Skeleton = ({ className = '', lines = 1 }) => {
  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg ${
              i === lines - 1 ? 'w-3/4' : 'w-full'
            } h-4 ${className}`}
          />
        ))}
      </div>
    )
  }
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg ${className}`} />
  )
}

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-xl" />
    </div>
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-3 w-20" />
  </div>
)

export const TableSkeleton = ({ rows = 5, cols = 6 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} className={`h-4 flex-1 ${j === 0 ? 'max-w-[60px]' : ''}`} />
        ))}
      </div>
    ))}
  </div>
)

export default Skeleton
