import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productApi } from '../../api/productApi';

export default function CategoryBar() {
  const [categories, setCategories] = useState([]);
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category');
  const navigate = useNavigate();

  useEffect(() => {
    productApi.getCategories().then(res => setCategories(res.data));
  }, []);

  const handleCategoryClick = (slug) => {
    const currentSearch = searchParams.get('search');
    const params = new URLSearchParams();
    if (currentSearch) params.set('search', currentSearch);
    
    // Toggle off if same category clicked again
    if (activeCategory !== slug) {
      params.set('category', slug);
    }
    
    navigate(`/products?${params.toString()}`);
  };

  return (
    <div style={{
      height: '80px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '16px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1248px',
        width: '100%',
        padding: '0 16px',
        overflowX: 'auto',
        gap: '24px'
      }}>
        {categories.map(cat => {
          const isActive = activeCategory === cat.slug;
          return (
            <div 
              key={cat.id} 
              onClick={() => handleCategoryClick(cat.slug)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                minWidth: '64px',
                borderBottom: isActive ? '3px solid var(--fk-blue)' : '3px solid transparent',
                paddingBottom: '4px',
                marginTop: '4px'
              }}
            >
              <img 
                src={cat.imageUrl} 
                alt={cat.name} 
                style={{ width: '40px', height: '40px', objectFit: 'contain', marginBottom: '8px' }} 
              />
              <span style={{ fontSize: '12px', fontWeight: isActive ? 500 : 400, color: 'var(--fk-text-primary)' }}>
                {cat.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
