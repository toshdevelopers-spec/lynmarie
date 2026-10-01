import { api, payload } from './api';

const CACHE_TTL = 30_000;
const productCache = new Map();
const cached = async (key, fetcher) => {
  const hit = productCache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value;
  const value = await fetcher();
  productCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL });
  return value;
};
export const clearProductCache = () => productCache.clear();

export const productsService = {
  // Get all products with optional filters
  getProducts: async (params = {}) => {
    return cached(`list:${JSON.stringify(params)}`, async () => payload(await api.get('/products', { params })));
  },

  // Get single product by ID
  getProduct: async (id) => {
    return cached(`item:${id}`, async () => payload(await api.get(`/products/${id}`)));
  },

  // Get products by category
  getProductsByCategory: async (categoryId, params = {}) => {
    return payload(await api.get('/products', {
      params: { ...params, category: categoryId }
    }));
  },

  // Search products
  searchProducts: async (searchTerm, params = {}) => {
    return payload(await api.get('/products', {
      params: { ...params, search: searchTerm }
    }));
  },

  // Get featured products
  getFeaturedProducts: async (params = {}) => {
    return payload(await api.get('/products', {
      params: { ...params, featured: true }
    }));
  },

  // Get on-sale products
  getOnSaleProducts: async (params = {}) => {
    return payload(await api.get('/products', {
      params: { ...params, on_sale: true }
    }));
  },
};
