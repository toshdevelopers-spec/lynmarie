import { api, payload } from './api';
export const checkoutService = {
  createOrder: async orderData => payload(await api.post('/orders', orderData)),
  getOrder: async orderId => payload(await api.get(`/orders/${orderId}`)),
  getCustomerOrders: async () => payload(await api.get('/orders')),
};
