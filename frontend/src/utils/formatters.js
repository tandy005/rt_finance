/**
 * Format number to IDR currency string
 * @param {number} val
 * @param {boolean} compact - Use compact notation (1,2 Jt instead of 1.200.000)
 */
export const formatCurrency = (val, compact = false) => {
  if (val === null || val === undefined) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...(compact ? { notation: 'compact', compactDisplay: 'short' } : {}),
  }).format(val)
}

/**
 * Format date string to Indonesian locale
 * @param {string} dateStr
 * @param {'short'|'medium'|'long'} format
 */
export const formatDate = (dateStr, format = 'medium') => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const opts = {
    short:  { day: '2-digit', month: 'short' },
    medium: { day: '2-digit', month: 'short', year: 'numeric' },
    long:   { day: '2-digit', month: 'long', year: 'numeric' },
  }
  return date.toLocaleDateString('id-ID', opts[format] ?? opts.medium)
}

/**
 * Get Indonesian month name
 */
export const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export const getMonthName = (month) => MONTH_NAMES_ID[(month ?? 1) - 1] ?? ''

/**
 * Capitalize first letter
 */
export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
