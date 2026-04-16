import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi';
import useCartStore from '../store/cartStore';
import ImageCarousel from '../components/product/ImageCarousel';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    productApi.getProductById(id)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>;
  if (!product) return <div style={{ padding: '24px', textAlign: 'center' }}>Product not found</div>;

  const images = Array.isArray(product.images) 
    ? product.images 
    : (() => { try { return JSON.parse(product.images); } catch(e) { return [product.images]; } })();

  const specs = (typeof product.specs === 'object' && product.specs !== null)
    ? product.specs
    : (() => { try { return JSON.parse(product.specs); } catch(e) { return {}; } })();

  const discountPercent = Math.round((1 - product.price / product.mrp) * 100);

  const handleAddToCart = async () => {
    setAdding(true);
    await addItem(product.id);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = async () => {
    await addItem(product.id);
    navigate('/cart');
  };

  return (
    <div className="pd-page">
      
      {/* Left Column (Images & Actions) */}
      <div className="pd-left-col">
        <ImageCarousel images={images} />
        
        <div className="pd-action-row">
          <button 
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            className="pd-action-btn pd-add-btn"
            style={{ background: added ? 'var(--fk-green)' : 'var(--fk-orange)' }}
          >
            {adding ? 'Adding...' : added ? '✓ Added to Cart' : '🛒 ADD TO CART'}
          </button>
          
          <button 
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="pd-action-btn pd-buy-btn"
          >
            ⚡ BUY NOW
          </button>
        </div>
      </div>

      {/* Right Column (Details) */}
      <div className="pd-right-col">
        <div className="pd-breadcrumb">
          Home {'>'} {product.category?.name} {'>'} {product.brand}
        </div>
        
        <h1 className="pd-title">
          {product.name}
        </h1>
        
        <div className="pd-rating-row">
          <span className="rating-badge rating-high">{product.rating} ★</span>
          <span className="pd-rating-meta">
            {product.ratingCount.toLocaleString()} Ratings & Reviews
          </span>
        </div>

        <div className="pd-special-price">
          Special price
        </div>
        
        <div className="pd-price-row">
          <span className="pd-price">₹{product.price.toLocaleString('en-IN')}</span>
          <span className="pd-mrp">
            ₹{product.mrp.toLocaleString('en-IN')}
          </span>
          <span className="pd-discount">
            {discountPercent}% off
          </span>
        </div>

        {/* Stock Status */}
        <div className="pd-stock" style={{
          color: product.stock === 0 ? 'var(--fk-red)' : product.stock <= 5 ? 'var(--fk-amber)' : 'var(--fk-green)' }}>
          {product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? `Hurry, Only ${product.stock} left!` : 'In Stock'}
        </div>

        {/* Specs Highlights */}
        <div className="pd-specs-wrap">
          <div className="pd-spec-row">
            <div className="pd-spec-label">Highlights</div>
            <ul className="pd-spec-list">
              {Object.entries(specs).map(([key, val]) => (
                <li key={key}>{key}: {val}</li>
              ))}
            </ul>
          </div>

          <div className="pd-spec-row">
            <div className="pd-spec-label">Description</div>
            <div className="pd-description-text">
              {product.description}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
