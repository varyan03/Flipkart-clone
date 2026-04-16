import { useNavigate } from 'react-router-dom';
import WishlistButton from './WishlistButton';
import AssuredBadge from '../ui/AssuredBadge';

/**
 * Primary product representation component.
 * Supports two variants: 'DealsVariant' (compact, centered) for home deal sections
 * and the standard 'Flipkart-style' card for listing grids.
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.product - The product data object
 * @param {boolean} [props.isDealsVariant=false] - Whether to render in the compact deal style
 * @param {boolean} [props.isListingVariant=false] - Whether to render in listing-page phone template style
 */
export default function ProductCard({ product, isDealsVariant = false, isListingVariant = false }) {
  const navigate = useNavigate();

  // Handle parsing images array properly (SQLite returns string, PostgreSQL returns native array)
  const images = Array.isArray(product.images) 
    ? product.images 
    : (() => {
        try { return JSON.parse(product.images); } 
        catch { return [product.images]; }
      })();
  const imageUrl = images[0] || '';

  const discountPercent = Math.round((1 - product.price / product.mrp) * 100);
  const listingRating = Number(product.rating || 0).toFixed(1);

  if (isListingVariant) {
    return (
      <div onClick={() => navigate(`/product/${product.id}`)} className="listing-product-card">
        <div className="listing-product-image-wrap">
          <img src={imageUrl} alt={product.name} loading="lazy" />

          {product.rating && (
            <div className="listing-product-rating-pill">
              {listingRating} ★
              {product.ratingCount ? <span>| {Math.round(product.ratingCount / 1000)}k</span> : null}
            </div>
          )}

          <div className="listing-product-wishlist">
            <WishlistButton productId={product.id} />
          </div>
        </div>

        <div className="listing-product-content">
          <p className="listing-product-brand">{product.brand}</p>
          <h3 className="listing-product-title line-clamp-2">{product.name}</h3>
          <p className="listing-product-desc line-clamp-1">{product.description || product.category || 'Special product'}</p>

          <div className="listing-product-price-row">
            <span className="listing-product-discount">↓{discountPercent}%</span>
            <span className="listing-product-mrp">₹{product.mrp.toLocaleString('en-IN')}</span>
            <span className="listing-product-price">₹{product.price.toLocaleString('en-IN')}</span>
          </div>
          <p className="listing-product-offer">Special price</p>
        </div>
      </div>
    );
  }

  if (isDealsVariant) {
    return (
      <div 
        onClick={() => navigate(`/product/${product.id}`)}
        style={{
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '12px',
          height: '100%',
          textAlign: 'center'
        }}
      >
        <div style={{ width: '100%', height: '180px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={imageUrl} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </div>
        <div style={{ fontSize: '14px', color: '#212121', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
          {product.name}
        </div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#388e3c' }}>
          Min. {discountPercent}% Off
        </div>
      </div>
    );
  }

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
        textDecoration: 'none',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #f0f0f0'
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
        backgroundColor: '#fff'
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
