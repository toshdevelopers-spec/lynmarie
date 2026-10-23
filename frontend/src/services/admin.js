import { api, payload } from './api';
import { clearProductCache } from './products';

const request = async (method, path, data) => payload(await api[method](path, data));
const cloudinaryDeliveryUrl = (url, transformation) => {
  const marker = '/upload/';
  const index = url.indexOf(marker);
  if (!url.startsWith('https://res.cloudinary.com/') || index < 0) throw new Error('Cloudinary returned an invalid image URL');
  return `${url.slice(0, index + marker.length)}${transformation}/${url.slice(index + marker.length)}`;
};

export const adminService = {
  dashboard: () => request('get', '/admin/dashboard'),
  cartActivity: () => request('get', '/admin/cart-activity'),
  products: () => request('get', '/admin/products'),
  newArrivals: () => request('get', '/admin/new-arrivals'),
  saveNewArrivals: ids => request('put', '/admin/new-arrivals', { ids }),
  uploadProductImage: async file => {
    if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image`);
    if (file.size > 20 * 1024 * 1024) throw new Error(`${file.name} exceeds the 20 MB upload limit`);
    const signed = await request('post', '/admin/product-image-signature', {});
    const form = new FormData();
    form.append('file', file);
    form.append('api_key', signed.apiKey);
    form.append('timestamp', String(signed.timestamp));
    form.append('folder', signed.folder);
    form.append('signature', signed.signature);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`, { method: 'POST', body: form });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || `Cloudinary upload failed for ${file.name}`);
    return {
      url: cloudinaryDeliveryUrl(result.secure_url, 'c_limit,w_2000,q_auto:best,f_auto'),
      thumbnailUrl: cloudinaryDeliveryUrl(result.secure_url, 'c_fill,w_600,h_800,q_auto:best,f_auto'),
    };
  },
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
  sendUserPasswordReset: id => request('post', `/admin/users/${id}/password-reset`, {}),
  deleteUser: id => request('delete', `/admin/users/${id}`),
  orders: () => request('get', '/admin/orders'),
  setOrderStatus: (id, status) => request('patch', `/admin/orders/${id}/status`, { status }),
  reviewOrderPayment: (id, data) => request('patch', `/admin/orders/${id}/payment-review`, { decision: 'APPROVE', ...data }),
  assignDeliveryRider: (id, riderId) => request('patch', `/admin/orders/${id}/delivery-rider`, { riderId }),
  posInventory: () => request('get', '/pos/inventory'),
  posSales: from => request('get', `/pos/sales?from=${encodeURIComponent(from)}`),
  createPosSale: data => request('post', '/pos/sales', data),
  collectPickup: (id, data) => request('post', `/pos/pickups/${id}/collect`, data),
  confirmDeliveryPayment: (id, amountReceived) => request('post', `/pos/deliveries/${id}/payment-received`, { amountReceived }),
  reviews: () => request('get', '/admin/reviews'),
  approveReview: (id, approved) => request('patch', `/admin/reviews/${id}/approval`, { approved }),
  deleteReview: id => request('delete', `/admin/reviews/${id}`),
  inquiries: () => request('get', '/admin/inquiries'),
  updateInquiry: (id, status) => request('patch', `/admin/inquiries/${id}`, { status }),
};
