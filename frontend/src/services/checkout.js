import { api, payload } from './api';
export const checkoutService = {
  createOrder: async orderData => payload(await api.post('/orders', orderData)),
  getOrder: async orderId => payload(await api.get(`/orders/${orderId}`)),
  cancelOrder: async orderId => (await api.post(`/orders/${orderId}/cancel`)).data,
  getCustomerOrders: async () => payload(await api.get('/orders')),
};
