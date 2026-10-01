import { api, payload } from './api';

export const categoriesService = {
  // Get all categories
  getCategories: async (params = {}) => {
    return payload(await api.get('/categories', { params }));
  },

  // Get single category by ID
  getCategory: async (id) => {
    return payload(await api.get(`/categories/${id}`));
  },

  // Get category by slug
  getCategoryBySlug: async (slug) => {
    const response = await api.get('/categories', {
      params: { slug }
    });
    return response.data.data[0];
  },
};
