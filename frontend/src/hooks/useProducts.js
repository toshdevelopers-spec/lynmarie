import { useMemo } from 'react';
import { useGetProductQuery, useGetProductsQuery } from '../services/storefrontApi';

export const useProducts = (params = {}) => {
  const paramsKey = JSON.stringify(params);
  const stableParams = useMemo(() => JSON.parse(paramsKey), [paramsKey]);
  const { data = [], isLoading, isError, refetch } = useGetProductsQuery(stableParams);
  return { products: data, loading: isLoading, error: isError ? 'Failed to load products' : null, refetch };
};

export const useProduct = (id) => {
  const { data = null, isLoading, isError, refetch } = useGetProductQuery(id, { skip: !id });
  return { product: data, loading: isLoading, error: isError ? 'Failed to load product' : null, refetch };
};
