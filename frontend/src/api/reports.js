import api from './axios'

export const getMonthlyReport = (month, year) =>
  api.get('/reports/monthly', { params: { month, year } }).then((r) => r.data)

// Trigger file download via browser
const triggerDownload = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportExcel = (month, year) => {
  const params = new URLSearchParams({ month, year })
  const token = JSON.parse(localStorage.getItem('rt-finance-auth') || '{}')?.state?.token ?? ''
  // Use fetch to handle binary response with auth header
  return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/reports/export/excel?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error('Export gagal')
      return res.blob()
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob)
      const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
      triggerDownload(url, `laporan-keuangan-${monthNames[month - 1]}-${year}.xlsx`)
      URL.revokeObjectURL(url)
    })
}

export const exportPDF = (month, year) => {
  const params = new URLSearchParams({ month, year })
  const token = JSON.parse(localStorage.getItem('rt-finance-auth') || '{}')?.state?.token ?? ''
  return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/reports/export/pdf?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error('Export gagal')
      return res.blob()
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    })
}
