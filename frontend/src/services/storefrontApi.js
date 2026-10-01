import { createApi } from '@reduxjs/toolkit/query/react';
import { api as axios } from './api';

const axiosBaseQuery = async ({ url, method = 'get', params, data }) => {
  try {
    const response = await axios({ url, method, params, data });
    return { data: response.data };
  } catch (error) {
    return {
      error: {
        status: error.response?.status ?? 'FETCH_ERROR',
        data: error.response?.data ?? error.message,
      },
    };
  }
};

export const storefrontApi = createApi({
  reducerPath: 'storefrontApi',
  baseQuery: axiosBaseQuery,
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: 60,
  endpoints: builder => ({
    getProducts: builder.query({
      query: params => ({ url: '/products', params }),
      transformResponse: response => response.data ?? [],
    }),
    getProduct: builder.query({
      query: id => ({ url: `/products/${id}` }),
      transformResponse: response => response.data,
    }),
    getCategories: builder.query({
      query: () => ({ url: '/categories' }),
      transformResponse: response => response.data ?? [],
    }),
    getReviews: builder.query({
      query: () => ({ url: '/reviews' }),
      transformResponse: response => response.data ?? [],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetCategoriesQuery,
  useGetReviewsQuery,
} = storefrontApi;
