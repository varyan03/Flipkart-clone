import { useNavigate } from 'react-router-dom';
import WishlistButton from './WishlistButton';

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  // Handle parsing images array properly since it's JSON string in SQLite
  let imageUrl = '';
  try {
    const images = JSON.parse(product.images);
    imageUrl = images[0] || '';
  } catch (e) {
    imageUrl = product.images; // fallback if plain string
  }

  const discountPercent = Math.round((1 - product.price / product.mrp) * 100);

  const getRatingClass = (rating) => {
    if (rating >= 4.0) return 'rating-high';
    if (rating >= 3.0) return 'rating-mid';
    return 'rating-low';
  };

  return (
    <div 
      onClick={() => navigate(`/product/${product.id}`)}
      className="animate-fade-in"
      style={{
        background: 'var(--fk-bg-card)',
        padding: '20px',
        border: '1px solid var(--fk-border)',
        borderRadius: '16px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'var(--transition-smooth)',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'transparent';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--fk-border)';
      }}
    >
      <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', padding: '10px', position: 'relative' }}>
        <img 
          src={imageUrl} 
          alt={product.name} 
          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', transition: 'transform var(--transition-smooth)' }} 
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          loading="lazy"
        />
        <WishlistButton productId={product.id} size="sm" />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ color: 'var(--fk-text-secondary)', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
          {product.brand}
        </div>
        
        <div className="line-clamp-2" style={{ color: 'var(--fk-text-primary)', fontSize: '14px', marginBottom: '6px' }}>
          {product.name}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className={`rating-badge ${getRatingClass(product.rating)}`}>
            {product.rating} ★
          </span>
          <span style={{ color: 'var(--fk-text-secondary)', fontSize: '12px' }}>
            ({product.ratingCount.toLocaleString()})
          </span>
        </div>
        
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '16px', fontWeight: 500 }}>₹{product.price.toLocaleString('en-IN')}</span>
          {discountPercent > 0 && (
            <>
              <span style={{ fontSize: '13px', color: 'var(--fk-text-secondary)', textDecoration: 'line-through' }}>
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--fk-green)', fontWeight: 500 }}>
                {discountPercent}% off
              </span>
            </>
          )}
        </div>
        
        <div style={{ fontSize: '12px', color: 'var(--fk-text-primary)', marginTop: '4px' }}>
          Free delivery
        </div>
      </div>
    </div>
  );
}
