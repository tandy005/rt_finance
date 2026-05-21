import api from './axios'

export const login = (credentials) =>
  api.post('/auth/login', credentials)

export const getProfile = () =>
  api.get('/auth/profile')
