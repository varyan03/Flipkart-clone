import { useNavigate } from 'react-router-dom';
import WishlistButton from './WishlistButton';
import AssuredBadge from '../ui/AssuredBadge';

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

  return (
    <div 
      onClick={() => navigate(`/product/${product.id}`)}
      style={{
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease-in-out',
        position: 'relative',
        padding: '0 0 16px 0',
        height: '100%',
        textDecoration: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 3px 16px 0 rgba(0,0,0,0.11)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Wishlist Button in Top Right */}
      <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
        <WishlistButton productId={product.id} />
      </div>

      {/* Product Image Container */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        paddingTop: '133%', // 3:4 Aspect Ratio
        backgroundColor: '#fff',
        borderBottom: '1px solid #f0f0f0' 
      }}>
        <img 
          src={imageUrl} 
          alt={product.name} 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: '12px'
          }} 
          loading="lazy"
        />
      </div>
      
      {/* Content Section */}
      <div style={{ padding: '8px 16px 0' }}>
        {/* Brand Name */}
        <div style={{ 
          fontSize: '14px', 
          fontWeight: 700, 
          color: '#878787', 
          marginBottom: '4px',
          textTransform: 'uppercase'
        }}>
          {product.brand}
        </div>
        
        {/* Product Title + Assured Badge */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '8px',
          height: '18px',
          overflow: 'hidden'
        }}>
          <span style={{ 
            fontSize: '14px', 
            color: '#212121', 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            flex: 1
          }}>
            {product.name}
          </span>
          <AssuredBadge height={14} />
        </div>
        
        {/* Price Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ 
            fontSize: '16px', 
            fontWeight: 700, 
            color: '#212121' 
          }}>
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          
          {discountPercent > 0 && (
            <>
              <span style={{ 
                fontSize: '14px', 
                color: '#878787', 
                textDecoration: 'line-through' 
              }}>
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
              <span style={{ 
                fontSize: '14px', 
                color: '#388e3c', 
                fontWeight: 700 
              }}>
                {discountPercent}% off
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
