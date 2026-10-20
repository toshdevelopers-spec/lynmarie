import { useMemo } from 'react';
import { useGetProductQuery, useGetProductsQuery } from '../services/storefrontApi';

export const useProducts = (params = {}) => {
  const paramsKey = JSON.stringify(params);
  const stableParams = useMemo(() => JSON.parse(paramsKey), [paramsKey]);
  const { currentData = [], isFetching, isError, refetch } = useGetProductsQuery(stableParams);
  return { products: currentData, loading: isFetching, error: isError ? 'Failed to load products' : null, refetch };
};

export const useProduct = (id) => {
  const { data = null, isLoading, isError, refetch } = useGetProductQuery(id, { skip: !id });
  return { product: data, loading: isLoading, error: isError ? 'Failed to load product' : null, refetch };
};
