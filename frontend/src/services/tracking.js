import { api } from './api';

const visitorKey = 'lynmarie_visitor_id';
export function getVisitorId() {
  let id = localStorage.getItem(visitorKey);
  if (!id) { id = globalThis.crypto?.randomUUID?.() || `visitor_${Date.now()}_${Math.random().toString(36).slice(2)}`; localStorage.setItem(visitorKey, id); }
  return id;
}
export function track(action, metadata = {}, productId) {
  api.post('/events', { visitorId: getVisitorId(), action, metadata, ...(productId ? { productId: Number(productId) } : {}) }).catch(() => {});
}
