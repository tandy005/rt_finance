import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#f43f5e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
]

const formatCurrency = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val ?? 0)

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 dark:text-slate-200">{d.name}</p>
      <p className="text-slate-500 dark:text-slate-400 mt-1">
        {formatCurrency(d.value)}
      </p>
      <p className="text-xs text-slate-400 mt-0.5">
        {(d.payload.percent * 100).toFixed(1)}% dari total
      </p>
    </div>
  )
}

const RADIAN = Math.PI / 180
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

const CategoryPieChart = ({ data = [], loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-40 h-40 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Tidak ada data kategori
      </div>
    )
  }

  // Compute percent for tooltip
  const total = data.reduce((s, d) => s + d.value, 0)
  const enriched = data.map((d) => ({ ...d, percent: d.value / total }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={enriched}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={100}
          dataKey="value"
          strokeWidth={2}
          stroke="transparent"
        >
          {enriched.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
          formatter={(value) => (
            <span className="text-slate-600 dark:text-slate-300">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default CategoryPieChart
