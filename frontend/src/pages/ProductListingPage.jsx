import { useProducts } from '../hooks/useProducts';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';

export default function ProductListingPage() {
  const { data, loading, error } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>Loading products...</div>;
  }

  if (error) {
    return <div style={{ padding: '24px', color: 'red' }}>Error: {error}</div>;
  }

  const products = data?.products || [];

  const handleFilterChange = (e) => {
    const value = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('sort', value);
    } else {
      newParams.delete('sort');
    }
    setSearchParams(newParams);
  };

  return (
    <div className="listing-page">
      
      {/* Sidebar / Filters (Simplified) */}
      <div className="listing-filters">
        <h2 className="listing-filters-title">
          Filters
        </h2>
        
        <div className="listing-sort-group">
          <h3>Sort By</h3>
          <select 
            onChange={handleFilterChange} 
            value={searchParams.get('sort') || ''}
            className="listing-sort-select"
          >
            <option value="">Relevance</option>
            <option value="price_asc">Price -- Low to High</option>
            <option value="price_desc">Price -- High to Low</option>
            <option value="rating">Newest First</option>
          </select>
        </div>
      </div>

      {/* Product List Grid */}
      <div className="listing-results">
        
        <div className="listing-results-head">
          <span className="listing-results-title">
            {searchParams.get('search') 
              ? `Showing results for "${searchParams.get('search')}"` 
              : searchParams.get('category') 
                ? `${searchParams.get('category')} Products` 
                : 'All Products'}
          </span>
          <span className="listing-results-meta">
            (Showing {products.length} of {data?.total} products)
          </span>
        </div>

        {products.length === 0 ? (
          <div className="listing-no-results">
            No products found matching your criteria.
          </div>
        ) : (
          <div className="listing-products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} isListingVariant />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
