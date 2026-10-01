import { api, payload } from './api';
export const authService = {
  login: async (username, password) => { const r = await api.post('/auth/login', { email: username, password }); return { ...r.data.data, token: r.data.token }; },
  register: async (email, password, firstName, lastName) => { const r = await api.post('/auth/register', { email, password, firstName, lastName }); return { ...r.data.data, token: r.data.token }; },
  getCurrentCustomer: async () => payload(await api.get('/auth/me')),
  updateCustomer: async data => payload(await api.patch('/customers/me', data)),
  logout: async () => ({ success: true }),
  forgotPassword: async email => (await api.post('/auth/forgot-password', { email })).data,
  resetPassword: async (token, password) => (await api.post('/auth/reset-password', { token, password })).data,
  changePassword: async data => (await api.post('/customers/me/password', data)).data,
  getAddresses: async () => payload(await api.get('/customers/me/addresses')),
  saveAddress: async (type, data) => payload(await api.put(`/customers/me/addresses/${type}`, data)),
};
