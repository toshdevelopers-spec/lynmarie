import { api, payload } from './api';
import { clearProductCache } from './products';

const request = async (method, path, data) => payload(await api[method](path, data));
export const adminService = {
  dashboard: () => request('get', '/admin/dashboard'),
  cartActivity: () => request('get', '/admin/cart-activity'),
  products: () => request('get', '/admin/products'),
  createProduct: async data => { const result = await request('post', '/admin/products', data); clearProductCache(); return result; },
  updateProduct: async (id, data) => { const result = await request('patch', `/admin/products/${id}`, data); clearProductCache(); return result; },
  deleteProduct: async id => { const result = await request('delete', `/admin/products/${id}`); clearProductCache(); return result; },
  categories: () => request('get', '/admin/categories'),
  createCategory: data => request('post', '/admin/categories', data),
  updateCategory: (id, data) => request('patch', `/admin/categories/${id}`, data),
  deleteCategory: id => request('delete', `/admin/categories/${id}`),
  customers: () => request('get', '/admin/customers'),
  createUser: data => request('post', '/admin/users', data),
  updateUser: (id, data) => request('patch', `/admin/users/${id}`, data),
  deleteUser: id => request('delete', `/admin/users/${id}`),
  orders: () => request('get', '/admin/orders'),
  setOrderStatus: (id, status) => request('patch', `/admin/orders/${id}/status`, { status }),
  reviews: () => request('get', '/admin/reviews'),
  approveReview: (id, approved) => request('patch', `/admin/reviews/${id}/approval`, { approved }),
  inquiries: () => request('get', '/admin/inquiries'),
  updateInquiry: (id, status) => request('patch', `/admin/inquiries/${id}`, { status }),
};
