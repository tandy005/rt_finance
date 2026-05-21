import api from './axios'

export const getDashboardSummary = () =>
  api.get('/dashboard/summary').then((r) => r.data)

export const getMonthlyReport = (params) =>
  api.get('/reports/monthly', { params }).then((r) => r.data)
