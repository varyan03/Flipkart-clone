import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../api/productApi';

/**
 * Custom hook for managing product data lifecycle.
 * Syncs URL search parameters with backend API calls to provide paginated,
 * filtered, and sorted product data with loading/error states.
 * 
 * @returns {Object} { data: { products: Array, total: number, ... }, loading: boolean, error: string|null }
 */
export function useProducts() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const params = Object.fromEntries(searchParams);
    
    setLoading(true);
    setError(null);
    
    // Add debounce locally using a small timeout if needed, but for simplicity we rely on 
    // the query parameter changes. The actual search input triggers navigate.
    productApi.getProducts(params)
      .then(res => {
        if (isMounted) setData(res.data);
      })
      .catch(err => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [searchParams.toString()]); // Only re-runs when params change

  return { data, loading, error };
}
