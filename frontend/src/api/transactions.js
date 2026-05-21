import api from './axios'

export const getTransactions = (params) =>
  api.get('/transactions', { params }).then((r) => r.data)

export const createTransaction = (data) =>
  api.post('/transactions', data).then((r) => r.data)

export const updateTransaction = (id, data) =>
  api.put(`/transactions/${id}`, data).then((r) => r.data)

export const deleteTransaction = (id) =>
  api.delete(`/transactions/${id}`).then((r) => r.data)

export const uploadAttachment = (id, file) => {
  const form = new FormData()
  form.append('file', file)
  return api
    .post(`/transactions/${id}/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data)
}
