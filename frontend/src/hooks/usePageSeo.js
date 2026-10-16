import { useEffect } from 'react';
import { setPageSeo } from '../utils/pageSeo';

export function usePageSeo(metadata) {
  useEffect(() => setPageSeo(metadata), [metadata]);
}
