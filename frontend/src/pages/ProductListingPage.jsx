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
    <div style={{ maxWidth: '1248px', margin: '0 auto', display: 'flex', gap: '16px', padding: '0 16px' }}>
      
      {/* Sidebar / Filters (Simplified) */}
      <div style={{
        width: '280px',
        background: '#fff',
        padding: '16px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignSelf: 'flex-start'
      }}>
        <h2 style={{ fontSize: '18px', margin: 0, fontWeight: 500, borderBottom: '1px solid var(--fk-border)', paddingBottom: '12px' }}>
          Filters
        </h2>
        
        <div>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--fk-text-secondary)', marginBottom: '8px' }}>Sort By</h3>
          <select 
            onChange={handleFilterChange} 
            value={searchParams.get('sort') || ''}
            style={{ width: '100%', padding: '8px', border: '1px solid var(--fk-border)', outline: 'none' }}
          >
            <option value="">Relevance</option>
            <option value="price_asc">Price -- Low to High</option>
            <option value="price_desc">Price -- High to Low</option>
            <option value="rating">Newest First</option>
          </select>
        </div>
      </div>

      {/* Product List Grid */}
      <div style={{ flex: 1, background: '#fff', padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
        
        <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--fk-border)', marginBottom: '16px' }}>
          <span style={{ fontWeight: 500 }}>
            {searchParams.get('search') 
              ? `Showing results for "${searchParams.get('search')}"` 
              : searchParams.get('category') 
                ? `${searchParams.get('category')} Products` 
                : 'All Products'}
          </span>
          <span style={{ color: 'var(--fk-text-secondary)', marginLeft: '8px', fontSize: '12px' }}>
            (Showing {products.length} of {data?.total} products)
          </span>
        </div>

        {products.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fk-text-secondary)' }}>
            No products found matching your criteria.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '8px',
          }}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
